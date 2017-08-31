using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.SmartFinder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.SmartFinder.SearchTypes;

namespace tests.Tests.SmartFinder
{
    [TestClass]
    public class Test_BingSmartFind
    {
        [TestMethod]
        public void BingDiscovery_Test0()
        {
            var urls = mm_svc.SmartFinder.Search_Bing.Search("test driven", "site:quora.com", SearchTypeNum.MAIN, 0, 0, 0, false);
            ImportUrls.GetMeta(urls);
        }
    }
}
