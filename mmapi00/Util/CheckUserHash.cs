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
                    goog_uid_hash = MD5(user.google_user_id);
                else
                    ; // ***TODO: FB

                var matches_goog = goog_uid_hash != null && goog_uid_hash == hash;
                var matches_fb = fb_uid_hash != null && fb_uid_hash == hash;

                return matches_goog || matches_fb;
            }
        }

        private static string MD5(string input)
        {
            MD5 md5 = System.Security.Cryptography.MD5.Create();

            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hash.Length; i++)
                sb.Append(hash[i].ToString("X2"));

            return sb.ToString();
        }
    }
}