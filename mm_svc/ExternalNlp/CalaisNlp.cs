using mm_global;
using mm_global.Extensions;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using static mm_svc.Terms.GoldenPaths;

namespace mm_svc
{
    public static class CalaisNlp
    {
        public class ProcessResult {
            public int new_calais_terms = 0, new_calais_pairs = -1,
                       mapped_wiki_terms = 0, unmapped_wiki_terms = 0, new_wiki_pairs = -1;
        }

        public static ProcessResult ProcessNlpPacket(dynamic nlp_info, bool reprocessing_known_url = false)
        {
            var ret = new ProcessResult();
            if (nlp_info.url == null) throw new ArgumentException("missing url");
            if (nlp_info.meta == null) throw new ArgumentException("missing meta");
            if (nlp_info.items == null) throw new ArgumentException("missing items");
            var url = mm_global.Util.RemoveHashFromUrl(nlp_info.url.href.ToString());

            // get awis site -- prep/sanity checking
            bool returned_from_db;
            var awis_site = mm_svc.SiteInfo.GetOrQueryAwis(url, out returned_from_db);
            if (awis_site == null) throw new ApplicationException("bad site");
            if (!mm_svc.SiteInfo.IsSiteAllowable(awis_site)) throw new ApplicationException("bad site");

            // get URL, should not be known
            var db_url = (url)mm_svc.UrlInfo.GetNlpInfo(url);
            if (db_url != null && !reprocessing_known_url) throw new ApplicationException("url already known");

            // create new URL record 
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                // get calais language
                var cal_langs = ((IEnumerable<dynamic>)nlp_info.items).Where(p => p.type == "LANG").ToList();
                string cal_lang = null;
                if (cal_langs.Count > 0)
                    cal_lang = cal_langs.First().language.ToString();

                // create new url row as necessary
                if (db_url == null) {
                    db_url = new url();
                    db.urls.Add(db_url);
                    g.LogLine($"writing new url row url1={db_url.url1}");
                }
                else {
                    db_url = db.urls.Find(db_url.id); // set to tracking reference
                    g.LogLine($"updating existing url row url1={db_url.url1}");
                    foreach (var db_url_term in db.url_term.Where(p => p.url_id == db_url.id))
                        db.ObjectContext().DeleteObject(db_url_term);
                    db.SaveChangesTraceValidationErrors();
                }

                db_url.url1 = url;
                db_url.awis_site_id = awis_site.id;
                db_url.cal_lang = cal_lang;
                db_url.calais_as_of_utc = DateTime.UtcNow;
                db_url.meta_title = nlp_info.meta.html_title.ToString();
                db_url.meta_all = Newtonsoft.Json.JsonConvert.SerializeObject(nlp_info.meta);
                db.SaveChangesTraceValidationErrors();

                g.LogLine($"wrote/updated url url1={db_url.url1}");
            }

            //
            // Wiki terms - "corresponding" to raw underlying Calais terms (mapped by exact name match - case insensitive, accent insensitive)
            //
            //var mapped_wiki_term_ids = mm_svc.CalaisNlp.MaintainWikiTypeTerms(nlp_info, db_url.id, out ret.unmapped_wiki_terms);
            //ret.mapped_wiki_terms = mapped_wiki_term_ids.Count;
            //var wiki_pairs = mm_svc.TermPair.GetUniqueTermPairs(mapped_wiki_term_ids); // compute unique term pairs
            //Task.Factory.StartNew<int>(() => mm_svc.TermPair.MaintainAppearanceMatrix(wiki_pairs)); // update term-pair appearance matrix - slow: run async

            //
            // "Underlying" Calais terms -- creates url_terms
            //
            var calais_term_ids = mm_svc.CalaisNlp.MaintainCalaisTypeTerms(nlp_info, db_url.id, out ret.new_calais_terms); // record calais NLP terms
            calais_term_ids.Add(g.MAOMAO_ROOT_TERM_ID);                                                                    // add a master "root node" term
            var calais_pairs = (List<TermPair>)mm_svc.TermPair.GetUniqueTermPairs(calais_term_ids);   // compute unqiue combinations of term pairs

            //
            // update term-pair appearance matrix - only for new URL
            //       
            if (reprocessing_known_url == false)
            {
                Task.Factory.StartNew<int>(() => mm_svc.TermPair.MaintainAppearanceMatrix(calais_pairs));  //  - slow: run async
            }

