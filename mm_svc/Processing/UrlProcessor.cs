using mm_global;
using mm_svc.InternalNlp;
using mm_svc.InternalNlp.Utils;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.Correlations;
using mm_global.Extensions;
using Newtonsoft.Json;
using mm_svc.Terms;

namespace mm_svc
{
    /// <summary>
    /// Calculates topic specific scores (TSS) for url_terms
    /// </summary>
    public class UrlProcessor
    {
        // TODO: record calais_nlp & rawText for dung's node.js wiki crawler

        //
        // (1) Processes and stores Url TSS and returns url_terms with TSS scores
        // (2) Maps and stores high TSS terms to wiki (golden) terms
        // (3) Calculates and stores paths to root, for mapped wiki terms
        // (4) Processes paths to root to produce suggested parents, for mapped wiki terms
        //
        // returns all from store (if present) unless reprocess_tss == true
        //
        public List<url_term> ProcessUrl(long url_id, bool reprocess = false, bool run_l2_boost = false)
        {
            using (var db = mm02Entities.Create())
            {
                // get url - tracking ref
                var url = db.urls.Include("url_term").Where(p => p.id == url_id).SingleOrDefault();
                if (url == null) return null;

                // url already processed? return unless reprocessing
                if (url.processed_at_utc != null && reprocess == false)
                    goto ret1; 

                dynamic meta_all = JsonConvert.DeserializeObject(url.meta_all);

                // extract meta
                if (!string.IsNullOrEmpty(url.meta_all) && meta_all != null) {
                    var nlp_suitability_score = meta_all.nlp_suitability_score;
                    var img_url = meta_all.ip_thumbnail_url
                               ?? meta_all.og_image
                               ?? meta_all.tw_image_src
                               ?? meta_all.tw_image;
                    if (img_url != null && !string.IsNullOrEmpty(img_url.ToString()) && img_url.ToString().Length <= 512)
                        url.img_url = img_url;
                    url.nlp_suitability_score = nlp_suitability_score;
                    db.SaveChangesTraceValidationErrors();
                }

                // get underlying Calais url-terms - tracking references
                var l1_calais_terms = db.url_term
                                        .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                        .Where(p => p.url_id == url.id 
                                              && (p.term.term_type_id == (int)g.TT.CALAIS_ENTITY 
                                               || p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG
                                               || p.term.term_type_id == (int)g.TT.CALAIS_TOPIC)
                                              && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();

                // calc TSS values for Calais terms
                new TssProducer().CalcTSS(meta_all, l1_calais_terms, run_l2_boost);

                l1_calais_terms.ForEach(p => p.candidate_reason = p.candidate_reason.TruncateMax(256));
                l1_calais_terms.ForEach(p => p.S = p.S_CALC);

                // map & store wiki golden_terms
                MapWikiGoldenTerms(l1_calais_terms.Where(p => p.tss_norm > 0.1), url);

                // calc & store all paths to root for mapped golden terms
                var wiki_url_terms = url.url_term.Where(p => p.wiki_S != null);
                Parallel.ForEach(wiki_url_terms, p => GoldenPaths.RecordPathsToRoot(p.term_id));

                // calc & store suggested parents
                Parallel.ForEach(wiki_url_terms, p => GoldenParents.RecordSuggestedParents(p.term_id, reprocess));

                url.processed_at_utc = DateTime.UtcNow;
                db.SaveChangesTraceValidationErrors(); // save url_term tss, tss_norm & reason, url processed & mapped wiki terms

ret1:
                var qry = db.url_term.Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                     .Include("term.golden_term").Include("term.golden_term1")
                                     .Include("term.gt_path_to_root1").Include("term.gt_path_to_root1.term")
                                     .AsNoTracking()
                                     .Where(p => p.url_id == url_id);
                //Debug.WriteLine(qry.ToString());
                return qry.ToListNoLock();
            }
        }

        private static void MapWikiGoldenTerms(IEnumerable<url_term> calais_terms, url db_url)
        {
            var unmapped_terms = 0;
            var mapped_terms = 0;
            //var calais_objects = new List<object>();

            var objects = calais_terms.Select(p => new {
                        name = p.term.name,
                term_type_id = p.term.term_type_id,
        cal_entity_type_name = p.term.term_type_id == (int)g.TT.CALAIS_ENTITY ? p.term.cal_entity_type.name : null,
                    tss_norm = p.tss_norm,
                         tss = p.tss,
                           S = p.term.term_type_id == (int)g.TT.CALAIS_ENTITY ? Convert.ToDouble(p.cal_entity_relevance.ToString()) * 10 // 0-10
                             : p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG ? ((4 - Convert.ToDouble(p.cal_socialtag_importance.ToString())) * 3) // 0-10
                             : p.term.term_type_id == (int)g.TT.CALAIS_TOPIC ? Convert.ToDouble(p.cal_topic_score.ToString()) * 10 // 0-10
                             : -1,
            }).Where(p => p.name.Length <= 128);

            foreach (var obj in objects)
                Debug.WriteLine($"{obj.name} ({StringEx.RemoveAccents(obj.name)} {obj.term_type_id} {obj.cal_entity_type_name} {obj.S}");

            // flatten by name (ignore diacritics) -- take highest rated object's S value
            var distinctNames = objects.Select(p => StringEx.RemoveAccents(p.name)).Distinct();
            var distinctObjects_S = new Dictionary<string, double>();
            var distinctObjects_tss_norm = new Dictionary<string, double>();
            var distinctObjects_tss = new Dictionary<string, double>();
            foreach (var name in distinctNames) {
                distinctObjects_S.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.S).Max());
                distinctObjects_tss_norm.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.tss_norm??0).Max());
                distinctObjects_tss.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.tss??0).Max());
            }

            foreach (var distinct in distinctObjects_S.Keys)
            {
                var term_name = distinct;
                var term_url_S = distinctObjects_S[distinct];
                var term_url_tss = distinctObjects_tss[distinct];
                var term_url_tss_norm = distinctObjects_tss_norm[distinct];
                Debug.WriteLine($"{term_name} ({term_url_S})");

                // look for wiki-type term match -- exact match, name
                using (var db = mm02Entities.Create())
                {
                    var wiki_terms = db.terms.Where(p => p.name == term_name && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14)).ToListNoLock();
                    if (wiki_terms.Count == 0)
                    {
                        // ... NO manual adding of wiki cats! these terms are all golden, and if they're not in the wiki tree we should just alert
                        g.LogLine($"!! term NOT mapped to a known WIKI term (name={term_name})");
                        unmapped_terms++;
                    }
                    else
                        mapped_terms++;
                    //else
                    //{
                    //    foreach (var wiki_term in wiki_terms)
                    //    {
                    //        g.LogLine($"++occurs_count for known WIKI term: name={wiki_term.name} term_type_id={wiki_term.term_type_id}...");
                    //        if (wiki_term.occurs_count == -1) wiki_term.occurs_count = 1; else wiki_term.occurs_count++;
                    //        db.SaveChangesTraceValidationErrors();
                    //        mapped_term_ids.Add(wiki_term.id);
                    //    }
                    //}

                    // record term-url link - if not already present
                    if (wiki_terms.Count > 0)
                    {
                        foreach (var wiki_term in wiki_terms)
                        {
                            if (!db_url.url_term.Any(p => p.term_id == wiki_term.id))
                            {
                                var wiki_mapped_url_term = new url_term();
                                wiki_mapped_url_term.term_id = wiki_term.id;
                                wiki_mapped_url_term.url_id = db_url.id;
                                wiki_mapped_url_term.wiki_S = term_url_S;
                                wiki_mapped_url_term.tss = term_url_tss;
                                wiki_mapped_url_term.tss_norm = term_url_tss_norm;

                                db_url.url_term.Add(wiki_mapped_url_term);
                                g.LogLine($"writing new WIKI url_term url_id={db_url.id}, WIKI term_id={wiki_term.id} term_name={wiki_term.name} term_type_id={wiki_term.term_type_id}...");
                            }
                        }
                    }
                }
            }

            db_url.unmapped_wiki_terms = unmapped_terms;
            db_url.mapped_wiki_terms = mapped_terms;
        }

      
    }
}
