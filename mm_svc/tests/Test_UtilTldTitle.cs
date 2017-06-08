using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_UtilTldTitle
    {
        [TestMethod]
        public void UtilTldTitle_Test1()
        {
            Debug.WriteLine($"{mm_svc.Util.Utils.TldTitle.GetSimpleTldName("www.bbc.co.uk")}");
            Debug.WriteLine($"{mm_svc.Util.Utils.TldTitle.GetSimpleTldName("bbc.co.uk")}");
            Debug.WriteLine($"{mm_svc.Util.Utils.TldTitle.GetSimpleTldName("bbc.com")}");

            using (var db = mm02Entities.Create()) {
                var tld_title_term_names = db.terms.Where(p => p.term_type_id == (int)g.TT.TLD_TITLE).Select(p => p.name).ToListNoLock();
                foreach (var tld_name in tld_title_term_names) {
                    var simple_name = mm_svc.Util.Utils.TldTitle.GetSimpleTldName(tld_name);
                    Debug.WriteLine($"{tld_name} => {simple_name}");
                }
            }
        }
    }
}
