using HtmlAgilityPack;
using Microsoft.ApplicationInsights.Extensibility;
using mm_global;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace mm_svc.SmartFinder
{
    // general WebBrowser - used by google searches (which uses its own rate limiting) and also for
    // misc. scraping/downloading (which uses this class' internal rate limiting)
    public static class WebClientBrowser
    {
        internal static object lock_obj = "42";
        internal static DateTime last_access = DateTime.MinValue;
        internal static double min_secs_interval = 1;

        internal static int backoff_secs_base = 30;
        internal static int backoff_secs = backoff_secs_base;
        internal static int success_count = 0;
        internal static int fail_count = 0;

        static WebClientBrowser()
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

#if DEBUG
            if (Debugger.IsAttached)
                TelemetryConfiguration.Active.DisableTelemetry = true;
#endif
        }

        public class GZipWebClient : WebClient
        {
            protected override WebRequest GetWebRequest(Uri address)
            {
                HttpWebRequest request = (HttpWebRequest)base.GetWebRequest(address);
                request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
                return request;
            }
        }

        public static HtmlDocument Fetch(string url, bool internal_rate_limit = false)
        {
            string html;
            var rnd = new Random();

            if (internal_rate_limit) {
                lock (lock_obj) {
                    while (DateTime.Now.Subtract(last_access).TotalSeconds < min_secs_interval) {
                        g.LogLine("Browser.Fetch - waiting...");
                        System.Threading.Thread.Sleep(1000);
                    }
                }
            }

            using (var client = new GZipWebClient()) { // WebClient()) {
                // from: Chrome OSX Version 59.0.3071.115 (Official Build) (64-bit)
                //if (rnd.NextDouble() < 0.3)
                //    client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
                //else
                //    client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36";
                //else
                client.Headers[HttpRequestHeader.UserAgent] = "User-AgentMozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4";

                client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";

                // this seems to cause broken youtube page loading into HAP (even with AutomaticDecompression)
                if (!url.Contains("youtube"))
                    client.Headers[HttpRequestHeader.AcceptEncoding] = "zip, deflate, br";
again:
                client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US,en;q=0.8,id;q=0.6";
                try {
                    g.LogLine($"Fetch -- DOWNLOADING: {url}...");
                    html = client.DownloadString(url);

                    success_count++;
                    fail_count = Math.Max(0, --fail_count);
                    backoff_secs = backoff_secs_base;

                    if (internal_rate_limit) {
                        lock (lock_obj) {
                            last_access = DateTime.Now;
                        }
                    }
                }
                catch (WebException wex) {
                    if (wex.Message.Contains("503")) { // google
                        g.LogError(" **** 503 -- PROBABLE RATE LIMIT !! ****");
                        if (url.Contains("google.com")) {
                            fail_count++;
                            backoff_secs *= fail_count;
                            g.LogWarn($"ERR: 503 for GOOG URL [{url}] (fail_count={fail_count}); sleep {backoff_secs} secs & retry...");
                            Thread.Sleep(backoff_secs * 1000);
                            goto again;
                        } else {
                            g.LogWarn($"ERR: 503 for non-goog URL [{url}] -- will not retry.");
                            return null;
                        }
                    }
                    else if (wex.Message.Contains("429")) { // quora
                        g.LogError(" **** 429 -- TOO MANY REQUESTS !! ****");
                        fail_count++;
                        backoff_secs *= fail_count;
                        g.LogWarn($"ERR: 429 (fail_count={fail_count}); will sleep for {backoff_secs}...");
                        //Thread.Sleep(backoff_secs * 1000);
                        //goto again;
                        return null;
                    }
                    else {
                        g.LogWarn($"FAIL: {wex.Message} url=[{url}]");
                    }
                    return null;
                }
                if (string.IsNullOrEmpty(html)) {
                    g.LogWarn($"got no html for [{url}]");
                    return null;
                }
            }
        
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return doc;
        }
    }
}
