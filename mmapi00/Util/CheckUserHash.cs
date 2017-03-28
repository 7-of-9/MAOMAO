using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace mmapi00.Util
{
    public static class UserHash
    {
        public static bool Ok(long user_id, string hash)
        {
            using (var db = mm02Entities.Create()) {
                var user = db.users.Find(user_id);
                if (user == null) return false;

                string goog_uid_hash = null;
                string fb_uid_hash = null;
                if (!string.IsNullOrEmpty(user.google_user_id))
                    goog_uid_hash = mm_svc.Util.Hashing.MD5(user.google_user_id);
                if (!string.IsNullOrEmpty(user.fb_user_id))
                    fb_uid_hash = mm_svc.Util.Hashing.MD5(user.fb_user_id);

                var matches_goog = goog_uid_hash != null && goog_uid_hash == hash;
                var matches_fb = fb_uid_hash != null && fb_uid_hash == hash;

                return matches_goog || matches_fb;
            }   
        }
    }
}