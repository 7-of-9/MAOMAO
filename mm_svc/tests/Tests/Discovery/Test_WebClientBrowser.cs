using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.SmartFinder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_WebClientBrowser
    {
        [TestMethod]
        public void WebClientBrowser_Test0()
        {
            var test = WebClientBrowser.Fetch("https://en.wikipedia.org/wiki/Timeline_of_feminism_in_the_United_States");
        }
    }
}
