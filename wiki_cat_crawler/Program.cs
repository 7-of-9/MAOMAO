using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abot.Crawler;
using Abot.Poco;
using Abot.Core;
using System.Net;

namespace wiki_cat_crawler
{
    class Program
    {
        //
        // for seeding golden tree - crawling :Contents pages
        //
        // but surely better: https://kodingnotes.wordpress.com/2014/12/03/parsing-wikipedia-page-hierarchy/
        // https://www.mediawiki.org/wiki/Manual:Page_table
        // https://www.mediawiki.org/wiki/Manual:Categorylinks_table
        // i.e. raw mysql dump/import of pages and categories! thank you wiki xx
        //

        // https://github.com/sjdirect/abot
        static void Main(string[] args)
        {
            CrawlConfiguration crawlConfig = AbotConfigurationSectionHandler.LoadFromXml().Convert();
            crawlConfig.MaxConcurrentThreads = 5;//this overrides the config value

            PoliteWebCrawler crawler = new PoliteWebCrawler();

            crawler.PageCrawlStartingAsync += crawler_ProcessPageCrawlStarting;
            crawler.PageCrawlCompletedAsync += crawler_ProcessPageCrawlCompleted;
            crawler.PageCrawlDisallowedAsync += crawler_PageCrawlDisallowed;
            crawler.PageLinksCrawlDisallowedAsync += crawler_PageLinksCrawlDisallowed;

            //
            // get top level portals
            //
            crawler.ShouldCrawlPage((pageToCrawl, crawlContext) => {
                CrawlDecision decision = new CrawlDecision { Allow = true };
                var u = pageToCrawl.Uri.ToString();
                if (pageToCrawl.CrawlDepth > 1)
                    return new CrawlDecision { Allow = false, Reason = "Don't crawl too deep" };
                
                if (pageToCrawl.CrawlDepth == 1) { // e.g. https://en.wikipedia.org/wiki/Portal:Contents/Portals
                    if (!u.Contains("Portal:Contents/"))
                        return new CrawlDecision { Allow = false, Reason = "Only crawl Portal:Contents/ pages (1)" };
                    if (u.Contains("Portal:Contents/Overviews") || u.Contains("Portal:Contents/Outlines") || u.Contains("Portal:Contents/Lists") || u.Contains("Portal:Contents/Glossaries") || u.Contains("Portal:Contents/Categories") || u.Contains("Portal:Contents/Lists") || u.Contains("Portal:Contents/Reference"))
                        return new CrawlDecision { Allow = false, Reason = "Only crawl Portal:Contents/ pages (2)" };
                    if (u.Contains("&action=edit"))
                        return new CrawlDecision { Allow = false, Reason = "Don't crawl &action=edit pages" };
                }
                //else if (pageToCrawl.CrawlDepth == 2) { // https://en.wikipedia.org/wiki/Portal:Contents/Culture_and_the_arts
                //    if (!u.Contains("/Outline_of"))
                //        return new CrawlDecision { Allow = false, Reason = "Only crawl outlines" };
                //}
                return decision;
            });
            CrawlResult result = crawler.Crawl(new Uri("https://en.wikipedia.org/wiki/Portal:Contents/Portals"));
            if (result.ErrorOccurred)
                Console.WriteLine("Crawl of {0} completed with error: {1}", result.RootUri.AbsoluteUri, result.ErrorException.Message);
            else
                Console.WriteLine("Crawl of {0} completed without error.", result.RootUri.AbsoluteUri);
        }

        static void crawler_ProcessPageCrawlStarting(object sender, PageCrawlStartingArgs e)
        {
            PageToCrawl pageToCrawl = e.PageToCrawl;
            //Console.WriteLine("About to crawl link {0} which was found on page {1}", pageToCrawl.Uri.AbsoluteUri, pageToCrawl.ParentUri.AbsoluteUri);
        }

        static void crawler_ProcessPageCrawlCompleted(object sender, PageCrawlCompletedArgs e)
        {
            // e.CrawledPage.HtmlDocument 
            // HtmlAgilityPack
            CrawledPage crawledPage = e.CrawledPage;

            if (crawledPage.WebException != null || crawledPage.HttpWebResponse.StatusCode != HttpStatusCode.OK)
                Console.WriteLine("Crawl of page failed {0}", crawledPage.Uri.AbsoluteUri);
            else
                Console.WriteLine($"{crawledPage.CrawlDepth} OK [{crawledPage.Uri.AbsoluteUri}");


            if (string.IsNullOrEmpty(crawledPage.Content.Text))
                Console.WriteLine("Page had no content {0}", crawledPage.Uri.AbsoluteUri);

            var htmlAgilityPackDocument = crawledPage.HtmlDocument; //Html Agility Pack parser
            var angleSharpHtmlDocument = crawledPage.AngleSharpHtmlDocument; //AngleSharp parser
        }

        static void crawler_PageLinksCrawlDisallowed(object sender, PageLinksCrawlDisallowedArgs e)
        {
            CrawledPage crawledPage = e.CrawledPage;
            Console.WriteLine("Did not crawl the links on page {0} due to {1}", crawledPage.Uri.AbsoluteUri, e.DisallowedReason);
        }

        static void crawler_PageCrawlDisallowed(object sender, PageCrawlDisallowedArgs e)
        {
            PageToCrawl pageToCrawl = e.PageToCrawl;
            //Console.WriteLine("Did not crawl page {0} due to {1}", pageToCrawl.Uri.AbsoluteUri, e.DisallowedReason);
        }
    }
}