            //
            // Calculate TSS & TSS_norm for Calais terms -- updates TSS values on Calais url_terms & writes mapped wiki (golden) url_terms
            // 
            List<List<TermPath>> all_term_paths = null;
            mm_svc.UrlProcessor.ProcessUrl(db_url.id, out all_term_paths, reprocess: reprocessing_known_url);

            return ret;
        }

        //public static List<long> MaintainWikiTypeTerms(dynamic nlp_info, long url_id, out int unmapped_terms)
        //{
        //    unmapped_terms = 0;
        //    var mapped_term_ids = new List<long>();
        //    var calais_objects = new List<object>();
        //    using (var db = mm02Entities.Create())
        //    {
        //        var db_url = db.urls.Where(p => p.id == url_id).FirstOrDefaultNoLock();

        //        var objects = ((IEnumerable<dynamic>)nlp_info.items)
        //                        .Where(p => p.type == "ENTITY" || p.type == "SOCIAL_TAG" || p.type == "TOPIC")
        //                        .Select(p => new { name = p.name.ToString(),
        //                                           type = p.type.ToString(),
        //                                   ent_typename = p.type.ToString() == "ENTITY" ? p.entity_type.ToString() : null,
        //                                              S = p.type == "ENTITY" ? Convert.ToDouble(p.relevance.ToString()) * 10 // 0-10
        //                                                : p.type == "SOCIAL_TAG" ? ((4 - Convert.ToDouble(p.importance.ToString())) * 3) // 0-10
        //                                                : p.type == "TOPIC" ? Convert.ToDouble(p.score.ToString()) * 10 // 0-10
        //                                                : -1
        //                        })
        //                        .Where(p => p.name.ToString().Length <= 128 
        //                                 && p.ent_typename != "EmailAddress" 
        //                                 && p.ent_typename != "PhoneNumber");

        //        foreach (var obj in objects)
        //            Debug.WriteLine($"{obj.name} ({StringEx.RemoveAccents(obj.name)} {obj.type} {obj.ent_typename} {obj.S}");

        //        // flatten by name (ignore diacritics) -- take highest rated object's S value
        //        var distinctNames = objects.Select(p => StringEx.RemoveAccents(p.name)).Distinct();
        //        var distinctObjects = new Dictionary<string, double>();
        //        foreach (var name in distinctNames) 
        //            distinctObjects.Add(name, objects.Where(p => StringEx.RemoveAccents(p.name) == name).Select(p => p.S).Max());

        //        foreach (var distinct in distinctObjects.Keys)
        //        {
        //            var term_name = distinct;
        //            var term_url_S = distinctObjects[distinct];
        //            Debug.WriteLine($"{term_name} ({term_url_S})");

        //            // look for wiki-type term match
        //            var db_terms = db.terms.Where(p => p.name == term_name
        //                                            && (p.term_type_id == (int)g.TT.WIKI_NS_0
        //                                             || p.term_type_id == (int)g.TT.WIKI_NS_14)).ToListNoLock();
        //            if (db_terms.Count == 0)
        //            {
        //                // ... NO manual adding of wiki cats! these terms are all golden, and if they're not in the wiki tree we should just alert
        //                g.LogLine($"!! term NOT mapped to a known WIKI term (name={term_name})");
        //                unmapped_terms++;
        //            }
        //            else
        //            {
        //                foreach (var db_term in db_terms)
        //                {
        //                    g.LogLine($"++occurs_count for known WIKI term: name={db_term.name} term_type_id={db_term.term_type_id}...");
        //                    if (db_term.occurs_count == -1) db_term.occurs_count = 1; else db_term.occurs_count++;
        //                    db.SaveChangesTraceValidationErrors();
        //                    mapped_term_ids.Add(db_term.id);
        //                }
        //            }

        //            // record term-url link
        //            if (db_url != null && db_terms.Count > 0)
        //            {
        //                foreach (var db_term in db_terms)
        //                {
        //                    var db_url_term = new url_term();
        //                    db_url_term.term_id = db_term.id;
        //                    db_url_term.url_id = url_id;
        //                    db_url_term.wiki_S = term_url_S;
        //                    db.url_term.Add(db_url_term);
        //                    db.SaveChangesTraceValidationErrors();
        //                    g.LogLine($"wrote new WIKI url_term url_id={url_id}, WIKI term_id={db_term.id} term_name={db_term.name} term_type_id={db_term.term_type_id}");
        //                }
        //            }
        //        }

