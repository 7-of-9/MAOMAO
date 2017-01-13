using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using mmdb_model;
using mm_global;
using mm_aws;

namespace mm_svc.User
{
    public static class UserHistory
    {
        public static long TrackingByUrl(string url, int userId,
            double im_score_delta,
            int time_on_tab_delta,
            int audible_pings_delta)
        {
            using (var db = mm02Entities.Create()) {
                var db_user = db.users.Find(userId);
                if (db_user == null)
                    throw new ApplicationException("bad user");
                var db_url = db.urls.FirstOrDefault(p => p.url1 == url);
                if (db_url == null)
                    throw new ApplicationException("bad url");

                // Base on userId and url
                // Find last history, if not exist, will insert new one
                var db_history = db.user_url.FirstOrDefault(p => p.userId == db_user.id && p.urlId == db_url.id);
                if (db_history != null) {
                    db_history.im_score += im_score_delta;
                    db_history.time_on_tab += time_on_tab_delta;
                    db_history.navUtc = DateTime.UtcNow;  //saveAt;
                    db_history.audible_pings += audible_pings_delta;
                    db.SaveChangesTraceValidationErrors();
                    return db_history.id;
                }
                else {
                    db_history = new user_url();
                    db_history.userId = db_user.id;
                    db_history.urlId = db_url.id;
                    db_history.im_score = im_score_delta;
                    db_history.time_on_tab = time_on_tab_delta;
                    db_history.navUtc = DateTime.UtcNow;
                    db_history.audible_pings = audible_pings_delta;
                    db.user_url.Add(db_history);
                    db.SaveChangesTraceValidationErrors();
                    return db_history.id;
                }
            }
        }
    }
}
