using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global.Extensions;
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
            var locations = mm_svc.Discovery.FetchDiscoveries.GetCountryCities();

            foreach (var location in locations) {
                for (int page = 0; page < 10; page++) {

                    var ret = mm_svc.Discovery.FetchDiscoveries.GetForUser(20, page, 50, location.country, location.city);
                    if (ret.Count == 0) {
                        Debug.WriteLine("** END OF RESULTS **");
                        break;
                    }

                    foreach (var r in ret) {
                        LogResult(page, r);
                    }
                }
            }
        }

        [TestMethod]    
        public void TermDiscovery_Test0()
        {
            var locations = mm_svc.Discovery.FetchDiscoveries.GetCountryCities();
            foreach (var location in locations) {
                    for (int page = 0; page < 1; page++) {

                    var ret = mm_svc.Discovery.FetchDiscoveries.GetForTerm(4991956, page, 50, location.country, location.city);
                    if (ret.Count == 0) {
                        Debug.WriteLine("** END OF RESULTS **");
                        break;
                    }

                    foreach (var r in ret) {
                        LogResult(page, r);
                    }
                }
            }
        }

        [TestMethod]
        public void LocationsDiscovery_Test0()
        {
            var ret = mm_svc.Discovery.FetchDiscoveries.GetCountryCities();
        }

        private static void LogResult(int page, mm_svc.Discovery.DiscoveryInfo r)
        {
            Debug.WriteLine($"page={page} [{r.country}/{r.city}] [{r.main_term_name} / {r.sug_term_name}] [{(SearchTypeNum)r.search_num}] {r.site_tld} {r.utc.ToString("dd MMM yyyy HH:mm")} {r.title.nonewline()} {r.desc.nonewline()}");

            foreach (var cwc in r.cwc)
                Debug.WriteLine($"\tCWC: [{cwc.date.ToString("dd MMM yyyy")} / {cwc.desc.nonewline()}]");
            foreach (var osl in r.osl)
                Debug.WriteLine($"\tOSL: [{osl.desc.nonewline()}]");
        }

    }
}
