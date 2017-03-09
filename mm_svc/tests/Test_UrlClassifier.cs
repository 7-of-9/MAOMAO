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
                var test_url_ids = db.urls.Where(p => p.nlp_suitability_score > 40).Select(p => p.id).ToListNoLock()
                                     .OrderByDescending(p => Guid.NewGuid())
                                     .Take(200).ToList();
                var data = mm_svc.UrlClassifier.ClassifyUrlSet(test_url_ids); // new List<long>() { 10593, 10591, 10579 });

                //var test_user_id = 2; // 2 = dung, 5 = dom
                //var data2 = mm_svc.UrlClassifier.TmpDemo_ClassifyAllUserHistory(test_user_id);
            }
        }
    }
}
