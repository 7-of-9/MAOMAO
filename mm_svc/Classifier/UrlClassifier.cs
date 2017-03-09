using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using mmdb_model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UrlClassifier
    {
        //
        // classifies a set of urls 
        //
        // uses topic link chain, e.g. "donald trump" is a defined child of "politics" so can fall under that (until there is critical number in child term "donald trump")
        //
        // fn() {
        //   take top 1-2 topics for each url (or s_norm > ~0.5?)
        //   calc topic link chain for each; each url is then in each direct topic, and also in each direct topic's chain parents
        //
        // TODO: * examine each topic, including chain parents -- pick best critical mass topic (by matching url count), prefer high *TS topics;
        //         arrive at a SINGLE topic classification for each distinct url, i.e. "best fit" within topic chain for each url (instead of dup'ing url across topic chain)
        // 
        // TODO: * record in [user_url_classification]
        //
        // for now (demo) -- just return the raw partial tree
        //
        public class UrlInfo {
            public url url;
            public List<SuggestionInfo> suggestions;
            public List<List<TopicInfo>> topic_chains = new List<List<TopicInfo>>();
        }
        public class SuggestionInfo {
            public string term_name;
            public double S;
        }
        [DebuggerDisplay("{term.name} ({children.Count})")]
        public class TopicInfo {
            public string term_name;
            public long term_id;
            public bool url_title_topic;
            public List<long> urls = new List<long>();
            public List<TopicInfo> children = new List<TopicInfo>();
        }

        public class ClassifyInfo {
            public List<TopicInfo> topics;
            public List<UrlInfo> urls;
        }

        public static ClassifyInfo ClassifyUrlSet(List<long> url_ids)
        {
            using (var db = mm02Entities.Create()) {

                // load - get url parent terms: found topics, & url title terms
                var url_parent_terms_qry = db.url_parent_term.AsNoTracking()
                               .Include("term").Include("url")
                               .OrderBy(p => p.url_id).ThenByDescending(p => p.pri)
                               .Where(p => url_ids.Contains(p.url_id));// && (p.found_topic == true || p.url_title_topic == true))
                //Debug.WriteLine(url_parent_terms_qry.ToString());
                var url_parent_terms = url_parent_terms_qry.ToListNoLock();

                var url_title_topics = url_parent_terms.Where(p => p.url_title_topic).ToList();
                var url_topics = url_parent_terms.Where(p => p.found_topic && p.S_norm > 0.8).ToList(); 
                var url_suggestions = url_parent_terms.Where(p => p.suggested_dynamic && !p.term.IS_TOPIC).Where(p => p.S > 1).OrderByDescending(p => p.S).ToList();

                var urls = url_parent_terms.Select(p => p.url).DistinctBy(p => p.id).ToList();
                var url_infos = urls.Select(p => new UrlInfo() {
                            url = p,
                    suggestions = new List<SuggestionInfo>(url_suggestions.Where(p2 => p2.url_id == p.id)
                            .Select(p2 => new SuggestionInfo() { term_name = p2.term.name, S = p2.S ?? 0 }).ToList())
                }).ToList();

                // get topic link chains - regular topics & url title topics
                var topic_chains = new Dictionary<long, List<TopicInfo>>();
                foreach (var topic in url_topics.Union(url_title_topics) // regular topics & url title topics
                                                .DistinctBy(p => p.term_id)) {
                    var topic_term = topic.term;
                    var topic_chain = topic.url_title_topic 
                                            ? new List<topic_link>() { new topic_link() { term1 = db.terms.Find((int)g.WIKI_TERM.TopLevelDomain) } }
                                            : GoldenTopics.GetTopicLinkChain(topic_term.id); // todo: cache topic_links in GoldenTopics

                    var chain = topic_chain.Select(p => new TopicInfo() { term_name = p.parent_term.name, term_id = p.parent_term_id, }).ToList();
                    chain.Reverse();

                    chain.Add(new TopicInfo() { term_name = topic_term.name, term_id = topic_term.id, url_title_topic = topic.url_title_topic });
                    topic_chains.Add(topic_term.id, chain);
                }

                // dedupe chains -- remove chain if the first topic in the chain is contained in any other chains
                var topic_ids_to_remove = new List<long>();
                foreach (var chain_id in topic_chains.Keys) {
                    var other_chains = topic_chains.Where(p => p.Key != chain_id).Select(p => p.Value);
                    if (other_chains.Any(p => p.Any(p2 => p2.term_id == chain_id)))
                        topic_ids_to_remove.Add(chain_id);
                }
                topic_ids_to_remove.ForEach(p => topic_chains.Remove(p));

                // urls --> topic chains
                foreach (var url_info in url_infos) {
                    var topics_for_url = url_topics.Union(url_title_topics) // regular topics & url title topics
                                                   .Where(p => p.url_id == url_info.url.id).ToList();
                    foreach (var topic in topics_for_url) {
                        if (topic_chains.ContainsKey(topic.term_id)) {
                            var topic_chain = topic_chains[topic.term_id];
                            url_info.topic_chains.Add(topic_chain);
                        }
                    }
                    //url_info.topic_chains = url_info.topic_chains.OrderByDescending(p => p.Max(p2 => p2.topic_S_norm)).ToList();
                }

                // walk topic chains; add urls that match each topic in chain
                foreach (var topic_chain in topic_chains.Values) {
                    foreach (var topic in topic_chain) {
                        var urls_matching = url_infos.Where(p => p.topic_chains.Any(p2 => p2.Any(p3 => p3.term_id == topic.term_id)))
                                                     .Select(p => new UrlInfo() { url = p.url,
                                                                          suggestions = url_infos.Single(p2 => p2.url.id == p.url.id).suggestions } );
                        topic.urls.AddRange(urls_matching.Select(p => p.url.id));
                    }
                }
                
                // dbg: order & print 
                var chains = topic_chains.Values.OrderBy(p => string.Join("/", p.Select(p2 => p2.term_name))).ToList();
                foreach (var topic_chain in chains)
                    Debug.WriteLine($"\t\t({string.Join(" > ", topic_chain.Select(topic => topic.term_name + $" ({topic.urls.Count} urls)"))})");

                // ***
                // convert flat chains of TopicInfo to tree of TopicInfo

                // (1) link each TopcInfo to its single child, for each chain, e.g.
                //      (Television (4 urls) > Film (4 urls) > Animation (1 urls))
                //      (Science(2 urls) > Anthropology(1 urls))
                //  ...
                foreach (var chain in chains)
                    for (int i = 0; i < chain.Count - 1; i++)
                        chain[i].children.Add(chain[i + 1]);

                // (2) combine TopicInfo children for identical topics
                for (int i = 0; i < chains.Count; i++ ) {
                    var chain = chains[i];

                    for (int j = chain.Count - 1; j >= 0; j--) {
                        var topic = chain[j];

                        var identical_topics = chains.SelectMany(p => p.Where(p2 => p2.term_id == topic.term_id)).Where(p => p != topic).ToList();
                        foreach (var same_topic in identical_topics) {
                            // add children to new master TopicInfo
                            topic.children.AddRange(same_topic.children.Where(p => !topic.children.Select(p2 => p2.term_id).Contains(p.term_id)));

                            // remove from other chain
                            var other_chain = chains.Single(p => p.Contains(same_topic));
                            var ndx = other_chain.IndexOf(same_topic);
                            other_chain.RemoveRange(ndx, other_chain.Count - ndx);
                        }
                    }
                }
                chains.RemoveAll(p => p.Count == 0);
                chains.ForEach(p => { if (p.Count > 1) p.RemoveRange(1, p.Count - 1); });
                var tree_roots = chains.Select(p => p.First()).ToList();

                var ret = new ClassifyInfo() {
                    topics = tree_roots,
                    urls = url_infos
                };
                return ret;

                // -----
                // ok, working on wiki terms or calais terms is not good enough - they're too disparate
                //  (1) for each url, we need to know the single "best parent guess" (== most common gt_parent across wiki terms)
                //  (2) RecurseClassify then can group by "best parent"? -- depends on commonality of "best parent" across urls
                //get all wiki mapped url_terms and their suggested parents, for supplied urls
                //var url_terms_qry = db.url_term.AsNoTracking()
                //                     .Include("term").Include("term.gt_parent").Include("url")
                //                     .OrderBy(p => p.url_id).ThenByDescending(p => p.tss_norm).ThenByDescending(p => p.S)
                //                     .Where(p => url_ids.Contains(p.url_id)
                //                             && (p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14));
                //Debug.WriteLine(url_terms_qry.ToString());
                //var wiki_terms = url_terms_qry.ToListNoLock();


                // recursive binary approach?
                //  fn_classify(set) {
                //    take top 2 most common terms (1st degree & parents?) in set; split set into 3:
                //      set 1: top term 1 urls
                //      set 2: top term 2 urls
                //      set 3: urls without top term 1 or 2 (unclassified)
                //    foreach set; if set # > desired (or recurse level max?) then recurse this set
                // result: nested tree of sets, w/ associated term paths
                //
                // try 2 -
                //  fn_classify2(set) {
                //    separate url_terms into two set;
                //    sets A and B have zero commonality across their terms - pick a best name/term for each set
                //    then recurse each set (note, no 3rd set here) 
                //var top_set = new UrlSet() { parent_terms = new List<term>() { null } };
                //RecurseUrlSet(top_set, wiki_terms);
                //PrintSet(top_set);
            }
        }

        public static ClassifyInfo TmpDemo_ClassifyAllUserHistory(long user_id) {
            using (var db = mm02Entities.Create()) {
                var url_ids = db.user_url.Where(p => p.user_id == user_id).Select(p => p.url_id).Distinct().ToListNoLock();
                return ClassifyUrlSet(url_ids);
            }
        }

        //private static List<List<url_term>> RecurseUrlSet2(UrlSet parent_set, IEnumerable<url_term> url_terms)
        //{

            //    var term_counts = url_terms.Where(p => !parent_set.parent_terms.Where(p2 => p2 != null).Select(p2 => p2.id).Contains(p.term_id))
            //                               .GroupBy(p => p.term.id)
            //                               .Select(p => new { term_id = p.Key, count = p.Count() })
            //                               .OrderByDescending(p => p.count);
            //    var top_terms = term_counts.Take(2).Select(p => url_terms.First(p2 => p2.term_id == p.term_id).term); // todo - use IDs for perf

            //    // A/B sets -- urls matching top terms
            //    foreach (var top_term in top_terms) {
            //        var url_terms_matching = url_terms.Where(p => p.term_id == top_term.id).ToList();

            //        // (?? url must only be in ONE of the top_term buckets; we need to pick the highest tss_norm url_term)
            //        var urls_matching = url_terms_matching.Select(p => p.url).Distinct().ToList(); // todo - IDs for perf

            //        var other_url_terms = url_terms.Where(p => urls_matching.Select(p2 => p2.id).Contains(p.url_id)).ToList();

            //        var child_set = new UrlSet() {
            //            parent = parent_set,
            //            parent_terms = new List<term>(parent_set.parent_terms),
            //            urls = new List<url>(urls_matching)
            //        };
            //        child_set.parent_terms.Add(top_term);
            //        parent_set.child_sets.Add(child_set);
            //        if (urls_matching.Count() > 20)
            //            RecurseUrlSet(child_set, other_url_terms);
            //    }

            //    return null;
            //}

            //private static List<List<url_term>> RecurseUrlSet(UrlSet parent_set, IEnumerable<url_term> url_terms)
            //{
            //    // find top 2 most common terms in set - direct terms only for now
            //    // todo: filter by S??
            //    //  (todo: include suggested parents)
            //    var term_counts = url_terms.Where(p => !parent_set.parent_terms.Where(p2 => p2 != null).Select(p2 => p2.id).Contains(p.term_id))
            //                               .GroupBy(p => p.term.id)
            //                               .Select(p => new { term_id = p.Key, count = p.Count() })
            //                               .OrderByDescending(p => p.count);
            //    var top_terms = term_counts.Take(2).Select(p => url_terms.First(p2 => p2.term_id == p.term_id).term); // todo - use IDs for perf

            //    // A/B sets -- urls matching top terms
            //    foreach (var top_term in top_terms) {
            //        var url_terms_matching = url_terms.Where(p => p.term_id == top_term.id).ToList();

            //        // (?? url must only be in ONE of the top_term buckets; we need to pick the highest tss_norm url_term)
            //        var urls_matching = url_terms_matching.Select(p => p.url).Distinct().ToList(); // todo - IDs for perf

            //        var other_url_terms = url_terms.Where(p => urls_matching.Select(p2 => p2.id).Contains(p.url_id)).ToList();

            //        var child_set = new UrlSet() {
            //            parent = parent_set,
            //            parent_terms = new List<term>(parent_set.parent_terms),
            //            urls = new List<url>(urls_matching)
            //        };
            //        child_set.parent_terms.Add(top_term);
            //        parent_set.child_sets.Add(child_set);
            //        if (urls_matching.Count() > 20)
            //            RecurseUrlSet(child_set, other_url_terms);
            //    }

            //    // residual set -- urls not matching top terms
            //    //var url_terms_not_matching = url_terms.Where(p => !top_terms.Select(p2 => p2.id).Contains(p.term_id));
            //    //var urls_not_matching = url_terms_not_matching.Select(p => p.url).Distinct(); // todo - IDs for perf

            //    //var not_matching_set = new UrlSet() { term = null, urls = new List<url>(urls_not_matching) };
            //    //parent_set.sets.Add(not_matching_set);
            //    //if (url_terms_not_matching.Count() > 3)
            //    //    RecurseUrlSet(not_matching_set, url_terms_not_matching);

            //    return null;
            //}

            //private static void PrintSet(UrlSet s)
            //{
            //    Trace.WriteLine($"{s.parent_terms.Last()?.name} ({s.urls.Count})");
            //    s.urls.ForEach(p => Trace.WriteLine($"\t[{p.id}] {p.meta_title} {p.url1}"));
            //    Trace.Indent();
            //    s.child_sets.ForEach(p => PrintSet(p));
            //    Trace.Unindent();
            //}

            //public class UrlSet {
            //    public UrlSet parent;
            //    public List<term> parent_terms;
            //    public List<UrlSet> child_sets = new List<UrlSet>();
            //    public List<url> urls = new List<url>();
            //}


            //
            // classifies a single url for a user *in relation to* the user's previously classified urls;
            // tries also to reclassify previously classified 
            //
        public static List<user_url_classification> ClassifySingleUrl(
            long url_id, long user_id, out int new_classifications, out int reused_classifications, 
            int call_level)
        {
            new_classifications = 0;
            reused_classifications = 0;
            List<term> classifications_for_url = new List<term>();
            List<term> classifications_for_prior = new List<term>();

            using (var db = mm02Entities.Create())
            {
                var url = db.urls.Find(url_id);
                var user = db.users.Find(user_id);
                string pretty_meta_all = JsonConvert.SerializeObject(url.meta_all, Formatting.Indented);

                //Trace.WriteLine(pretty_meta_all);

                // create user_url, if not already
                var user_url_id = mm_svc.User.UserHistory.TrackUrl(url.url1, user.id);
                Trace.WriteLine($"{new string('\t', call_level)}>>> url_id={url_id} user_url_id={user_url_id} [{url.meta_title}] ({url.url1})");

                // remove previous user_url classification(s)
                db.user_url_classification.RemoveRange(db.user_url_classification.Where(p => p.user_url_id == user_url_id));
                db.SaveChangesTraceValidationErrors();

                // user's previous classifications
                var previous_term_ids = db.user_url_classification.Where(p => p.user_id == user_id).Select(p => p.term_id).ToListNoLock();

                // all terms -- for suppled URL
                var url_terms = GetOrderedTermsOverThreshold(db.url_term.AsNoTracking().Include("term").Where(p => p.url_id == url_id).ToListNoLock());

                // any terms matching previous?
                var url_terms_in_previously_classified = url_terms.Where(p => previous_term_ids.Contains(p.term_id));

                // * classify *
                const int N_MAX = 3;

                classifications_for_url = url_terms.Take(N_MAX).Select(p => p.term).ToList();
                new_classifications = classifications_for_url.Count;
                if (previous_term_ids.Count == 0)
                {
                    // trivial -- first use case: no previous classifications, take top n all url_terms over threshold
                    reused_classifications = 0;
                }
                else
                {
                    //
                    // subsequent -- take set of previous terms *common to* this URL, union with terms in this URL
                    //               order by aggregate count of terms
                    //               take top (1) item *by aggregate count*, at position 1 (or special, zero?)
                    //               take remainder of URL terms up to N_MAX from URL terms
                    //               this is surely good -- records to n by aggreate count (negative ordinals?)
                    //               and retains top n by simple URL classification (positive ordinals?)
                    //
                    //               apply same negative ordinals to ALL common URLS...? [reclassification]
                    //

                    // count common prior classified terms
                    var common_term_counts = new Dictionary<term, int>(); // term_id, count
                    foreach (var url_term in url_terms_in_previously_classified)
                    {
                        common_term_counts.Add(url_term.term, previous_term_ids.Count(p => p == url_term.term.id) + 1); // +1 for url_term
                    }
                    var ordered_common_terms = common_term_counts.ToList();
                    ordered_common_terms.Sort((p1, p2) => p2.Value.CompareTo(p1.Value));

                    // take top N_MAX common prior classified terms
                    classifications_for_prior.AddRange(ordered_common_terms.Take(N_MAX).Select(p => p.Key).ToList());
                    reused_classifications = classifications_for_prior.Count;
                }

                // record - URL classifications (no regard to prior classifications: positive ordinals)
                short pri = 0;
                var user_url_classifications_for_url_only = new List<user_url_classification>();
                foreach (var term in classifications_for_url) {
                    var user_url_classification = new user_url_classification() {
                        term_id = term.id,
                        //term = term,
                        user_id = user_id,
                        user_url_id = user_url_id,
                        pri = ++pri,
                        reused = false
                    };
                    user_url_classifications_for_url_only.Add(user_url_classification);
                }
                db.user_url_classification.AddRange(user_url_classifications_for_url_only);

                // record -- URL classifications (prior matching classifications, ordered by classification count, negative ordinals)
                pri = 0;
                var user_url_classifications_prior_classifications = new List<user_url_classification>();
                foreach (var term in classifications_for_prior) {
                    var user_url_classification = new user_url_classification() {
                        term_id = term.id,
                        //term = term,
                        user_id = user_id,
                        user_url_id = user_url_id,
                        pri = --pri,
                        reused = true,
                    };
                    user_url_classifications_prior_classifications.Add(user_url_classification);
                }
                db.user_url_classification.AddRange(user_url_classifications_prior_classifications);

                db.SaveChangesTraceValidationErrors();

                // log
                var url_all_classifications = user_url_classifications_for_url_only.Union(user_url_classifications_prior_classifications).ToList();
                foreach (var classification in url_all_classifications) {
                    var url_term = db.url_term.Include("term").Where(p => p.term_id == classification.term_id && p.url_id == url.id).Single();
                    Trace.WriteLine($"{new string('\t', call_level+1)}pri={classification.pri} {url_term.term.name} tss_norm={url_term.tss_norm} S={url_term.S_CALC} reused={classification.reused}");
                }

                // rewrite common user_url_classification negative ordinals  [reclassification of common prior classified]
                if (call_level == 1)
                {
                    var url_all_classification_term_ids = url_all_classifications.Select(p => p.term_id).Distinct();

                    // for each prior common term, lookup URLs that share the term classification
                    // call this fn. on each URL (except this, and without this recursion) -- this recomputes the common terms for the common URLs
                    foreach (var term in classifications_for_prior)
                    {
                        var prior_common_user_url_ids = db.user_url_classification
                                                          .Where(p => p.user_id == user_id && url_all_classification_term_ids.Contains(p.term_id))
                                                          .Select(p => p.user_url.url_id)
                                                          .Distinct().ToListNoLock();

                        foreach (var prior_common_user_url_id in prior_common_user_url_ids)
                        {
                            int l2_new_classifications = 0;
                            int l2_reused_classifications = 0;
                            UrlClassifier.ClassifySingleUrl(prior_common_user_url_id, user_id, out l2_new_classifications, out l2_reused_classifications, call_level: call_level + 1);
                        }
                    }
                }

                return url_all_classifications;
            }
        }

        private static IEnumerable<url_term> GetOrderedTermsOverThreshold(IEnumerable<url_term> url_terms)
        {
            List<url_term> classifications;
            var calais_url_terms = url_terms.Where(p => p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14);
            var high_tss_norm = calais_url_terms.Where(p => p.tss_norm > 0.4).OrderByDescending(p => p.tss_norm);
            var high_S_no_tss = calais_url_terms.Where(p => (p.tss_norm == null || p.tss_norm == 0) && p.S_CALC >= 8).OrderByDescending(p => p.S_CALC);
            classifications = high_tss_norm
                      .Concat(high_S_no_tss).ToList();

            return classifications;
        }
    }
}
