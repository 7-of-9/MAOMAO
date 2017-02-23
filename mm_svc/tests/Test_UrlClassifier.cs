using Microsoft.VisualStudio.TestTools.UnitTesting;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_UrlClassifier
    {
        [TestMethod]
        public void ClassifyUrlSet_Test1()
        {
            using (var db = mm02Entities.Create()) {
                var test_user_id = 5;
                var test_url_ids = db.urls.Where(p => p.nlp_suitability_score > 30).Select(p => p.id).ToListNoLock()
                                     //.OrderByDescending(p => Guid.NewGuid())
                                     .Take(100).ToList();
                mm_svc.UrlClassifier.ClassifyUrlSet(test_url_ids, test_user_id);
            }
        }
    }
}
