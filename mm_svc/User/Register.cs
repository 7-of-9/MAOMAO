using System.Linq;
using mmdb_model;
using System;

namespace mm_svc
{
    public static class UserRegister
    {
        //
        // New null-authenticated user (internal test user)
        //
        public static user CreateNewTestUser()
        {
            using (var db = mm02Entities.Create()) {
                var next_test_no = 1;

                // get test users, split by '+' char on email addr; get highest current test user #
                var test_users = db.users.Where(p => p.email.StartsWith("test+") && p.email.EndsWith("@maomao.rocks")).ToListNoLock();
                if (test_users.Count > 0) {
                    var test_user_nos = test_users.Select(p => Convert.ToInt32(p.email.Split('+').Skip(1).First().Split('@').First()));
                    next_test_no = test_user_nos.Max() + 1;
                }

                // create new test user
                var db_user = new user();
                db_user.firstname = "maomao test";
                db_user.lastname = next_test_no.ToString();
                db_user.email = $"test+{next_test_no}@maomao.rocks";
                db_user.google_user_id = null;
                db_user.gender = "dog";
                db_user.avatar = "http://maomaoweb.azurewebsites.net/static/images/maomao.png";
                db_user.created = DateTime.UtcNow;

                db.users.Add(db_user);
                db.SaveChangesTraceValidationErrors();
                return db_user;
            }
        }

        //
        // New Google-authenticated user
        //
        public static user CreateGoogleUserIfNotExist(string firstname, string lastname, string email, string gender, string avatar, string google_user_id)
        {
            using (var db = mm02Entities.Create()) {
                // check that Google email is exist 
                var db_user = db.users.FirstOrDefault(p => p.email == email);
                if (db_user != null) {
                    if (!string.IsNullOrEmpty(google_user_id))
                    {
                        db_user.google_user_id = google_user_id;
                        db_user.avatar = avatar;
                        db.SaveChangesTraceValidationErrors();
                    }
                    return db_user;
                }
                else {
                    // create new user
                    db_user = new user();
                    db_user.firstname = firstname;
                    db_user.lastname = lastname;
                    db_user.email = email;
                    db_user.google_user_id = google_user_id;
                    db_user.gender = gender;
                    db_user.avatar = avatar;
                    db_user.created = DateTime.UtcNow;

                    db.users.Add(db_user);
                    db.SaveChangesTraceValidationErrors();
                    return db_user;
                }

            }
        }

        //
        // New FB-authenticated user
        //
        public static user CreateFacebookUserIfNotExist(string firstname, string lastname, string email, string gender, string avatar, string fb_user_id)
        {
            using (var db = mm02Entities.Create()) {
                // check that Google email is exist 
                var db_user = db.users.FirstOrDefault(p => p.email == email);
                if (db_user != null) {
                    if (!string.IsNullOrEmpty(fb_user_id))
                    {
                        db_user.fb_user_id = fb_user_id;
                        db_user.avatar = avatar;
                        db.SaveChangesTraceValidationErrors();
                    }
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
                    db_user.avatar = avatar;
                    db_user.created = DateTime.UtcNow;

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
