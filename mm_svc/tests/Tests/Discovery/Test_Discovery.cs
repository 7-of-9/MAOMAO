using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_Discovery
    {
        [TestMethod]
        public void UserDiscovery_Test0()
        {
            for (int page = 0; page < 10; page++) {
                // todo -- discovery for term
                
                var ret = mm_svc.Discovery.UserDiscovery.Get(20, page * 50, 50);  // todo -- mix up user terms
                foreach (var r in ret) {
                    Debug.WriteLine($"[{r.main_term_name} / {r.sug_term_name}] {r.site_tld} {r.utc.ToString("dd MMM yyyy HH:mm")} {r.title} {r.desc}" +
                        $" CWC:[{string.Join(", ", r.cwc.Select(p => p.date.ToString("dd MMM yyyy") + ":" + p.desc))}]" +
                        $" OSL:[{string.Join(", ", r.osl.Select(p => p.desc))}]");
                }
            }
        }
    }
}
