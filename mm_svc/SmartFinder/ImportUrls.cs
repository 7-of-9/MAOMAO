using HtmlAgilityPack;
using mm_global;
using mm_global.Extensions;
using mm_svc.Util.Utils;
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

                // get simple tld - for rate limiting per tld
                var partial_tld = TldTitle.GetPartialTldNameWithSuffix(tld);
                if (!tld_last_access.ContainsKey(partial_tld))
                    tld_last_access.TryAdd(partial_tld, DateTime.MinValue);
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
            foreach (var chunk in to_import.OrderBy(p => p.url.GetHashCode()).ToList().ChunkBy(64)) {

                var threads = new List<Thread>();
                Parallel.ForEach(chunk, url_info => {

                    // PDFs causing problems (stack overflow)
                    if (url_info.url.ToLower().Contains(".pdf")) {
                        url_info.meta_title = null;
                        g.LogWarn($"skipping PDF url [{url_info.url}]");
                        return;
                    }
                    
                    // default meta_title to whatever search gave
                    url_info.meta_title = url_info.title;

                    // apply rate limit per tld
                    var tld = mm_global.Util.GetTldFromUrl(url_info.url);
                    var partial_tld = TldTitle.GetPartialTldNameWithSuffix(tld);
                    double tld_min_secs_interval = 5;

                    // still getting 429 too many requests - increased delay to 120s...
                    // may have to accept that it can't be done; if they're doing reverse lookups on googlebot, i can't get beyond that.
                    // i.e. client needs to sometimes load URL html, other times use our cached html; is there even real value in caching html?! just pushes bandwidth 
                    // costs onto MM -- so, first cut is tolerate download failures and client does full http gets on discovery items; no reason it 
                    // can't do the reader view on client side.
                    var skip_download = false;
                    if (partial_tld == "quora.com")  //** ban seems to be ~2 days per IP ...
                        skip_download = true;
                        //; tld_min_secs_interval = 120;  // went 429 when at 30s - but worked for some time with new IPs @ 30s; todo - retry at 120s

                    var tld_last_access_key = tld_last_access.Keys.Where(p => p == partial_tld).First();
                    lock (tld_last_access_key) {
                        g.LogLine($"[{partial_tld}] got lock...");

                        if (tld_last_access.TryGetValue(partial_tld, out DateTime last_access)) {
                            while (((TimeSpan)DateTime.Now.Subtract(last_access)).TotalSeconds < tld_min_secs_interval) {
                                Thread.Sleep((int)(tld_min_secs_interval * 1000 / 4));
                                g.LogLine($"[{partial_tld}] - (tld_min_secs_interval={tld_min_secs_interval}) - waiting...");
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

                                //if (partial_tld == "quora.com") {
                                //    // fetch -- full browser (IE)
                                //    g.LogLine($"FETCHING (FullWebBrowser): {url_info.url}...");
                                //    var wb = new FullWebBrowser();
                                //    wb.GetFinalHtml(url_info.url, out string final_url, out string final_html, out string final_title);
                                //    doc = new HtmlAgilityPack.HtmlDocument();
                                //    doc.LoadHtml(final_html);
                                //}
                                //else {

                                if (!skip_download) {
                                    // fetch -- webclient
                                    g.LogLine($"FETCHING (WebClientBrowser): {url_info.url}...");
                                    doc = WebClientBrowser.Fetch(url_info.url, fetch_up_to_head: true); //*

                                    if (doc != null) {
                                        g.LogGreen($"fetched: {url_info.url}");
                                        url_info.status = "downloaded";
                                    }
                                    else url_info.status = "download failed";
                                }
                                else {
                                    g.LogLine($"(skipping download for {url_info.url})");
                                    url_info.status = "download skipped";
                                }

                                //}

                                tld_last_access.AddOrUpdate(partial_tld, DateTime.Now, (k, v) => DateTime.Now);
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
                            if (doc == null && !skip_download) {
                                g.LogWarn($"got no HAP obj for [{url_info.url}]");
                                return;
                            }

                            // extract meta
                            ExtractMetaData(url_info, doc);
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

        public static void ExtractMetaData(ImportUrlInfo url_info, HtmlAgilityPack.HtmlDocument doc)
        {
            if (doc == null) {
                g.LogWarn($"got null HAP doc for url [{url_info.url}]");
                return;
            }
            if (doc.DocumentNode == null) {
                g.LogWarn($"got null HAP DocumentNode for url [{url_info.url}]");
                return;
            }

            var html = doc.DocumentNode?.OuterHtml;
            var metas = doc.DocumentNode?.SelectNodes("//meta/@content") ?? doc.DocumentNode.Descendants("meta");
            var links = doc.DocumentNode?.SelectNodes("//link/@content") ?? doc.DocumentNode.Descendants("link");
            var title = doc.DocumentNode?.SelectSingleNode("//title");

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
            url_info.meta_title = HttpUtility.HtmlDecode(url_info.meta_title);
            g.LogInfo($">> html_len={url_info.html?.Length} [{url_info.url}] --> title: [{url_info.meta_title}] img: [{url_info.image_url}]");
            //g.LogInfo($"{url_info.html}");

            // error detection
            DetectErrorsInMetaTitle(url_info, new List<string>() { "400", "403", "409", "401", "404", "407", "410", "451", "402", "408", "414", "417", "429", "499" });
            DetectErrorsInMetaTitle(url_info, new List<string>() { "500", "503", "509", "501", "504", "502", "511" });
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