        //        if (db_url != null)
        //        {
        //            db_url.unmapped_wiki_terms = unmapped_terms;
        //            db_url.mapped_wiki_terms = mapped_term_ids.Count;
        //            db.SaveChangesTraceValidationErrors();
        //        }
        //    }
        //    return mapped_term_ids;
        //}

        public static List<long> MaintainCalaisTypeTerms(dynamic nlp_info, long url_id, out int new_terms)
        {
            new_terms = 0;
            var term_ids = new List<long>();

            using (var db = mm02Entities.Create())
            {
                // process calais entities
                foreach (var item in ((IEnumerable<dynamic>)nlp_info.items).Where(p => p.type == "ENTITY" || p.type == "SOCIAL_TAG" || p.type == "TOPIC"))
                {
                    string item_name = item.name.ToString();
                    if (string.IsNullOrEmpty(item_name) || item_name.Length > 128)
                        continue;

                    string item_type = item.type.ToString();

                    int term_type_id;
                    switch (item_type) {
                        case "ENTITY": term_type_id = (int)g.TT.CALAIS_ENTITY; break;
                        case "SOCIAL_TAG": term_type_id = (int)g.TT.CALAIS_SOCIALTAG; break;
                        case "TOPIC": term_type_id = (int)g.TT.CALAIS_TOPIC; break;
                        default: throw new ApplicationException($"unknown calais item type {item_type}");
                    }
                    string ent_typename = item_type == "ENTITY" ? item.entity_type.ToString() : null;

                    // if entity, is entity-type known in DB?
                    int? cal_entity_type_id = null;
                    if (ent_typename != null) {
                        if (ent_typename == "EmailAddress" || ent_typename == "PhoneNumber") {
                            // not of interest, don't pollute DB
                            continue;
                        }

                        var db_ent_type = db.cal_entity_type.Where(p => p.name == ent_typename).FirstOrDefaultNoLock();
                        if (db_ent_type == null) {
                            db_ent_type = new cal_entity_type();
                            db_ent_type.name = ent_typename;
                            db.cal_entity_type.Add(db_ent_type);
                            db.SaveChangesTraceValidationErrors();
                            g.LogLine($"wrote new cal_entity_type name={db_ent_type.name}");
                        }
                        else
                            g.LogLine($"known cal_entity_type name={db_ent_type.name}");
                        cal_entity_type_id = db_ent_type.id;
                    }

                    // is term known in DB?
                    var db_term = db.terms.Where(p => p.name == item_name
                                                   && p.term_type_id == term_type_id
                                                   && p.cal_entity_type_id == cal_entity_type_id).FirstOrDefaultNoLock();
                    if (db_term == null) {
                        db_term = new term();
                        db_term.name = item_name;
                        db_term.term_type_id = term_type_id;
                        db_term.cal_entity_type_id = cal_entity_type_id;
                        db_term.occurs_count = 1;
                        db.terms.Add(db_term);
                        db.SaveChangesTraceValidationErrors();
                        new_terms++;
                        g.LogLine($"wrote new term name={db_term.name}, term_type_id={term_type_id}, cal_entity_type_id={cal_entity_type_id}");
                    }
                    else {
                        g.LogLine($"++occurs_count for known term name={db_term.name}, term_type_id={term_type_id}, cal_entity_type_id={cal_entity_type_id}");
                        db_term.occurs_count++;
                        db.SaveChangesTraceValidationErrors();
                    }
                    term_ids.Add(db_term.id);

                    // record term-url link
                    var db_url_term = new url_term();
                    db_url_term.term = db_term;
                    db_url_term.term_id = db_term.id;
                    db_url_term.url_id = url_id;

                    switch (term_type_id) {
                        case (int)g.TT.CALAIS_ENTITY:
                            db_url_term.cal_entity_relevance = Convert.ToDouble(item.relevance.ToString()); break;
                        case (int)g.TT.CALAIS_SOCIALTAG:
                            db_url_term.cal_socialtag_importance = Convert.ToInt32(item.importance.ToString()); break;
                        case (int)g.TT.CALAIS_TOPIC:
                            db_url_term.cal_topic_score = Convert.ToDouble(item.score.ToString()); break;
                    }

                    db_url_term.S = db_url_term.S_CALC;

                    db.url_term.Add(db_url_term);
                    db.SaveChangesTraceValidationErrors();
                    g.LogLine($"wrote new url_term url_id={url_id}, term_id={db_term.id}");
                }
            }
            return term_ids;
        }
    }
}
