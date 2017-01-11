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
    public static class History
    {
        public static user_url TrackingByUrl(string url, int userId, int im_score, int time_on_tabs, int audible_pings, string saveAt)
        {
            using (var db = mm02Entities.Create())
            {
                // Base on userId and url
                // Find last history, if not exist, will insert new one
     
                var db_url = db.urls.FirstOrDefault(p => p.url1 == url);
                if (db_url != null)
                {
                    var db_user = db.users.FirstOrDefault(p => p.id == userId);
                    if (db_user != null)
                    {
                        var db_history = db.user_url.FirstOrDefault(p => p.userId == db_user.id && p.urlId == db_url.id);
                        if(db_history != null)
                        {
                            db_history.im_score += im_score;
                            db_history.time_on_tabs += time_on_tabs;
                            db_history.navUtc = DateTime.Parse(saveAt);
                            db_history.audible_pings += audible_pings;
                            db.SaveChangesTraceValidationErrors();
                            return db_history;
                        }
                        else
                        {
                            db_history = new user_url();
                            db_history.userId = db_user.id;
                            db_history.urlId = db_url.id;
                            db_history.im_score = im_score;
                            db_history.time_on_tabs = time_on_tabs;
                            db_history.navUtc = DateTime.UtcNow;
                            db_history.audible_pings = audible_pings;
                            db.user_url.Add(db_history);
                            db.SaveChangesTraceValidationErrors();
                            return db_history;
                        }
                    }
                    return null;
                }
                return null; 
            }
        }
    }
}
