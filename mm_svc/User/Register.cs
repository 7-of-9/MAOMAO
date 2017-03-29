using System.Linq;
using mmdb_model;
using System;

namespace mm_svc.User
{
    public static class Register
    {
        public static user CreateGoogleUserIfNotExist(string firstname, string lastname, string email, string gender, string google_user_id)
        {
            using (var db = mm02Entities.Create())
            {
                // check that Google email is exist 
                var db_user = db.users.FirstOrDefault(p => p.email == email);
                if (db_user != null)
                {
                    return db_user;
                }
                else
                {
                    // create new user
                    db_user = new user();
                    db_user.firstname = firstname;
                    db_user.lastname = lastname;
                    db_user.email = email;
                    db_user.google_user_id = google_user_id;
                    db_user.gender = gender;

                    db.users.Add(db_user);
                    db.SaveChangesTraceValidationErrors();
                    return db_user;
                }

            }
        }

        public static user CreateFacebookUserIfNotExist(string firstname, string lastname, string email, string gender, string fb_user_id)
        {
            using (var db = mm02Entities.Create()) {
                // check that Google email is exist 
                var db_user = db.users.FirstOrDefault(p => p.email == email);
                if (db_user != null) {
                    return db_user;
                }
                else {
                    // create new user
                    db_user = new user();
                    db_user.firstname = firstname;
                    db_user.lastname = lastname;
                    db_user.email = email;
                    db_user.fb_user_id = fb_user_id;
                    db_user.gender = gender;

                    db.users.Add(db_user);
                    db.SaveChangesTraceValidationErrors();
                    return db_user;
                }

            }
        }

        public static user LinkAccount(long user_id, string google_user_id, string fb_user_id)
        {
            using (var db = mm02Entities.Create())
            {
                var db_user = db.users.Find(user_id);
                if (db_user != null)
                {
                    if (!string.IsNullOrEmpty(google_user_id)) db_user.google_user_id = google_user_id;
                    if (!string.IsNullOrEmpty(fb_user_id)) db_user.fb_user_id = fb_user_id;
                    db.SaveChangesTraceValidationErrors();
                    return db_user;
                }
                else
                {
                    throw new ApplicationException("bad user");
                }

            }
        }
    }
}
