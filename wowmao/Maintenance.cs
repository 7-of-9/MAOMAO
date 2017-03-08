using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace wowmao
{
    public static class Maintenance
    {
        public static void SetTopicFlag(bool new_is_topic_flag, string topic_name,  long parent_term_id = 0)
        {
            using (var db = mm02Entities.Create()) {
                var terms = db.terms.Where(p => p.name == topic_name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14));
                foreach (var term in terms.ToListNoLock()) {
                    // toggle topic flag from term
                    term.is_topic = new_is_topic_flag;
                    if (new_is_topic_flag == false)
                        term.is_topic_root = false;
                    db.SaveChangesTraceValidationErrors();

                    // delete from topic_link, if topic flag is being removed
                    if (term.is_topic == false)
                        db.ObjectContext().ExecuteStoreCommand("DELETE FROM [topic_link] WHERE [parent_term_id] IN ({0}) OR [child_term_id] IN ({0})",
                            string.Join(",", terms.Select(p => p.id)));

                    // maintain topic_link
                    if (term.is_topic == true) {
                         
                        if (parent_term_id != 0) {
                            // update any existing topic links
                            var topic_links = db.topic_link.Where(p => p.child_term_id == term.id).ToListNoLock();
                            topic_links.ForEach(p => {
                                if (p.parent_term_id == parent_term_id)
                                    p.disabled = false;
                                else
                                    p.disabled = true;
                            });
                            db.SaveChangesTraceValidationErrors();

                            // if no existing, create new enabled topic link for parent->child
                            if (topic_links.Count == 0) {
                                db.topic_link.Add(new topic_link() {
                                    child_term_id = term.id,
                                    parent_term_id = parent_term_id,
                                    max_distance = 0,
                                    min_distance = 0,
                                    mmtopic_level = 0,
                                    seen_count = 1,
                                    disabled = false
                                });
                                db.SaveChangesTraceValidationErrors();
                            }
                        }
                        else {
                            // no parent term -- therefore topic is a root topic 
                            term.is_topic_root = true;
                            db.SaveChangesTraceValidationErrors();
                        }
                    }

                    // update suggested parents tree topic flag
                    db.ObjectContext().ExecuteStoreCommand("UPDATE [gt_parent] SET is_topic={0} WHERE [parent_term_id] IN ({1}) OR [child_term_id] IN ({1})",
                        new_is_topic_flag ? 1 : 0,
                        string.Join(",", terms.Select(p => p.id)));
                }
            }
        }
    }
}
