using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global.Extensions;
using mm_svc.Terms;
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
                        Debug.WriteLine($"** END OF RESULTS (country={location.country}, city={location.city}) **");
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

                    var ret = mm_svc.Discovery.FetchDiscoveries.GetForTerm(5146162, page, 50, location.country, location.city);
                    if (ret.Count == 0) {
                        Debug.WriteLine($"** END OF RESULTS (country={location.country}, city={location.city}) **");
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

        [TestMethod]
        public void TreeTerms_vs_SmartFinderTerms_Test0()
        {
            var tree = TopicTree.GetTopicTree(suggestions_min_s_norm: 0);
            var disc = mm_svc.Discovery.FetchDiscoveries.GetForUser(20, 0, 50);

        }

        private static void LogResult(int page, mm_svc.Discovery.DiscoveryInfo r)
        {
            Trace.WriteLine($"page={page} [{r.country}/{r.city}] [{r.main_term_name} (#{r.main_term_id}) / {r.sub_term_name} (#{r.sub_term_id})] [{r.utc.ToString("dd MMM yyyy HH:mm")}] [{(SearchTypeNum)r.search_num}] [{r.site_tld}] [{r.title.nonewline()}]");// {r.desc.nonewline()}");

            foreach (var cwc in r.cwc)
                Trace.WriteLine($"\tCWC: [{cwc.date.ToString("dd MMM yyyy")} / {cwc.desc?.nonewline()}]");
            foreach (var osl in r.osl)
                Trace.WriteLine($"\tOSL: [{osl.desc?.nonewline()}]");
        }

    }
}
