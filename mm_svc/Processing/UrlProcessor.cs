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
using System.Data.SqlClient;
using static mm_svc.Terms.GoldenPaths;

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
        public static List<url_term> ProcessUrl(
            long url_id,
            out List<List<TermPath>> all_term_paths,
            bool reprocess = false,
            bool run_l2_boost = false)
        {
            all_term_paths = new List<List<TermPath>>();

            using (var db = mm02Entities.Create()) {
                var sw = new Stopwatch(); sw.Start();

                // get url - tracking ref
                var url = db.urls.Include("url_term").Where(p => p.id == url_id).SingleOrDefault();
                if (url == null) return null;

                // url already processed? return unless reprocessing
                //if (url.processed_at_utc != null && reprocess == false)
                //    goto ret1;

                dynamic meta_all = JsonConvert.DeserializeObject(url.meta_all);

                // load - extract meta
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

                // load - get underlying Calais url-terms - tracking references
                var all_url_terms = db.url_term
                                        .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                        .Where(p => p.url_id == url.id && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();

                var existing_wiki_terms = all_url_terms.Where(p => p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14).ToList();

                var calais_terms = all_url_terms.Where(p => p.term.term_type_id == (int)g.TT.CALAIS_ENTITY
                                                         || p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG
                                                         || p.term.term_type_id == (int)g.TT.CALAIS_TOPIC).ToList();

                //
                // TSS: calc topic score specific values for Calais terms
                //
                new TssProducer().CalcTSS(meta_all, calais_terms, run_l2_boost);
                calais_terms.ForEach(p => p.candidate_reason = p.candidate_reason.TruncateMax(256));
                calais_terms.ForEach(p => p.S = p.S_CALC);
                g.LogInfo($"url_id={url_id} CalcTSS done: ms={sw.ElapsedMilliseconds} ");

                //
                // MAP WIKI : map & store wiki golden_terms
                //
                if (existing_wiki_terms.Count == 0) {// || reprocess == true) {
                    if (reprocess) {
                        db.url_term.RemoveRange(db.url_term.Where(p => p.url_id == url_id && (p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14)));
                        db.SaveChangesTraceValidationErrors();
                    }
                    MapWikiGoldenTerms(calais_terms, url, reprocess);
                    db.SaveChangesTraceValidationErrors();
                    g.LogInfo($"url_id={url_id} MapWikiGoldenTerms DONE: ms={sw.ElapsedMilliseconds} ");
                }

                //
                // DEDUPE WIKI: dedupe wiki mapped terms by name (for NS0/14 collisons); pick the term that has the best (highest count) golden parents chain
                //
                var wiki_url_terms = url.url_term.Where(p => p.wiki_S != null).ToList();
                if (wiki_url_terms != null) {
                    wiki_url_terms = DedupeWikiMappedTerms(url_id, db, wiki_url_terms);
                    g.LogInfo($"url_id={url_id} DedupeWikiMappedTerms DONE: ms={sw.ElapsedMilliseconds} ");
                }

                //
                // PATHS TO ROOT: calc & store all paths to root for mapped & deduped golden terms
                //
                var term_paths_P = new ConcurrentBag<List<TermPath>>();
                Parallel.ForEach(wiki_url_terms, p => {

                    var paths = GoldenPaths.GetOrProcessPathsToRoot(p.term_id, false); //reprocess); //***
                    paths.ForEach(p2 => term_paths_P.Add(p2));

                } );
                all_term_paths = term_paths_P.ToList(); // all terms, all paths to root
                g.LogInfo($"url_id={url_id} ProcessAndRecordPathsToRoot DONE: ms={sw.ElapsedMilliseconds} ");

                //  (done): topic hiearchies - how to maintain these:
                //      > a separate link table [topic_link]: GetOrProcessParents -> GetTopics should write into it 
                //        any newly discovered links for topics; the parent-child linkage is inferred solely from relative positions in PtR.
                //  (done): topic_link visualizer for frmMain.
                //
                //  note: need a "full walk" of all paths to populate topic_link -- i.e. walk all known paths to root!!
                //          (for now, this is kind of the same as full walk of all URLs -- done: parallel mode)
                //        this full walk needs really to run *after each editorial update*
                //        it should also be preceded by a full delete of the topic tree! (if removing topics during editorializaiton)
                //
                //  (done) TopicTree refresh, w/ context menu to remove Topic flag from term -- should also delete the link from topic_link table
                //        also to be able to mark a topic_link as "disabled" (not delete; different from removing Topic flag) - to mark
                //        a specific link as not appropriate, etc.
                //
                //  (done - partially) *** Need to do a first cut of editorial topics -- 50-100 or so; + promotion to prod (term.is_topic|is_root_topic + [topic_link])
                //      (did some reasonable roots, and started 2nd level)
                //
                //  (done): apply separately the most common logic below to topic parents and dynamic parents, i.e. we have most common scored topics
                //        and most common scored dynamic suggestions; so another column on [url_parent_term] neeed: [is_topic] (or maybe scoring logic is different
                //        for dynamics and topics -- for topics, we probably want to honour the scoring of topics produced by GetTopics, i.e. use closest to leaf)
                //
                // (done) then: we can take top is_topic term as final grouping; new link table gives the hierarchy as needed.
                //
                // (done) AUTO-FLAG (flag urls/terms requiring manual editorialization) 
                //          (*) % of topics in PtR > no good.
                //          (*) min_S/max_S value of term's topic parents > no good.
                //          (*) >>> third time lucky?? ** min_d/max_d ** of topics from leaf terms on all_term_paths -- seems reasonable
                //               threshold seems to be about ~ >2 min_d indicates needs further editorialization
                //
                // NEXT: *** complete first cut of editorialization and promote to prod ***
                //
                //      NEED --> topics' mmcat_level; this is possibly simplest and most robust AUTO-FLAG feature,
                //                i.e. we should expect #1 topic parent to be at a certain min. mmcat_level in the topic tree...
                //
                // editorialize on local, push to prod - then run for all prod urls (will include some new urls)
                //
                //      GET INTO PROD *NOW* for 12 MARCH DEMO *** >>> WANT HOMEPAGE W/ LIVE FULL CYCLE ADDING, CATEGORIZING, ETC.
                //
                // DEMO PHASE PLAN
                // NEXT: phase 1 -- wire up to base Calais mm02ce flow & user_history (no return yet to client) (filter wowmao by user_id / history)
                //       phase 2 -- returns topics & suggested to mm02ce for XP (+ user_xp! table)
                //       phase 3 -- categorization of user_history; quite possibly per original concept, of url categorization
                //                   being user-specific, i.e. clustering around previously categorized
                //       phase 4 -- homepage is view of user_history + discovery
                //
                //  *******
                //
                // NOTE: in all of this -- once a term has had its parents processed, (i.e once gt_parent is populated)
                //        the paths to root **CAN BE DELETED**; or at least it's not critically required. Surely good news.
                //

                //
                // SUGGESTED PARENTS: calc & store parents for each wiki term - dynamic suggested parents and editorially defined parent topics
                //
                var top_parents_dynamic = new ConcurrentDictionary<long, List<gt_parent>>();
                var top_parents_topics = new ConcurrentDictionary<long, List<gt_parent>>();
                Parallel.ForEach(wiki_url_terms.Where(p => p.tss_norm > 0.1), p => {

                    // perf: taking quite some time here...
                    // TODO: weight parents by source term TSS?
                    var term_parents = GoldenParents.GetOrProcessParents(p.term_id, false);// reprocess); //***

                    if (term_parents != null) {
                        var parents_dynamic = term_parents.Where(p2 => p2.is_topic == false).ToList();
                        var parents_topics = term_parents.Where(p2 => p2.is_topic == true).ToList();

                        // dynamic parents: remove long tail - for better common parent finding
                        var filtered_dynamic = parents_dynamic.OrderByDescending(p2 => p2.S_norm).Take(10).ToList();
                        top_parents_dynamic.AddOrUpdate(p.term_id, filtered_dynamic, (k, v) => filtered_dynamic);

                        // topic parents: add all sorted by rank
                        top_parents_topics.AddOrUpdate(p.term_id, parents_topics, (k, v) => parents_topics);
                    }
                });
                g.LogInfo($"url_id={url_id} GetOrProcessParents DONE: ms={sw.ElapsedMilliseconds} ");
                var all_parents_dynamic = top_parents_dynamic.Values.SelectMany(p => p).ToList();
                var all_parents_topics = top_parents_topics.Values.SelectMany(p => p).ToList();

                //
                // [url_parent_term]
                //
                if (db.url_parent_term.Count(p => p.url_id == url_id) == 0 || reprocess == true) { //***
                     
                    // editorial topic parents
                    CalcAndStoreUrlParentTerms_Topics(url_id, db, all_parents_topics, all_term_paths, wiki_url_terms); 

                    // dynamic sugggest parents
                    // find most common suggested parent, across all wiki terms; i.e. map from multiple suggested parents (dynamic & topics) down to ranked list
                    // of suggested related parent terms and topic terms, for the url.
                    CalcAndStoreUrlParentTerms_Dynamic(url_id, db, all_parents_dynamic);

                }
                g.LogInfo($"url_id={url_id} CalcAndStoreUrlParentTerms DONE: ms={sw.ElapsedMilliseconds} ");

                url.processed_at_utc = DateTime.UtcNow;
                db.SaveChangesTraceValidationErrors(); // save url_term tss, tss_norm & reason, url processed & mapped wiki terms

                ret1:
                var qry = db.url_term.Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                     .Include("term.golden_term").Include("term.golden_term1")
                                     .Include("term.gt_path_to_root1").Include("term.gt_path_to_root1.term")
                                     .AsNoTracking()
                                     .Where(p => p.url_id == url_id);
                //Debug.WriteLine(qry.ToString());

                g.LogInfo($"url_id={url_id} >>> ALL DONE: TOTAL ms={sw.ElapsedMilliseconds} ");
                return qry.ToListNoLock();
            }
        }

        [DebuggerDisplay(@"{t} count = {count} S = {S.ToString(""0.0000"")} S_norm = {S_norm.ToString(""0.00"")} (avg_S={avg_S.ToString(""0.0000"")} avg_S_norm={avg_S_norm.ToString(""0.00"")} avg_TSS_norm_leaf={avg_TSS_norm_leaf.ToString(""0.00"")})")]
        private class TopicInfo {
            public term t;
            public double avg_S, avg_S_norm;
            public double S, S_norm;
            public double avg_TSS_leaf;
            public int count;
            //public List<term> chain;
            //public double other_chains_boost;
            //public List<int> appears_in_chains_depths = new List<int>();
        }
        private static void CalcAndStoreUrlParentTerms_Topics(
            long url_id,
            mm02Entities db,
            List<gt_parent> all_parents_topics,
            List<List<TermPath>> all_term_paths,
            List<url_term> wiki_url_terms)
        {
            // renormalize -- input S_norms came from multiple unrelated wiki term -> topic processing runs
            all_parents_topics.ForEach(p => p.S_norm = p.S / all_parents_topics.Max(p2 => p2.S));
            var sorted_new_s_norm = all_parents_topics.OrderByDescending(p => p.S_norm).ToList();

            // group/count topics -- weight by input topic S
            // todo: get TSS of leaf term
            var counted_terms = all_parents_topics.Select(p => p.parent_term)
                                                .GroupBy(p => p.id)
                                                .Select(p => new {
                                                            parent_term = all_parents_topics.First(p2 => p2.parent_term_id == p.Key).term1,
                                                                  avg_S = all_parents_topics.Where(p2 => p2.parent_term_id == p.Key).Average(p2 => p2.S),
                                                             avg_S_norm = all_parents_topics.Where(p2 => p2.parent_term_id == p.Key).Average(p2 => p2.S_norm),
                                                                  count = p.Count() })
                                                .OrderByDescending(p => p.avg_S)
                                                .ToList();

            // move to TopicInfo 
            var counted_info = counted_terms.Select(p => new TopicInfo {
                    t = p.parent_term, avg_S = p.avg_S, avg_S_norm = p.avg_S_norm, count = p.count,
            }).OrderByDescending(p => p.S).ToList();

            // weight by originating wiki term's TSS
            foreach (var ti in counted_info) {
                // which paths does the topic appear in?
                var topic_paths = all_term_paths.Where(p => p.Any(p2 => p2.t.id == ti.t.id)).ToList();

                // what distinct leaf terms are there for these paths?
                var leaf_terms = topic_paths.Select(p => p.First().t).Distinct().ToList();

                // what are the TSS values for these leaf terms?
                var matching_url_terms = wiki_url_terms.Where(p => leaf_terms.Select(p2 => p2.id).Contains(p.term_id)).ToList();
                ti.avg_TSS_leaf = matching_url_terms.Average(p => (double)p.tss);
                Debug.WriteLine($"{ti.t.name} - appears in {leaf_terms.Count} distinct leaf term paths ({string.Join(", ", leaf_terms.Select(p => p.name))}): avg_TSS_norm={ti.avg_TSS_leaf.ToString("0.00")}");
            }

            // weightings
            counted_info.ForEach(p => 
                p.S = Math.Pow(p.count, (1.0 / 1.5))
                    * Math.Pow(p.avg_S, (1.0 * 1.5)) 
                    * Math.Pow(p.avg_TSS_leaf, (1.0 * 1.5))
            );
        
            var counted_info_sorted = counted_info.OrderByDescending(p => p.S).ToList();

            // below - removed, maybe add? : get topic chains to root (or to repetition, for unrooted topics)...

            // select top ranked
            counted_info_sorted.ForEach(p => p.S_norm = p.S / counted_info.Max(p2 => p2.S));
            counted_info_sorted = counted_info_sorted.Where(p => p.S_norm > 0.2).ToList();

            // remove
            db.Database.ExecuteSqlCommand("DELETE FROM [url_parent_term] WHERE [url_id]={0} AND [found_topic]=1", url_id);
            //db.url_parent_term.RemoveRange(db.url_parent_term.Where(p => p.url_id == url_id && p.found_topic == true));
            //db.SaveChangesTraceValidationErrors();
            
            //****
            // AUTO FLAG !! min_d > ~2 seems to be RED FLAG
            // get min/max distances from leaf terms for each topic, across all paths to root
            // todo -- record in UrlProcessing

            // add
            var pri = 0;
            var url_parent_terms = counted_info_sorted//.Where(p => p.count > 1) // *** want real commonality
                                        .Select(p => new url_parent_term() {
                                            term_id = p.t.id,
                                             url_id = url_id,
                                                pri = ++pri,
                                        found_topic = true,
                                              avg_S = p.avg_S,
                                             S_norm = p.S_norm,
                                                  S = p.S,
                                        }).ToList();

            //
            // AUTO-FLAG (curation/requiring editorialization) -- 
            //
            double perc_topics_all_term_paths = GoldenPaths.GetPercentageTopicsInPaths(all_term_paths);
            url_parent_terms.ForEach(p => {
                // metric 1 -- min/max topic distances from leaf terms -- across all paths to root of all URL terms
                int min_d = -1, max_d = -1;
                GoldenPaths.GetMinMaxDistancesFromLeafTerms(all_term_paths, p.term_id, out min_d, out max_d);
                p.min_d_paths_to_root_url_terms = min_d;
                p.max_d_paths_to_root_url_terms = max_d;

                // metric 2 -- % of term's path to root terms which are topics
                p.perc_ptr_topics = perc_topics_all_term_paths;
            });

            mmdb_model.Extensions.BulkCopy.BulkInsert(db.Database.Connection as SqlConnection, "url_parent_term", url_parent_terms);

            // walk each topic chain -- boost any top level matching topics by topic chain root S, scaled to 1/square of match depth
            // (wip...)
            /*terms_and_chains.ForEach(p => {
                for (int d = 1; d < p.chain.Count; d++) { // first item is leaf of topic chain (== p)
                    var chain_term = p.chain[d];
                    terms_and_chains.Where(p2 => p2.term.id == chain_term.id).ToList().ForEach(p2 => {
                        p2.appears_in_chains_depths.Add(d);
                    });
                }
            });
            terms_and_chains.ForEach(p => {
                if (p.appears_in_chains_depths.Count > 0)
                    p.other_chains_boost = p.S * Math.Sqrt(p.appears_in_chains_depths.Count) * (1.0 / p.appears_in_chains_depths.Max());
            });
            var order_by_chain_boost = terms_and_chains.OrderByDescending(p => p.other_chains_boost).ToList();*/

        }

        /*private static List<term> GetTopicChain(term child_topic, List<term> topic_chain) {
            if (child_topic.is_topic_root)
                return topic_chain;

            topic_link first_parent_link;
            using (var db = mm02Entities.Create()) {

                // *** assumes -- topic appears only once in topic_link hierarchy! just picks first parent
                first_parent_link = db.topic_link.AsNoTracking().Include("term").AsNoTracking().FirstOrDefault(p => p.child_term_id == child_topic.id);

                // stop recursion if arrived at true defined root topic, or if unrooted topic we go full circle
                if (first_parent_link == null || topic_chain.Select(p => p.id).Contains(first_parent_link.parent_term_id))
                    return topic_chain;

                topic_chain.Add(first_parent_link.parent_term);
            }
            return GetTopicChain(first_parent_link.parent_term, topic_chain);
        }*/

        private static void CalcAndStoreUrlParentTerms_Dynamic(long url_id, mm02Entities db, List<gt_parent> all_parents_dynamic)
        {
            // stemming, w/ contains -- count occurances of each dynamic parent stemmed name across all dynamic parents
            var stemmer = new Porter2_English();
            var stemmed = all_parents_dynamic.Select(p => new { stemmed = stemmer.stem(p.term1.name), t = p.term1 });
            var stemmed_count_contains = stemmed.Select(p => new {
                stemmed = p.stemmed,
                t = p.t,
                count = stemmed.Count(p2 => p2.stemmed.Contains(p.stemmed))
            }).OrderByDescending(p => p.count).DistinctBy(p => p.t.id);

            // remove
            db.Database.ExecuteSqlCommand("DELETE FROM [url_parent_term] WHERE [url_id]={0} AND [suggested_dynamic]=1", url_id);
            //g.RetryMaxOrThrow(() => db.url_parent_term.RemoveRange(db.url_parent_term.Where(p => p.url_id == url_id && p.suggested_dynamic == true)));
            //db.SaveChangesTraceValidationErrors();

            // add
            var pri = 0;
            var url_parent_terms = stemmed_count_contains
                                        .Where(p => p.count > 1) // *** want real commonality
                                        .Select(p => new url_parent_term() {
                                            term_id = p.t.id,
                                             url_id = url_id,
                                                pri = ++pri,
                                                  S = p.count,
                                  suggested_dynamic = true
                                        }).ToList();
            mmdb_model.Extensions.BulkCopy.BulkInsert(db.Database.Connection as SqlConnection, "url_parent_term", url_parent_terms);
        }

        private static List<url_term> DedupeWikiMappedTerms(long url_id, mm02Entities db, List<url_term> wiki_url_terms)
        {
            var wiki_dupes = wiki_url_terms.Where(p => p.term != null)
                                            .GroupBy(p => p.term.name)
                                            .Select(p => new { term_name = p.Key, count = p.Count() })
                                            .Where(p => p.count > 1)
                                            .Select(p => p.term_name);
            if (wiki_dupes.Count() > 0) {
                foreach (var dupe_wiki_name in wiki_dupes) {
                    var wiki_dupe_terms = db.terms.Include("gt_parent").AsNoTracking()
                                            .Where(p => p.name == dupe_wiki_name && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14))
                                            .ToListNoLock();
                    var max_parent_count = wiki_dupe_terms.Max(p => p.gt_parent.Count());
                    var non_max_parent_term_ids = wiki_dupe_terms.Where(p => p.gt_parent.Count() != max_parent_count).Select(p => p.id).ToList();
                    db.url_term.RemoveRange(db.url_term.Where(p => p.url_id == url_id && non_max_parent_term_ids.Contains(p.term_id)));
                    db.SaveChangesTraceValidationErrors();
                }

                // reload wiki terms after de-dupe
                wiki_url_terms = db.url_term.Where(p => p.url_id == url_id && p.wiki_S != null).ToListNoLock();
            }

            return wiki_url_terms;
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
            }).Where(p => p.name.Length <= 128)
            .DistinctBy(p => p.name.ltrim()); // dedupe socialtag and entity w/ same name; should really take highest S

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

                if (term_url_tss == 0)  
                    continue;

                using (var db = mm02Entities.Create()) {
                    // lookup direct term match first -- if wiki_nscount > threshold, then don't bother with disambiguations, e.g. "United States", "Politcs" etc.
                    var wiki_terms_direct_matching = db.terms.Where(p => p.name == term_name
                                                                     && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14))
                                                       .ToListNoLock();
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
                                            parents = GoldenParents.GetOrProcessParents(p.id).Select(p2 => new {
                                                S_norm = p2.S_norm,
                                                t = p2.parent_term,
                                                term_stemmed = stemmer.stem(p2.parent_term.name),
                                                stemmed_words = stemmer.stem(p2.parent_term.name).Split(' ').ToList()
                                            })
                                        }).ToList();

                                // for each ambig, get count of # of ambig's parent's stemmed words that are common with the URLs stemmed calais words
                                //var calais_stemmed_terms = calais_terms_stemmed.Select(p2 => p2.term_stemmed).Distinct().ToList();

                                var calais_stemmed_words = calais_terms_stemmed
                                    .Where(p => p.S == 9) // *** ONLY USE HIGHEST POSSIBLE CALAIS INPUTS FOR DISAMBIGUATION!! ***
                                    .SelectMany(p2 => p2.stemmed_words).Distinct().Except(term_stemmed_words).ToList();

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
                                        var perc = (double)best_match.words_common.Count() / calais_stemmed_words.Count;
                                        if (perc > 0.15 && best_match.words_common.Count() > 3) {
                                            Debug.WriteLine($"DISAMBIG - PARTIAL WORD MATCH (#{best_match.words_common.Count()} = {(perc * 100).ToString("0.0")}%): calais_term={term_name} ==> wiki_disambiguation_term={best_match.ambig.t}[{best_match.ambig.t.id}] > (best stemmed term word match across all ambig parent & calais terms)\r\n\t{string.Join(",", best_match.words_common)}");
                                            wiki_disambiguated_terms_to_add.Add(best_match.ambig.t);
                                        }
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
