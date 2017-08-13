using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.SmartFinder.SearchTypes;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_Discovery
    {
        [TestMethod]
        public void UserDiscovery_Test0()
        {
            for (int page = 0; page < 10; page++) {
                
                var ret = mm_svc.Discovery.FetchDiscoveries.GetForUser(20, page * 50, 50);

                foreach (var r in ret) {
                    Debug.WriteLine($"[{r.main_term_name} / {r.sug_term_name}] [{(SearchTypeNum)r.search_num}] {r.site_tld} {r.utc.ToString("dd MMM yyyy HH:mm")} {r.title} {r.desc}");

                    foreach (var cwc in r.cwc)
                        Debug.WriteLine($"\tCWC: [{cwc.date.ToString("dd MMM yyyy")} / {cwc.desc}");
                    foreach (var osl in r.osl)
                        Debug.WriteLine($"\tOSL: [{osl.desc}");
                }
            }
        }

        [TestMethod]
        public void TermDiscovery_Test0()
        {
            for (int page = 0; page < 1; page++) {

                // todo -- interleave search types...
                var ret = mm_svc.Discovery.FetchDiscoveries.GetForTerm(4991956, page * 50, 50);

                foreach (var r in ret) {
                    Debug.WriteLine($"[{r.main_term_name} / {r.sug_term_name}] [{(SearchTypeNum)r.search_num}] {r.disc_url_id}] [{r.url}] {r.site_tld} {r.utc.ToString("dd MMM yyyy HH:mm")} {r.title} {r.desc}");

                    foreach (var cwc in r.cwc)
                        Debug.WriteLine($"\tCWC: [{cwc.date.ToString("dd MMM yyyy")} / {cwc.desc}");
                    foreach (var osl in r.osl)
                        Debug.WriteLine($"\tOSL: [{osl.desc}");
                }
            }
        }
    }
}
