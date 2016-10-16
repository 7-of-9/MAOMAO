using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using mmdb_model;
using mm_global;
using mm_aws;

namespace mm_svc
{
    public static class User
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
                } else
                {
                    // create new user
                    db_user = new user();
                    db_user.firstname = firstname;
                    db_user.lastname = lastname;
                    db_user.email = email;
                    db_user.google_user_id = google_user_id;
                    db_user.gender = gender;
                    // auto generate username and password

                    db.users.Add(db_user);
                    db.SaveChangesTraceValidationErrors();
                    return db_user;
                }
                
            }
        }
    }
}
