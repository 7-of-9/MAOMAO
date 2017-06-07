using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.GoldenPaths;

namespace mm_svc.Terms
{
    public static class GoldenTopics
    {
        [DebuggerDisplay("{t.name} S={S} S_norm={S_norm}")]
        public class TopicWeighted {
            public term t;
            public double S;
            public double S_norm;
        }

        //
        // Gets the topic_link chain up to root topic 
        //
        public static List<topic_link> GetTopicLinkChain(long child_term_id) {
            var chain = new List<topic_link>();
            RecurseTopicLinkChain(chain, child_term_id);
            return chain;
        }

        private static void RecurseTopicLinkChain(List<topic_link> chain, long child_term_id) {
            using (var db = mm02Entities.Create()) {
                //Debug.WriteLine($"getting parent_single for {child_term_id}...");

                var parent_single = db.topic_link.Include("term").Include("term1").AsNoTracking()
                                      .Where(p => p.child_term_id == child_term_id && p.disabled == false)
                                      .FirstOrDefaultNoLock();
                if (parent_single != null) {
                    if (chain.Any(p => p.id == parent_single.id)) {
                        g.LogLine($"### RecurseTopicLinkChain - CIRCULAR REF for {child_term_id}: abort.");
                        if (Debugger.IsAttached) Debugger.Break();
                    }
                    else {
                        chain.Add(parent_single);
                        if (parent_single.parent_term.is_topic_root == false)
                            RecurseTopicLinkChain(chain, parent_single.parent_term_id);
                    }
                }
            }
        }

