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

        public static List<topic_link> GetTopicLinks(long child_term_id)
        {
            using (var db = mm02Entities.Create()) {
                var ret = db.topic_link.AsNoTracking().Where(p => p.child_term_id == child_term_id).ToListNoLock();
                return ret;
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
            const int MIN_REPS = 2;
            topics.RemoveAll(p => topic_name_counts.Where(p2 => p2.count < MIN_REPS).Select(p2 => p2.term_name).Contains(p.t.name));
            topic_name_counts.RemoveAll(p => p.count < MIN_REPS); 

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

                S = (1 / (Math.Pow(p.gl_inv, 3.0)))
                    * Math.Pow(p.t.wiki_nscount ?? 0, (1/3.0))
                    * Math.Pow(topic_name_counts.Single(p2 => p2.term_name == p.t.name).count, (1 / 2.0))
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
