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
        public static long TrackUrl(string url, long user_id,
            double im_score_delta = 0,
            int time_on_tab_delta = 0,
            int audible_pings_delta = 0)
        {
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                var db_user = db.users.Find(user_id);
                if (db_user == null)
                    throw new ApplicationException("bad user");
                var db_url = db.urls.FirstOrDefault(p => p.url1 == url);
                if (db_url == null)
                    throw new ApplicationException("bad url");

                // Base on userId and url
                // Find last history, if not exist, will insert new one
                var user_url = db.user_url.FirstOrDefault(p => p.user_id == db_user.id && p.url_id == db_url.id);
                if (user_url != null) {
                    user_url.im_score += im_score_delta;
                    user_url.time_on_tab += time_on_tab_delta;
                    user_url.nav_utc = DateTime.UtcNow;  //saveAt;
                    user_url.audible_pings += audible_pings_delta;
                    db.SaveChangesTraceValidationErrors();
                    return user_url.id;
                }
                else {
                    user_url = new user_url();
                    user_url.user_id = db_user.id;
                    user_url.url_id = db_url.id;
                    user_url.im_score = im_score_delta;
                    user_url.time_on_tab = time_on_tab_delta;
                    user_url.nav_utc = DateTime.UtcNow;
                    user_url.audible_pings = audible_pings_delta;
                    db.user_url.Add(user_url);
                    db.SaveChangesTraceValidationErrors();
                    return user_url.id;
                }
            }
        }
    }
}