        //
        // Picks out editorially defined topics from paths to root; weights them by distance from leaf term, NS# and repetitions
        //
        public static List<TopicWeighted> GetTopics(List<List<TermPath>> root_paths)
        {
            if (root_paths == null || root_paths.Count == 0)
                return null;

            // expects: all paths to root to be for the same leaf term!
            var distinct_leaf_terms = root_paths.Select(p => p.FirstOrDefault()?.t.id).Where(p => p != null);
            if (distinct_leaf_terms.Distinct().Count() > 1) throw new ApplicationException("more than one leaf term in root_paths");

            // pick out topics from each path, save distance from leaf
            var topics = root_paths.SelectMany(p => p.Where(p2 => p2.t.IS_TOPIC).Select(p2 => new {
                tp = p2,
                t = p2.t,
                gl = p2.gl, // lower is closer to root
                gl_norm = p2.gl_norm,
                gl_inv = p2.gl_inv, // lower is closer to leaf
            })).ToList();

            // count by name
            var topic_name_counts = topics.GroupBy(p => p.t.name)
                                          .Select(p => new { term_name = p.Key, count = p.Count() })
                                          .OrderByDescending(p => p.count).ToList();

            // exclude outlier terms - need min. # of repetitions in paths
            //const int MIN_REPS = 2;
            //topics.RemoveAll(p => topic_name_counts.Where(p2 => p2.count < MIN_REPS).Select(p2 => p2.term_name).Contains(p.t.name));
            //topic_name_counts.RemoveAll(p => p.count < MIN_REPS); 

            // topics scored by count and golden level
            var topics_scored = topics.Select(p => new {
                tp = p.tp,
                t = p.t,
                //ns = p.t.wiki_nscount,
                gl = p.gl,
                gl_norm = p.gl_norm,
                gl_inv = p.gl_inv,
                count = topic_name_counts.Single(p2 => p2.term_name == p.t.name).count,
                count_perc = (double)topic_name_counts.Single(p2 => p2.term_name == p.t.name).count / topics.Count,

                S = //
                    // main ranking -- score higher for parents close to leaf term
                    //                 a bit less for parent repetition count
                    //                 and much much less for NS# (editorial topic categorization kind of surplants this)
                    //                 
                    (1 / (Math.Pow(p.gl_inv, 8.0)))
                    * Math.Pow(p.t.wiki_nscount ?? 0, (1 / 3.0))
                    * Math.Pow(topic_name_counts.Single(p2 => p2.term_name == p.t.name).count, (1.5))

                    //
                    // apply a special penalty to wiki root terms History & Geography;
                    //   seems that a lot of terms PtR termiante with these two root terms,
                    //   probably because of so many wiki pages like "companies founded in 1989" or "publications by state", etc.
                    // (example term suffering from this is "New York Times")
                    //
                    // idea is (hopefully) that this relative penalization will still allow them to be correctly scored (as high) for 
                    // leaf terms that are actually historical or geographic
                    //
                    * (p.t.id == (long)g.WIKI_TERM.History ? 0.05 : 1)
                    * (p.t.id == (long)g.WIKI_TERM.Geography ? 0.1 : 1)

                    * 10000

            })
            .OrderByDescending(p => p.S).ToList();

            // flatten 
            var ret = topic_name_counts.Select(p => new TopicWeighted() {
                t = topics_scored.First(p2 => p2.t.name == p.term_name).t,
                S = topics_scored.Where(p2 => p2.t.name == p.term_name).Max(p2 => p2.S) 
                                    //* Math.Pow(topics_scored.Where(p2 => p2.t.name == p.term_name).Max(p2 => p2.count_perc) //(double)p.count
                                    //, (1.0 / 2))
            }).ToList().OrderByDescending(p => p.S).ToList();
            
            ret.ForEach(p => p.S_norm = p.S / ret.Max(p2 => p2.S));

            //
            // maintain topic hierarchy; for each topic, pick out its appearances in root paths - find any topis that are deeper in the root path
            // and make sure that the parent-child relationship is recorded in [topic_link] table
            //
            foreach (var child_topic in ret.Select(p => p.t)) {
                var appears_in_paths = root_paths.Where(p => p.Any(p2 => p2.t.id == child_topic.id)).ToList();

                var parent_topics = new Dictionary<term, List<int>>(); // parent_term, distances
                foreach (var path in appears_in_paths) {
                    // find topic
                    var topic_in_path = path.First(p => p.t.id == child_topic.id);
                    var child_ndx = path.IndexOf(topic_in_path);

                    // find next topic in path, if any
                    if (child_ndx < path.Count - 1) {
                        var parent_topic_in_path = path.Skip(child_ndx + 1).FirstOrDefault(p => p.t.IS_TOPIC);
                        if (parent_topic_in_path != null) {
                            var parent_ndx = path.IndexOf(parent_topic_in_path);
                            var distance = parent_ndx - child_ndx;

                            var existing_key = parent_topics.Keys.FirstOrDefault(p => p.id == parent_topic_in_path.t.id);
                            if (existing_key == null)
                                parent_topics.Add(parent_topic_in_path.t, new List<int>() { distance });
                            else
                                parent_topics[existing_key].Add(distance);
                        }
                    }
                }
                //foreach (var parent_topic in parent_topics.Keys)
                //    Trace.WriteLine($"(child: >{child_topic.name}<[{child_topic.id}] ==> parent: >{parent_topic.name}<[{parent_topic.id}] distances=[{string.Join(",", parent_topics[parent_topic])}])");

                if (parent_topics.Count > 0) {
                    using (var db = mm02Entities.Create()) {
                        foreach (var parent_topic in parent_topics.Keys) {

                            var distances = parent_topics[parent_topic];

                            // look for exact parent-child link
                            var topic_link_specific = db.topic_link.Where(p => p.child_term_id == child_topic.id && p.parent_term_id == parent_topic.id).FirstOrDefaultNoLock();

                            // if the topic is already enabled in topic_link (anywhere) then add it in disabled state (easier maintenance)
                            var topic_link_any_active = db.topic_link.Where(p => p.child_term_id == child_topic.id && p.disabled == false).FirstOrDefaultNoLock();

                            // add specific link if not exists
                            if (topic_link_specific == null) {
                                // get parent topic link, for new topic link's topic level
                                var new_topic_link_level = 1; // 1 root - default
                                var parent_link = db.topic_link.Where(p => p.child_term_id == parent_topic.id).FirstOrDefaultNoLock();
                                if (parent_link != null)
                                    new_topic_link_level = parent_link.mmtopic_level + 1;

                                // new topic link
                                var new_link = new topic_link {
                                    child_term_id = child_topic.id,
                                    parent_term_id = parent_topic.id,
                                    max_distance = distances.Max(),
                                    min_distance = distances.Min(),
                                    mmtopic_level = new_topic_link_level,
                                    disabled = distances.Min() > 3              // add disabled if indirectly related to parent
                                              || topic_link_any_active != null, // or add disabled if child term is in an active link anywhere else already
                                    seen_count = 1,
                                };
                                db.topic_link.Add(new_link);
                                db.SaveChanges_IgnoreDupeKeyEx();
                            }
                            else {
                                    db.Database.ExecuteSqlCommand("UPDATE [topic_link] SET seen_count={0}, max_distance={1}, min_distance={2} WHERE id={3}",
                                        topic_link_specific.seen_count + 1,
                                        Math.Max(topic_link_specific.max_distance, distances.Max()),
                                        Math.Min(topic_link_specific.min_distance, distances.Min()),
                                        topic_link_specific.id);
                            }
                        }
                    }
                }
                //else
                //    Trace.WriteLine($"(child: >{child_topic.name}<[{child_topic.id}] ==> (no parent topics found))");
            }
            return ret;
        }
    }
}
