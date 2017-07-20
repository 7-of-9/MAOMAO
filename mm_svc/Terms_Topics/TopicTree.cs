using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Terms
{
    public static class TopicTree
    {
        public class TopicTermLink
        {
            [NonSerialized]
            public TopicTermLink parent;

            public long topic_id;
            public string topic_name;
            public List<TopicTermLink> children = new List<TopicTermLink>();
        }

        //
        // Get entire topic tree
        //
        public static List<TopicTermLink> GetTopicTree()
        {
            var roots = new List<TopicTermLink>();

            using (var db = mm02Entities.Create()) {

                // get roots
                var root_topic_ids = mm_svc.Terms.GoldenTopics.GetTopicRoot_TermIds();
                roots = root_topic_ids.Select(p => new TopicTermLink() {
                    parent = null,
                    topic_id = p,
                    topic_name = db.terms.Find(p).name,
                }).ToList();

                // add children (recursively)
                roots.ForEach(p => AddChildTopicTerms_Recurse(p));

                return roots;
            }
        }

        private static void AddChildTopicTerms_Recurse(TopicTermLink parent)
        {
            using (var db = mm02Entities.Create()) {
                var topic_links = db.topic_link.Include("term").Include("term1").AsNoTracking()
                       .Where(p => p.parent_term_id == parent.topic_id)
                       .OrderBy(p => p.disabled)
                       .ThenBy(p => p.max_distance)
                       .ToListNoLock();
                foreach (var link in topic_links) {
                    if (!TermInParentsChain(parent, link.child_term_id)) {
                        if (!link.disabled) {
                            var child = new TopicTermLink() {
                                parent = parent,
                                topic_id = link.child_term.id,
                                topic_name = link.child_term.name,
                            };
                            parent.children.Add(child);
                            AddChildTopicTerms_Recurse(child);
                        }
                    }
                    else {
                        Debug.WriteLine($"skipping {link.child_term.name} - already in parent tree.");
                    }
                }
            }
        }

        private static bool TermInParentsChain(TopicTermLink topic_term_link, long term_id)
        {
            if (topic_term_link.topic_id == term_id) return true;
            if (topic_term_link.parent == null) return false;
            return TermInParentsChain(topic_term_link.parent, term_id);
        }

    }
}
