using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.SmartFinder;
using mmdb_model;
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
            var doc = WebClientBrowser.Fetch(
                "https://www.w3.org/People/Berners-Lee/Weaving/Overview.html",
                //"http://www.baligatra.com/", 
                fetch_up_to_head: true);

            ImportUrls.ExtractMetaData(new ImportUrlInfo() { }, doc);
        }

        [TestMethod]
        public void WebClientBrowser_FetchUpToHead_Test0()
        {
            using (var db = mm02Entities.Create()) {
                var test_urls = db.disc_url.Select(p => p.url).Take(100);
                Parallel.ForEach(test_urls, (test_url) => {
                    var doc = WebClientBrowser.Fetch(test_url, fetch_up_to_head: true);
                    ImportUrls.ExtractMetaData(new ImportUrlInfo() { }, doc);
                });
            }
        }
        
    }
}
