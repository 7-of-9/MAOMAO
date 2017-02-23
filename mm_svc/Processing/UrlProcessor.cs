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
using System.Collections.Concurrent;

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
        public static List<url_term> ProcessUrl(long url_id, bool reprocess = false, bool run_l2_boost = false)
        {
            using (var db = mm02Entities.Create()) {
                // get url - tracking ref
                var url = db.urls.Include("url_term").Where(p => p.id == url_id).SingleOrDefault();
                if (url == null) return null;

                // url already processed? return unless reprocessing
                //if (url.processed_at_utc != null && reprocess == false)
                //    goto ret1;

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
                var all_url_terms = db.url_term
                                        .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                        .Where(p => p.url_id == url.id && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();

                var wiki_terms = all_url_terms.Where(p => p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14).ToList();

                var calais_terms = all_url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_ENTITY
                                                         || p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG
                                                         || p.term.term_type_id == (int)g.TT.CALAIS_TOPIC).ToList();


                // calc TSS values for Calais terms
                new TssProducer().CalcTSS(meta_all, calais_terms, run_l2_boost);

                calais_terms.ForEach(p => p.candidate_reason = p.candidate_reason.TruncateMax(256));
                calais_terms.ForEach(p => p.S = p.S_CALC);

                // map & store wiki golden_terms
                if (wiki_terms.Count == 0 || reprocess == true)
                    MapWikiGoldenTerms(calais_terms, url, reprocess);

                // calc & store all paths to root for mapped golden terms
                var wiki_url_terms = url.url_term.Where(p => p.wiki_S != null);
                Parallel.ForEach(wiki_url_terms, p => GoldenPaths.ProcessAndRecordPathsToRoot(p.term_id));

                // calc & store suggested parents
                var parents = new ConcurrentDictionary<long, List<gt_parent>>();
                Parallel.ForEach(wiki_url_terms.Where(p => p.tss_norm > 0.1), p => {
                    var term_parents = GoldenParents.GetOrProcessSuggestedParents(p.term_id, reprocess);
                    parents.AddOrUpdate(p.term_id, term_parents, (k, v) => term_parents);
                });
                var all_parents = parents.Values.SelectMany(p => p).ToList();

                //
                // find most common suggested parent
                // TODO: > fix bad disambiguations, e.g. url's 
                //       > tss weightings: (e.g. url=6131) -- don't apply equal weighting to all terms...
                //       > common parent: (e.g. url id=55) -- use stemming and partial contains for counts (not exact matches) e.g. "comedy"...
                //
                if (db.url_parent_term.Count(p => p.url_id == url_id) == 0 || reprocess == true) {
                    var counts = all_parents.GroupBy(p => p.parent_term_id)
                                            .Select(p => new { parent_term_id = p.Key, count = p.Count() })
                                            .OrderByDescending(p => p.count);
                    db.url_parent_term.RemoveRange(db.url_parent_term.Where(p => p.url_id == url_id));
                    db.SaveChangesTraceValidationErrors();
                    var pri = 0;
                    db.url_parent_term.AddRange(counts.Where(p => p.count > 2).Select(p => new url_parent_term() { term_id = p.parent_term_id, url_id = url_id, pri = ++pri, }));
                    db.SaveChangesTraceValidationErrors();
                }

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

        public static int MapWikiGoldenTerms(IEnumerable<url_term> calais_terms, url db_url, bool reprocess)
        {
            var unmapped_terms = 0;
            var mapped_terms = 0;
            var terms_added = 0;

            var stemmer = new Porter2_English();
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
            //foreach (var obj in objects)
            //    Debug.WriteLine($"{obj.name} ({StringEx.RemoveAccents(obj.name)} {obj.term_type_id} {obj.cal_entity_type_name} {obj.S}");

            // flatten by name (ignore diacritics) -- take highest rated object's S value
            var distinctNames = objects.Select(p => StringEx.RemoveAccents(p.name)).Distinct();
            var distinctObjects_S = new Dictionary<string, double>();
            var distinctObjects_tss_norm = new Dictionary<string, double>();
            var distinctObjects_tss = new Dictionary<string, double>();
            foreach (var name in distinctNames) {
                distinctObjects_S.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.S).Max());
                distinctObjects_tss_norm.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.tss_norm ?? 0).Max());
                distinctObjects_tss.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.tss ?? 0).Max());
            }

            // get calais terms stemmed
            var calais_terms_stemmed = calais_terms.Select(p => new {
                t = p.term,
                S = p.S,
     term_stemmed = stemmer.stem(p.term.name), 
    stemmed_words = stemmer.stem(p.term.name).Split(' ').ToList() });

            // foreach calais term
            foreach (var distinct in distinctObjects_S.Keys) {
                var term_name = distinct;
                var term_stemmed_words = stemmer.stem(term_name).Split(' ').ToList();
                var term_url_S = distinctObjects_S[distinct];
                var term_url_tss = distinctObjects_tss[distinct];
                var term_url_tss_norm = distinctObjects_tss_norm[distinct];

                using (var db = mm02Entities.Create()) {
                    // TODO: lookup direct term match first -- if wiki_nscount > threshold, then don't bother with disambiguations, e.g. "United States", "Politcs" etc.
                    var wiki_terms_direct_matching = db.terms.Where(p => p.name == term_name && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14)).ToListNoLock();
                    bool skip_disambig = false;
                    if (wiki_terms_direct_matching.Any(p => p.wiki_nscount > 7)) {
                        Debug.WriteLine($">>> {term_name}: got direct matching high NS# (={wiki_terms_direct_matching.Max(p => p.wiki_nscount)}) terms; will not bother with disambiguation.");
                        skip_disambig = true;
                    }

                    // are there any matching wiki terms that originate from disambiguation terms, e.g. "Ajax_(programming)" vs. "Ajax_(mythology)"
                    // if so, we want to match the most relevent disambiguated wiki term
                    var wiki_disambiguated_terms_to_add = new List<term>();
                    if (!skip_disambig) {
                        var ambiguous_term_name_start = term_name + " (";
                        var qry = db.terms.Where(p => p.name.StartsWith(ambiguous_term_name_start) && p.name.EndsWith(")") && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14));
                        //Debug.WriteLine(qry.ToString());
                        var wiki_ambig_terms = qry.ToListNoLock();
                        if (wiki_ambig_terms.Count > 0) {

                            wiki_ambig_terms = wiki_ambig_terms.Where(p => p.name.Count(p2 => p2 == '(') == 1).ToList();  // skip edge cases with more than one set of paren's, e.g. "European Union (Referendum) Act 2016 (Gibraltar)"
                            var disambiguations = wiki_ambig_terms.Select(p => new { t = p, stemmed_words = stemmer.stem(p.name.Substring(p.name.IndexOf("(") + 1, p.name.IndexOf(")") - p.name.IndexOf("(") - 1)).Split(' ').ToList(), }).ToList();

                            // any stemmed calais terms that directly match the stemmed wiki disambiguation description (the part in brackets)? if so, use these
                            foreach (var disambig in disambiguations) {
                                var matching_calais = calais_terms_stemmed.Where(p => p.t.name != term_name && disambig.stemmed_words.All(p2 => p.stemmed_words.Contains(p2))).ToList();
                                if (matching_calais.Count > 0) {
                                    matching_calais.ForEach(p => Debug.WriteLine($"DISAMBIG - DIRECT MATCH: calais_term={term_name} ==> wiki_disambiguation_term={disambig.t.name}[{disambig.t.id}] > (matches related calais term {p.t})"));
                                    wiki_disambiguated_terms_to_add.Add(disambig.t);
                                }
                            }

                            if (wiki_disambiguated_terms_to_add.Count == 0) {
                                // no direct matches on wiki disambiguation description; need to use suggested parents of the wiki disambiguation terms to find the most appropriate one to use

                                // get suggested parent for all wiki ambig terms
                                var ambig_parents = wiki_ambig_terms.AsParallel().WithExecutionMode(ParallelExecutionMode.ForceParallelism).WithDegreeOfParallelism(128)
                                        .Select(p => new {
                                            t = p,
                                            parents = GoldenParents.GetOrProcessSuggestedParents(p.id).Select(p2 => new {
                                                S_norm = p2.S_norm,
                                                t = p2.parent_term,
                                                term_stemmed = stemmer.stem(p2.parent_term.name),
                                                stemmed_words = stemmer.stem(p2.parent_term.name).Split(' ').ToList()
                                            })
                                        }).ToList();

                                // for each ambig, get count of # of ambig's parent's stemmed words that are common with the URLs stemmed calais words
                                //var calais_stemmed_terms = calais_terms_stemmed.Select(p2 => p2.term_stemmed).Distinct().ToList();
                                var calais_stemmed_words = calais_terms_stemmed.Where(p => p.S >= 2).SelectMany(p2 => p2.stemmed_words).Distinct().Except(term_stemmed_words).ToList();
                                var counts = ambig_parents.Select(p => new {
                                    ambig = p,
                                    //terms_common = p.parents.Select(p2 => p2.term_stemmed).Distinct().Where(p2 => calais_stemmed_terms.Contains(p2)),
                                    words_common = p.parents.SelectMany(p2 => p2.stemmed_words).Where(p2 => calais_stemmed_words.Contains(p2))
                                });
                                //var terms_common = counts.Where(p => p.terms_common.Count() > 0).OrderByDescending(p => p.terms_common.Count());
                                var words_common = counts.Where(p => p.words_common.Count() > 0).OrderByDescending(p => p.words_common.Count());

                                // use exact full stemmed term match in preference; fallback to splitting stemmed terms by word
                                //if (terms_common.Count() > 0) {
                                //    // take term(s) with top count of parent term name stemmed common to calais term name stemmed
                                //    var top_count_matches = terms_common.Where(p => p.terms_common.Count() == terms_common.Max(p2 => p2.terms_common.Count()));
                                //    if (top_count_matches != null) {
                                //        foreach (var best_match in top_count_matches) {
                                //            Debug.WriteLine($"DISAMBIG - FULL TERM MATCH: calais_term={term_name} ==> wiki_disambiguation_term={best_match.ambig.t}[{best_match.ambig.t.id}] > (best stemmed term name match across all ambig parent & calais terms)");
                                //            wiki_disambiguated_terms_to_add.Add(best_match.ambig.t);
                                //        }
                                //    }
                                //}
                                //else
                                if (words_common.Count() > 0) {
                                    // take term(s) with top count of parent stemmed words common to calais stemmed words
                                    var top_count_matches = words_common.Where(p => p.words_common.Count() == words_common.Max(p2 => p2.words_common.Count()));
                                    foreach (var best_match in top_count_matches) {
                                        //if (best_match.words_common.Count() > 3) {
                                        var perc = (double)best_match.words_common.Count() / calais_stemmed_words.Count;
                                        if (perc > 0.15) {
                                            Debug.WriteLine($"DISAMBIG - PARTIAL WORD MATCH (#{best_match.words_common.Count()} = {(perc * 100).ToString("0.0")}%): calais_term={term_name} ==> wiki_disambiguation_term={best_match.ambig.t}[{best_match.ambig.t.id}] > (best stemmed term word match across all ambig parent & calais terms)\r\n\t{string.Join(",", best_match.words_common)}");
                                            wiki_disambiguated_terms_to_add.Add(best_match.ambig.t);
                                        }
                                        //}
                                        //else {
                                        //    Debug.WriteLine($"## LOW SIGNAL (partial word match - ignoring): calais_term={term_name} ==> wiki_disambiguation_term={best_match.ambig.t}[{best_match.ambig.t.id}]\r\n\t{string.Join("\r\n\t", best_match.words_common)}");
                                        //    ;
                                        // }
                                    }
                                }
                                if (wiki_disambiguated_terms_to_add.Count == 0)
                                    Debug.WriteLine($"!! could not disambiguate {term_name} from:\r\n\t{string.Join("\r\n\t", wiki_ambig_terms.Select(p => p))}");
                            }

                            // record term-url link - if not already present
                            if (wiki_disambiguated_terms_to_add.Count > 0) {
                                terms_added += AddMappedWikiUrlTerms(db, db_url, term_url_S, term_url_tss, term_url_tss_norm, wiki_disambiguated_terms_to_add, "WIKI_DISAMBIG", reprocess);
                                mapped_terms++;
                            }
                        }
                    }

                    // standard case - no disambiguations to be resolved; look for wiki-type term match -- exact match on name
                    if (wiki_disambiguated_terms_to_add.Count == 0) {
                        if (wiki_terms_direct_matching.Count == 0) {
                            g.LogLine($"!! term NOT mapped to a known WIKI term (name={term_name})");
                            unmapped_terms++;
                        }
                        else mapped_terms++;

                        // record term-url link - if not already present
                        terms_added += AddMappedWikiUrlTerms(db, db_url, term_url_S, term_url_tss, term_url_tss_norm, wiki_terms_direct_matching, "WIKI_EXACT", reprocess);
                    }
                }
            }

            db_url.unmapped_wiki_terms = unmapped_terms;
            db_url.mapped_wiki_terms = mapped_terms;
            return terms_added;
        }

        private static int AddMappedWikiUrlTerms(mm02Entities db,
            url db_url, double term_url_S, double term_url_tss, double term_url_tss_norm, List<term> wiki_terms, string reason, bool reprocess)
        {
            var terms_added = 0;
            foreach (var wiki_term in wiki_terms) {
                if (reprocess && db_url.url_term.Any(p => p.term_id == wiki_term.id)) {
                    var term_ids = wiki_terms.Select(p2 => p2.id).ToList();
                    db.url_term.RemoveRange(db.url_term.Where(p => p.url_id == db_url.id && term_ids.Contains(p.term_id)));
                    db.SaveChangesTraceValidationErrors();
                }

                if (reprocess || !db_url.url_term.Any(p => p.term_id == wiki_term.id)) {
                    var wiki_mapped_url_term = new url_term() {
                        term_id = wiki_term.id,
                         url_id = db_url.id,
                         wiki_S = term_url_S,
                            tss = term_url_tss,
                       tss_norm = term_url_tss_norm,
               candidate_reason = reason
                    };

                    db_url.url_term.Add(wiki_mapped_url_term);
                    g.LogLine($"writing new WIKI url_term url_id={db_url.id}, WIKI term_id={wiki_term.id} term_name={wiki_term.name} term_type_id={wiki_term.term_type_id}...");
                    terms_added++;
                }
            }
            return terms_added;
        }

    }
}
