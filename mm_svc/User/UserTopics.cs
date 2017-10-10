using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UserTopics
    {
        public class TopicInfo
        {
            public long term_id;
            public string term_name;
        }

        public static int AddUserTopics(long user_id, List<long> topic_ids)
        {
            using (var db = mm02Entities.Create()) {
                var existing = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                var to_add = topic_ids.Where(p => !existing.Contains(p)).ToList();
                db.user_reg_topic.AddRange(to_add.Select(p => new user_reg_topic {
                    user_id = user_id,
                    topic_id = p,
                }));
                return db.SaveChangesTraceValidationErrors();
            }
        }

        public static void AddUserTopic(long user_id, long topic_id)
        {
            using (var db = mm02Entities.Create()) {
                var existing = db.user_reg_topic.Where(p => p.user_id == user_id && p.topic_id == topic_id).FirstOrDefaultNoLock();
                if (existing == null) {
                    var new_user_reg_topic = new user_reg_topic() {
                        user_id = user_id,
                        topic_id = topic_id
                    };
                    db.user_reg_topic.Add(new_user_reg_topic);
                    db.SaveChangesTraceValidationErrors();
                }
            }
        }

        public static void RemoveUserTopic(long user_id, long topic_id)
        {
            using (var db = mm02Entities.Create()) {
                var existing = db.user_reg_topic.Where(p => p.user_id == user_id && p.topic_id == topic_id).FirstOrDefaultNoLock();
                if (existing != null) {
                    db.user_reg_topic.Remove(existing);
                    db.SaveChangesTraceValidationErrors();
                }
            }
        }

        public static List<TopicInfo> GetUserTopics(long user_id)
        {
            var topics = new List<TopicInfo>();
            using (var db = mm02Entities.Create())
            {
                var topics_qry = db.user_reg_topic.Include("term").Where(p => p.user_id == user_id);
                topics = topics_qry.Select(p => new TopicInfo() { term_id = p.term.id, term_name = p.term.name }).ToListNoLock();
                return topics;
            }
        }
    }
}
