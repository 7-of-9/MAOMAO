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
    public class Test_UserStream
    {
        [TestMethod]
        public void AllStreams_Test0()
        {
            UserStream.GetAllStreams(20);
        }

        [TestMethod]
        public void PartialStream_Test1()
        {
            using (var db = mm02Entities.Create())
            {
                var test_user = db.users.Find(20);
                var test_url = db.user_url.AsNoTracking().Where(p => p.url_id == 17745).ToListNoLock();

                var test_url_classify_input = test_url.Select(p => new ClassifyUrlInput() {
                    url_id = p.url_id,
                    hit_utc = p.nav_utc,
                    user_id = p.user_id,
                    im_score = p.im_score ?? 0,
                    time_on_tab = p.time_on_tab ?? 0
                }).ToList();

                UserStream.ClassifyUrlSetForUser(test_user, test_url_classify_input, null);
            }
        }
    }
}
