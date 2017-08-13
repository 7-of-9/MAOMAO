using HtmlAgilityPack;
using mm_global;
using mm_global.Extensions;
using mmdb_model;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;

namespace mm_svc.SmartFinder
{
    public static class ImportUrls
    {
        private static ConcurrentDictionary<string, DateTime> tld_last_access = new ConcurrentDictionary<string, DateTime>(); // tld, last_access

        public static void GetMeta(List<ImportUrlInfo> to_import)
        {
            // awis 1 - run for distinct TLDs; populates new awis_sites in DB
            var tlds_uniq = to_import.Select(p => mm_global.Util.GetTldFromUrl(p.url)).Distinct().ToList();
            Parallel.ForEach(tlds_uniq, new ParallelOptions() { MaxDegreeOfParallelism = 4 }, (tld) => {
                var site = SiteInfo.GetOrQueryAwis(tld, out bool from_db);
            });

            // awis 2 - run for all (retrieves from DB); set site id of urls
            Parallel.ForEach(to_import, new ParallelOptions() { MaxDegreeOfParallelism = 4 }, (import) => {
                var tld = mm_global.Util.GetTldFromUrl(import.url);
                var site = SiteInfo.GetOrQueryAwis(tld, out bool from_db);
                if (site.id != 0) //
                    import.awis_site_id = site.id;

                if (!tld_last_access.ContainsKey(tld))
                    tld_last_access.TryAdd(tld, DateTime.MinValue);
            });

            // quora going 403!
            // todo -- handle better, e.g. ycombinator bad gateway + quora too many requests + lots of 403 forbiddens
            // todo -- save downloaded html / jusText : cache for instant presentation on client

            // download all, fetch meta data

            //
            // TODO: this not working since moving to using html_web.LoadFromBrowser (time outs - also # of connections is crazy large
            //        even with chunk size = 1...)
            //
            // CONNECTON LOAD IS INSANE .. just two concurremt ~200 TCP proxy connections; some big issue with WebBrowser here
            // 
            // > revert back to WebRequest (Browser.cs) <
            //

            DownlodUrls(to_import);
        }

