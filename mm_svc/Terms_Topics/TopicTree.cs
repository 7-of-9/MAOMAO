using mm_global;
using mmdb_model;
using Newtonsoft.Json;
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
        public class TopicTermLink {
            [NonSerialized]
            public TopicTermLink parent;

            //[JsonProperty(PropertyName = "l")]
            public int level;

            public bool is_topic; 

            public long term_id;

            public string term_name;

            public string img;

            public List<TopicTermLink> child_topics = new List<TopicTermLink>();

            public List<TopicTermLink> child_suggestions = new List<TopicTermLink>();
        }

        public class TermInfo {
            public bool is_topic;

            public long term_id;

            public string term_name;

            public string img;
        }

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

        //
        // Gets just one term info
        //
        public static TermInfo GetTermInfo(long term_id)
        {
            using (var db = mm02Entities.Create()) {
                var t = db.terms.Find(term_id);
                return new TermInfo() {
                    is_topic = t.IS_TOPIC,
                    term_id = t.id,
                    term_name = t.name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(t)
                };
            }
        }

        public static TermInfo GetTermInfo(string term_name) {
            using (var db = mm02Entities.Create()) {
                // find by name - todo: might have problems with case sensitive terms (would return > 2)
                var terms = db.terms.Where(p => (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14) && p.name == term_name).ToListNoLock();
                if (terms.Count == 0)
                    return null;

                term t = null;
                if (terms.Count == 1)
                    t = terms[0];
                else if (terms.Count == 2) { //* 
                    // more than one matching by name? (wiki NS 14 || 0)
                    // then try to disambiguate by picking the one that's in [gt_parent], as it's the source for topic-tree
                    var a = terms[0];
                    var b = terms[1];
                    var a_in_gt_parent = false;
                    var b_in_gt_parent = false;

                    if (db.gt_parent.Any(p => p.child_term_id == a.id || p.parent_term_id == a.id))
                        a_in_gt_parent = true;
                    if (db.gt_parent.Any(p => p.child_term_id == b.id || p.parent_term_id == b.id))
                        b_in_gt_parent = true;

                    if (a_in_gt_parent && b_in_gt_parent) throw new ApplicationException($"two term IDs {a.id} {b.id} both in gt_parent; unexpected.");
                    if (!a_in_gt_parent && !b_in_gt_parent) throw new ApplicationException($"neither term ID {a.id} {b.id} in gt_parent; unexpected.");

                    if (a_in_gt_parent)
                        t = a;
                    else
                        t = b;
                }
                else throw new ApplicationException("got >2 terms; unexpected.");

                return new TermInfo() {
                    is_topic = t.IS_TOPIC,
                    term_id = t.id,
                    term_name = t.name,
                    img = Images.ImageNames.GetTerm_MasterImage_FullUrl(t)
                };
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
