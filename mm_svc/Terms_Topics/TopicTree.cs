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

            public int level;
            public bool is_topic;
            public long topic_id;
            public string topic_name;

            public string img;

            public List<TopicTermLink> child_topics = new List<TopicTermLink>();
            public List<TopicTermLink> child_suggestions = new List<TopicTermLink>();
        }

        //
        // Get topic parents & adjacencies
        //
        //public static List<TopicTermLink> GetTopicTreePartial(long topic_id, int parent_height)
        //{
        //    using (var db = mm02Entities.Create()) {

        //        // get parent term link
        //        var parent_link = db.topic_link.Include("term").Include("term1").AsNoTracking().Where(p => p.child_term_id == topic_id && p.disabled == false).FirstOrDefaultNoLock();
        //        var parent = new TopicTermLink() {
        //            parent = null,
        //            topic_id = parent_link.parent_term_id,
        //            topic_name = parent_link.parent_term.name,
        //        };

        //        // get children of parent (i.e. direct adjacencies for supplied topic)
        //        var parent_child_links = db.topic_link.Include("term").Include("term1").AsNoTracking().Where(p => p.parent_term_id == parent.topic_id && p.disabled == false).ToListNoLock();

        //    }
        //}

        //
        // Get entire topic tree
        //
        public static List<TopicTermLink> GetTopicTree(int n_this = 1, int n_of = 1)
        {
            var roots = new List<TopicTermLink>();

            using (var db = mm02Entities.Create()) {

                // get roots
                var root_topic_ids = mm_svc.Terms.GoldenTopics.GetTopicRoot_TermIds();
                roots = root_topic_ids.Where(p => Math.Abs(p.GetHashCode()) % n_of == n_this - 1).Select(p => new TopicTermLink() {
                    level = 1,
                    is_topic = true,
                    parent = null,
                    topic_id = p,
                    topic_name = db.terms.Find(p).name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(db.terms.Find(p)),
                }).ToList();

                // add children (recursively)
                roots.ForEach(p => {
                    //if (Math.Abs(p.topic_name.GetHashCode()) % n_of == n_this - 1) // intra-process sharing of work
                        AddChildTopicTerms_Recurse(p);
                });

                return roots;
            }
        }

        private static void AddChildTopicTerms_Recurse(TopicTermLink parent)
        {
            using (var db = mm02Entities.Create()) {

                // get suggested terms for parent
                var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(parent.topic_id, reprocess: false);
                var suggestions = parents.Where(p => !p.is_topic && p.S_norm > 0.33).OrderByDescending(p => p.S).ToList();
                suggestions.RemoveAll(p => p.parent_term_id == parent.topic_id);
                parent.child_suggestions = suggestions.Select(p => new TopicTermLink() {
                    level = parent.level + 1,
                    is_topic = false,
                    parent = parent,
                    topic_id = p.parent_term_id,
                    topic_name = p.parent_term.name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.parent_term),
                }).ToList();

                // todo -- recurse n levels of suggestions...

                // get defined child topics
                var topic_links = db.topic_link.Include("term").Include("term1").AsNoTracking()
                       .Where(p => p.parent_term_id == parent.topic_id)
                       .OrderBy(p => p.disabled)
                       .ThenBy(p => p.max_distance)
                       .ToListNoLock();
                foreach (var link in topic_links) {
                    if (!TermInParentsChain(parent, link.child_term_id)) {
                        if (!link.disabled) {
                            var child = new TopicTermLink() {
                                level = parent.level + 1,
                                is_topic = true,
                                parent = parent,
                                topic_id = link.child_term.id,
                                topic_name = link.child_term.name,
                                img = Images.ImageNames.GetTerm_MasterImage_FullUrl(link.child_term),
                            };
                            parent.child_topics.Add(child);
                            AddChildTopicTerms_Recurse(child);
                        }
                    }
                    else {
                        ; // Debug.WriteLine($"skipping {link.child_term.name} - already in parent tree.");
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