        public static void DownlodUrls(List<ImportUrlInfo> to_import)
        {
            const double tld_min_secs_interval = 5;

            foreach (var chunk in to_import.OrderBy(p => p.url.GetHashCode()).ToList().ChunkBy(64)) {

                var threads = new List<Thread>();
                Parallel.ForEach(chunk, url_info => {

                    // PDFs causing problems (stack overflow)
                    if (url_info.url.ToLower().Contains(".pdf")) {
                        url_info.meta_title = null;
                        g.LogWarn($"skipping PDF url [{url_info.url}]");
                        return;
                    }

                    // apply rate limit per tld
                    var tld = mm_global.Util.GetTldFromUrl(url_info.url);
                    var tld_last_access_key = tld_last_access.Keys.Where(p => p == tld).First();
                    lock (tld_last_access_key) {
                        g.LogLine($"[{tld}] got lock...");

                        if (tld_last_access.TryGetValue(tld, out DateTime last_access)) {
                            while (((TimeSpan)DateTime.Now.Subtract(last_access)).TotalSeconds < tld_min_secs_interval) {
                                Thread.Sleep((int)(tld_min_secs_interval * 1000 / 4));
                                g.LogLine($"[{tld}] - waiting...");
                            }
                        }

                        // download
                        HtmlAgilityPack.HtmlDocument doc = null;
                        HtmlWeb html_web = null;
                        try {
                            int retry_count = 0;
                            again:
                            try {
                                //Application.DoEvents();

                                //var wb = new WebBrowser(); // need this for reference to winforms to actually work at runtime in debugger

                                // fetch -- full browser (IE)
                                //g.LogLine($"FETCHING (FullWebBrowser): {url_info.url}...");
                                //var wb = new FullWebBrowser();
                                //wb.GetFinalHtml(url_info.url, out string final_url, out string final_html, out string final_title);
                                //doc = new HtmlAgilityPack.HtmlDocument();
                                //doc.LoadHtml(final_html);

                                // fetch -- webclient
                                g.LogLine($"FETCHING (WebClientBrowser): {url_info.url}...");
                                doc = WebClientBrowser.Fetch(url_info.url); //*

                                tld_last_access.AddOrUpdate(tld, DateTime.Now, (k, v) => DateTime.Now);

                                if (doc != null) {
                                    g.LogGreen($"fetched: {url_info.url}");
                                    url_info.status = "downloaded";
                                }
                            }
                            catch (Exception ex) {
                                if (++retry_count < 3) {
                                    g.LogWarn($"ex={ex.Message} url={url_info.url} - retrying ({retry_count})...");
                                    goto again;
                                }
                                url_info.status = ex.Message.TruncateMax(128);
                                //g.LogAllExceptionsAndStack(ex);
                                return;
                            }
                            if (doc == null) {
                                g.LogWarn($"got no HAP obj for [{url_info.url}]");
                                return;
                            }

                            // extract meta
                            var html = doc.DocumentNode?.OuterHtml;
                            var metas = doc.DocumentNode.SelectNodes("//meta/@content") ?? doc.DocumentNode.Descendants("meta");
                            var links = doc.DocumentNode.SelectNodes("//link/@content") ?? doc.DocumentNode.Descendants("link");
                            var title = doc.DocumentNode.SelectSingleNode("//title");

                            //if (url_info.url == "https://www.meetup.com/Boardgames-Singapore/messages/boards/thread/50319968")
                            //    Debugger.Break();

                            // get images
                            var og_image = metas?.Where(p => p.Attributes["property"]?.Value == "og:image").FirstOrDefault()?.Attributes["content"]?.Value;

                            var tw_image = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image").FirstOrDefault() ??
                                            metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image").FirstOrDefault())?.Attributes["content"]?.Value;

                            var tw_image0 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image0").FirstOrDefault() ??
                                             metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image0").FirstOrDefault())?.Attributes["content"]?.Value;

                            var tw_image1 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image1").FirstOrDefault() ??
                                             metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image1").FirstOrDefault())?.Attributes["content"]?.Value;

                            var tw_image2 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image2").FirstOrDefault() ??
                                             metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image2").FirstOrDefault())?.Attributes["content"]?.Value;

                            var tw_image3 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image3").FirstOrDefault() ??
                                             metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image3").FirstOrDefault())?.Attributes["content"]?.Value;

                            var sha_iamge = (metas?.Where(p => p.Attributes["name"]?.Value == "shareaholic:image").FirstOrDefault())?.Attributes["content"]?.Value;

                            var thumbnail = (metas?.Where(p => p.Attributes["name"]?.Value == "thumbnail").FirstOrDefault())?.Attributes["content"]?.Value;

                            var image_src = (links?.Where(p => p.Attributes["rel"]?.Value == "image_src").FirstOrDefault())?.Attributes["content"]?.Value;

                            var apple_touch_icon_180 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "180x180").FirstOrDefault())?.Attributes["href"]?.Value;
                            var apple_touch_icon_152 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "152x152").FirstOrDefault())?.Attributes["href"]?.Value;
                            var apple_touch_icon_144 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "144x144").FirstOrDefault())?.Attributes["href"]?.Value;
                            var apple_touch_icon_120 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "120x120").FirstOrDefault())?.Attributes["href"]?.Value;
                            var apple_touch_icon_114 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "114x114").FirstOrDefault())?.Attributes["href"]?.Value;
                            var apple_touch_icon_other = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true).FirstOrDefault())?.Attributes["href"]?.Value;
                            //var apple_touch_icon_76 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "76x76").FirstOrDefault())?.Attributes["href"]?.Value;
                            //var apple_touch_icon_72 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "72x72").FirstOrDefault())?.Attributes["href"]?.Value;
                            //var apple_touch_icon_60 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "60x60").FirstOrDefault())?.Attributes["href"]?.Value;
                            //var apple_touch_icon_57 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "57x57").FirstOrDefault())?.Attributes["href"]?.Value;

                            var link_rel_icon_192 = (links?.Where(p => p.Attributes["rel"]?.Value == "icon" && p.Attributes["sizes"]?.Value == "192x192").FirstOrDefault())?.Attributes["href"]?.Value;
                            var link_rel_icon_96 = (links?.Where(p => p.Attributes["rel"]?.Value == "icon" && p.Attributes["sizes"]?.Value == "96x96").FirstOrDefault())?.Attributes["href"]?.Value;

                            var link_rel_shortcut_icon_196 = (links?.Where(p => p.Attributes["rel"]?.Value == "shortcut icon" && p.Attributes["sizes"]?.Value == "196x196").FirstOrDefault())?.Attributes["href"]?.Value;
                            var link_rel_shortcut_icon_128 = (links?.Where(p => p.Attributes["rel"]?.Value == "shortcut icon" && p.Attributes["sizes"]?.Value == "128x128").FirstOrDefault())?.Attributes["href"]?.Value;

                            //page_meta["ip_thumbnail_url"] = $('link[itemprop="thumbnailUrl"]').attr('href') || ""; // todo

                            var image_url = og_image ?? tw_image ?? thumbnail ?? image_src ?? sha_iamge ?? tw_image0 ?? tw_image1 ?? tw_image2 ?? tw_image3
                                         ?? link_rel_shortcut_icon_196 ?? apple_touch_icon_180 ?? link_rel_icon_192
                                         ?? apple_touch_icon_152 ?? apple_touch_icon_144 ?? link_rel_shortcut_icon_128 ?? apple_touch_icon_120 ?? apple_touch_icon_114 ?? link_rel_icon_96
                                         ?? apple_touch_icon_other
                                         ;
                            // title
                            var meta_title = title?.InnerText;

                            // populate
                            url_info.html = html;
                            if (!string.IsNullOrEmpty(image_url) && !image_url.StartsWith("/"))
                                url_info.image_url = HttpUtility.HtmlDecode(image_url);
                            if (!string.IsNullOrEmpty(meta_title))
                                url_info.meta_title = meta_title.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ");
                            else
                                url_info.meta_title = url_info.title;
                            url_info.meta_title = HttpUtility.HtmlDecode(url_info.meta_title);
                            g.LogInfo($">> html_len={url_info.html?.Length} {url_info.url} --> title: [{url_info.meta_title}] img: [{url_info.image_url}]");

                            // error detection
                            DetectErrorsInMetaTitle(url_info, new List<string>() { "400", "403", "409", "401", "404", "407", "410", "451", "402", "408", "414", "417", "429", "499" });
                            DetectErrorsInMetaTitle(url_info, new List<string>() { "500", "503", "509", "501", "504", "502", "511" });
                        }

                        finally {
                            html_web = null;
                            doc = null;
                            GC.Collect();
                        }
                    }
                    //}));
                });

                //threads.ForEach(th => {
                //    th.SetApartmentState(ApartmentState.STA);
                //    th.Start();
                //});

                //while (threads.Any(p => p.ThreadState != System.Threading.ThreadState.Stopped)) {
                //    Thread.Sleep(100);
                //    Application.DoEvents();
                //}

                //threads.ForEach(th => {
                /*Parallel.ForEach(threads, th => { 
                    var sw = new Stopwatch(); sw.Start();
                    while (th.ThreadState != System.Threading.ThreadState.Stopped) {
                        Thread.Sleep(100);
                        if (sw.Elapsed.TotalSeconds > 10) {
                            g.LogWarn($"FORCE: aborting STA thread");// for awis_site_id={awis_site_id}");
                            break;
                        }
                    }
                    try {
                        th.Abort();
                    }
                    catch { }
                });*/
            }
            //);
        }

        private static void DetectErrorsInMetaTitle(ImportUrlInfo url_info, List<string> error_codes)
        {
            if (!string.IsNullOrEmpty(url_info.meta_title)) {
                var error_codes_in_title = error_codes.Where(p => url_info.meta_title.Contains(p)).ToList();
                if (error_codes_in_title.Count > 0)
                    url_info.status = string.Join(",", error_codes_in_title);
            }
        }
    }
}
