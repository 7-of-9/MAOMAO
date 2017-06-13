using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Homepage
    {
        [TestMethod]
        public void Homepage_Test0()
        {
            var ret = UserHomepage.Get(15);

        }

        [TestMethod]
        public void PartialStream_Test1()
        {
            using (var db = mm02Entities.Create())
            {
                var test_user = db.users.Find(20);
                var test_url = db.user_url.AsNoTracking().Where(p => p.url_id == 17745).ToListNoLock();

                UserHomepage.GetHomepage(test_user, test_url, null);
            }
        }
    }
}
