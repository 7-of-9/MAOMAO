using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Discovery;
using mm_svc.Util.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Discovery.Search_Goog;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_GoogDiscovery
    {
        [TestMethod]
        public void SmartFind_UserBrowsedUrls_Test1()
        {
            var new_rows = SmartFinder.FindForUserAllBrowsedTopics(20);
        }

        [TestMethod]
        public void SmartFind_UserRegTopics_Test0()
        {
            var new_rows = SmartFinder.FindForUserRegTopics(20);
        }

        [TestMethod]
        public void GoogSearch_Image()
        {
            var a = TldTitle.GetPartialTldNameWithSuffix("blah.com");
            var b = TldTitle.GetPartialTldNameWithSuffix("www.blah.com");
            var c = TldTitle.GetPartialTldNameWithSuffix("www.blah.co.uk");
            var d = TldTitle.GetPartialTldNameWithSuffix("blah.co.uk");
            var e = TldTitle.GetPartialTldNameWithSuffix("dev.blah.co.uk");
            var f = TldTitle.GetPartialTldNameWithSuffix("dev.blah.ie");

            var new_rows = Search_GoogImage.Search("www.meetup.com logo", mm_svc.Images.AzureImageFileType.SiteLogo, null, 0, 0, true);
        }

        [TestMethod]
        public void GoogDiscovery_Test2()
        {
            // next: pipeline for importing + wiring up svr-discovery
            // {term} {country} -- how to get images for plain results? og tags et al - would be part of processing stream

            //page_meta["ip_thumbnail_url"] = $('link[itemprop="thumbnailUrl"]').attr('href') || "";
            //if (page_meta["og_image"] = $('meta[property="og:image"]').attr('content'))
            //if ((page_meta["tw_image"] = $('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content')))
            //if ((page_meta["tw_image_src"] = $('meta[name="twitter:image:src"]').attr('content') || $('meta[property="twitter:image:src"]').attr('content')))
            //if ((page_meta["tw_image0"] = $('meta[name="twitter:image0"]').attr('content') || $('meta[property="twitter:image0"]').attr('content')))
            //if ((page_meta["tw_image1"] = $('meta[name="twitter:image1"]').attr('content') || $('meta[property="twitter:image1"]').attr('content')))
            //if ((page_meta["tw_image2"] = $('meta[name="twitter:image2"]').attr('content') || $('meta[property="twitter:image2"]').attr('content')))
            //if ((page_meta["tw_image3"] = $('meta[name="twitter:image3"]').attr('content') || $('meta[property="twitter:image3"]').attr('content')))
            //if ((page_meta["sha_image"] = $('meta[name="shareaholic:image"]').attr('content')))
            //if ((page_meta["thumbnail"] = $('meta[name="thumbnail"]').attr('content')))
            //if ((page_meta["image_src"] = $('link[rel="image_src"]').attr('href')))

            var urls = mm_svc.Discovery.Search_Goog.Search("history", null, SearchTypeNum.GOOG_MAIN, 0, 0, 0, false);
            ImportUrls.GetMeta(urls, max_parallel: 4);

            urls = mm_svc.Discovery.Search_Goog.Search("board games", null, SearchTypeNum.GOOG_MAIN, 0, 0, 0, false);
            ImportUrls.GetMeta(urls, max_parallel: 4);

            //mm_svc.Discovery.Search_Goog.Search("chess");
        }
    }
}
