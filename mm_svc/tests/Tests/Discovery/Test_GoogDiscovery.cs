using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Discovery;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_GoogDiscovery
    {
        [TestMethod]
        public void SmartFind_Test0()
        {
            SmartFinder.FindForUser(20);
        }

        [TestMethod]
        public void GoogDiscovery_Test0()
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



            //mm_svc.Discovery.Search_Goog.Search("chess singapore");
            //mm_svc.Discovery.Search_Goog.Search("chess");
        }
    }
}
