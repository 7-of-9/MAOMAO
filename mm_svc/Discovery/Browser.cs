using HtmlAgilityPack;
using Microsoft.ApplicationInsights.Extensibility;
using mm_global;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public static class Browser
    {
        internal static object lock_obj = "42";
        internal static DateTime last_access = DateTime.MinValue;

        static Browser()
        {
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

        public static HtmlDocument Fetch(string url, bool rate_limit = true) {
            if (rate_limit) {
                lock (lock_obj) {
                    while (DateTime.Now.Subtract(last_access).TotalSeconds < 1) {
                        g.LogLine("Fetch -- waiting...");
                        System.Threading.Thread.Sleep(1000);
                    }
                }
            }

            string html;
            var rnd = new Random();
            using (var client = new GZipWebClient()) {
                // from: Chrome OSX Version 59.0.3071.115 (Official Build) (64-bit)
                //if (rnd.NextDouble() < 0.3)
                //    client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
                //else
                //    client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36";
                //else
                client.Headers[HttpRequestHeader.UserAgent] = "User-AgentMozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4";

                client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
                client.Headers[HttpRequestHeader.AcceptEncoding] = "zip, deflate, br";
                client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US,en;q=0.8,id;q=0.6";
                try {
                    g.LogInfo($"Fetch -- DOWNLOADING: {url}...");
                    html = client.DownloadString(url);
                }
                catch (WebException wex) {
                    if (wex.Message.Contains("503")) {
                        g.LogError(" **** 503 RATE LIMIT !! ****");
                    }
                    g.LogException(wex, $"FAIL: download url=[{url}]");
                    return null;
                }
                if (string.IsNullOrEmpty(html)) {
                    g.LogWarn($"got no html for [{url}]");
                    return null;
                }
            }
            if (rate_limit) {
                lock (lock_obj) {
                    last_access = DateTime.Now;
                }
            }

            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return doc;
        }
    }
}
