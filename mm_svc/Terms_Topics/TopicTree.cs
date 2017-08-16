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
            public long term_id;
            public string term_name;

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
        public static List<TopicTermLink> GetTopicTree(int n_this = 1, int n_of = 1, double suggestions_min_s_norm = 0.33)
        {
            var roots = new List<TopicTermLink>();

            using (var db = mm02Entities.Create()) {

                // get roots
                var root_topic_ids = mm_svc.Terms.GoldenTopics.GetTopicRoot_TermIds();
                roots = root_topic_ids.Where(p => Math.Abs(p.GetHashCode()) % n_of == n_this - 1).Select(p => new TopicTermLink() {
                    level = 1,
                    is_topic = true,
                    parent = null,
                    term_id = p,
                    term_name = db.terms.Find(p).name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(db.terms.Find(p)),
                }).ToList();

                // add children
                roots.ForEach(p => {
                    AddChildTopicTerms_Recurse(p, suggestions_min_s_norm);
                });

                return roots;
            }
        }

        private static void AddChildTopicTerms_Recurse(TopicTermLink parent, double suggestions_min_s_norm = 0.33)
        {
            using (var db = mm02Entities.Create()) {

                // get suggested terms for parent
                var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(parent.term_id, reprocess: false);
                var suggestions = parents.Where(p => !p.is_topic && p.S_norm > suggestions_min_s_norm).OrderByDescending(p => p.S).ToList();
                suggestions.RemoveAll(p => p.parent_term_id == parent.term_id);
                parent.child_suggestions = suggestions.Select(p => new TopicTermLink() {
                    level = parent.level + 1,
                    is_topic = false,
                    parent = parent,
                    term_id = p.parent_term_id,
                    term_name = p.parent_term.name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.parent_term),
                }).ToList();

                // recurse suggestions, i.e. suggestions for suggestions -- one level max
                // ** this matches SmartFinder which searches for suggestions on Smart Finder term, which in turn may be a suggested term **
                //foreach (var suggestion_link in parent.child_suggestions) {
                Parallel.ForEach(parent.child_suggestions, (suggestion_link) => {
                    int suggestion_level = 1;
                    CalcSuggestionLevel(suggestion_link, ref suggestion_level);
                    if (suggestion_level < 2) {
                        if (!TermInParents_SuggestionsChain(parent, suggestion_link.term_id)) {

                            AddChildTopicTerms_Recurse(suggestion_link, suggestions_min_s_norm);
                        }
                    }
                });
                if (!parent.is_topic)
                    return;

                // get defined child topics
                var topic_links = db.topic_link.Include("term").Include("term1").AsNoTracking()
                    .Where(p => p.parent_term_id == parent.term_id)
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
                                term_id = link.child_term.id,
                                term_name = link.child_term.name,
                                img = Images.ImageNames.GetTerm_MasterImage_FullUrl(link.child_term),
                            };
                            parent.child_topics.Add(child);
                            AddChildTopicTerms_Recurse(child, suggestions_min_s_norm);
                        }
                    }
                    else {
                        ; // Debug.WriteLine($"skipping {link.child_term.name} - already in parent tree.");
                    }
                }
            }
        }

        private static bool TermInParentsChain(TopicTermLink link, long term_id) {
            if (link.term_id == term_id)
                return true;
            if (link.parent == null)
                return false;
            return TermInParentsChain(link.parent, term_id);
        }

        private static bool TermInParents_SuggestionsChain(TopicTermLink link, long term_id) {
            if (link.parent == null)
                return false;
            if (link.parent.child_suggestions.Any(p => p.term_id == term_id))
                return true; //?
            return TermInParents_SuggestionsChain(link.parent, term_id);
        }

        private static void CalcSuggestionLevel(TopicTermLink link, ref int level) {
            if (link.parent == null)
                return;
            if (link.parent.is_topic)
                return;
            level++;
            CalcSuggestionLevel(link.parent, ref level);
        }
    }
}
