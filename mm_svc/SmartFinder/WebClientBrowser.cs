using HtmlAgilityPack;
using Microsoft.ApplicationInsights.Extensibility;
using mm_global;
using mm_svc.Util.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
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

        internal static Random rnd = new Random();

        internal static List<string> user_agents = new List<string>() { // https://myip.ms/browse/comp_browseragents/Computer_Browser_Agents.html
                // desktop browsers
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
                "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
                "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
                "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
                "Opera/9.80 (Windows NT 6.2; Win64; x64) Presto/2.12 Version/12.16",
                "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko",
                "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
                "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
                "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0",
                "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
                "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
                "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.11 (KHTML like Gecko) Chrome/23.0.1271.95 Safari/537.11",
                "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/36.0.1985.143 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/31.0.1650.63 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/35.0.1916.153 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML like Gecko) Chrome/37.0.2062.120 Safari/537.36",
                "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML like Gecko) Chrome/23.0.1271.95 Safari/537.11",
                "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",

                // crawlers
                "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
                "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
            };

        static WebClientBrowser()
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12 | SecurityProtocolType.Ssl3;

            // https://support.microsoft.com/en-us/help/915599/you-receive-one-or-more-error-messages-when-you-try-to-make-an-http-re
            // try-fix resolve: "The underlying connection was closed: An unexpected error occurred on a send."
            ServicePointManager.Expect100Continue = false;

#if DEBUG
            if (Debugger.IsAttached)
                TelemetryConfiguration.Active.DisableTelemetry = true;
#endif
        }

        public class GZipWebClient : WebClient
        {
            public HttpWebRequest http_request;

            public HttpWebRequest GetHttpRequest(Uri address)
            {
                this.GetWebRequest(address);
                return this.http_request;
            }

            protected override WebRequest GetWebRequest(Uri address)
            {
                HttpWebRequest request = (HttpWebRequest)base.GetWebRequest(address);
                request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
                request.Timeout = 1000 * 10; // 10s

                // https://support.microsoft.com/en-us/help/915599/you-receive-one-or-more-error-messages-when-you-try-to-make-an-http-re
                // try-fix resolve: "The underlying connection was closed: An unexpected error occurred on a send."
                request.KeepAlive = false;
                this.http_request = request;
                return request;
            }
        }

        public static HtmlDocument Fetch(string url, bool internal_rate_limit = false, bool fetch_up_to_head = false)
        {
            string html = null;
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

                var tld = mm_global.Util.GetTldFromUrl(url);
                var partial_tld = TldTitle.GetPartialTldNameWithSuffix(tld);

                //bool identify_as_google_bot = false;
                //if (partial_tld == "quora.com")
                //    identify_as_google_bot = true;
                //if (identify_as_google_bot)
                //    client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
                //else
                //    client.Headers[HttpRequestHeader.UserAgent] = "User-AgentMozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4";

                // random user agent
                var ua = user_agents[rnd.Next(0, user_agents.Count - 1)];
                client.Headers[HttpRequestHeader.UserAgent] = ua;
                
                // set refer if not searching google
                if (!url.Contains("google.com")) {
                    client.Headers[HttpRequestHeader.Referer] = "https://www.google.com/";
                }
                //client.Headers[HttpRequestHeader.Connection] = "keep-alive";

                client.Headers.Set("Upgrade-Insecure-Requests", "1");
                client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";

                // this seems to cause broken youtube page loading into HAP (even with AutomaticDecompression)
                if (!url.Contains("youtube"))
                    client.Headers[HttpRequestHeader.AcceptEncoding] = "zip, deflate, br";

                client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US,en;q=0.8,id;q=0.6";

                // Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
                // Accept-Encoding:gzip, deflate, br
                // Accept-Language:en-US,en;q=0.8,id;q=0.6
                // Connection:keep-alive
                // Cookie:m-b="J9WDmNThJXc2USjRziiHEg\075\075"; m-css_v=69026465bc2615b6; m-login=1; m-ju=2:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjM5OTcyMzgsImlhdCI6MTUwMjYyNzU5NSwiaXNzIjoicXVvcmEifQ.tBaVhsq-WMBO_kt7BsM7vKk8CGdapR4RzF_okIEqTmE; m-sa=1; m-s="1yeRF_oZDq7KYgccsLvZBA\075\075"; m-early_v=4e4c117b82baf40e; m-tz=-480; m-wf-loaded=q-icons-q_serif; _ga=GA1.2.551880802.1502627594; _gid=GA1.2.1504310460.1502627594
                // Host:www.quora.com
                // Referer:https://www.google.com.sg/
                // Upgrade-Insecure-Requests:1
                // User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36

again:
                try {
                    g.LogInfo($"Fetch -- [{url}] ua=[{ua}]...");
                    Trace.Flush();

                    if (fetch_up_to_head) {
                        
                        //Regex head_regex = new Regex(@"<head>(?:.|\n|\r)+?</head>", RegexOptions.Compiled | RegexOptions.IgnoreCase);

                        var req = client.GetHttpRequest(new Uri(url));
                        using (var res = req.GetResponse()) {
                            using (var stream = res.GetResponseStream()) { 

                                int bytesToRead = 1024 * 1;
                                byte[] buffer = new byte[bytesToRead];
                                string contents = "";
                                int length = 0;
                                while ((length = stream.Read(buffer, 0, bytesToRead)) > 0) {
                                    //Debug.WriteLine($"read chunk...");

                                    contents += Encoding.UTF8.GetString(buffer, 0, length);

                                    string head = null;
                                    
                                    // regex hangs, fuck it
                                    //Debug.WriteLine($"running regex...");
                                    //Match m = head_regex.Match(contents);
                                    //Debug.WriteLine($"regex run.");
                                    //if (m.Success) {
                                    //    if (m.Groups.Count >= 2)
                                    //        head = m.Groups[1].Value.ToString();
                                    //}
                                    //else {
                                        // regex above is not reliable - try this too
                                        //var start_head_ndx = contents.IndexOf("<head>", StringComparison.InvariantCultureIgnoreCase);
                                        var start_head_ndx = 0; // assume this - cope with missing start tag
                                                                //if (start_head_ndx != -1) {
                                        var end_head_ndx = contents.IndexOf("</head>", StringComparison.InvariantCultureIgnoreCase);
                                        if (end_head_ndx != -1) {
                                            if (end_head_ndx > start_head_ndx) {
                                                var head_test = contents.Substring(start_head_ndx, end_head_ndx - start_head_ndx + "</head>".Length);
                                                if (!string.IsNullOrEmpty(head_test))
                                                    head = head_test;
                                            }
                                        }
                                        //}
                                    //}

                                    // abort stream if get head tag
                                    if (!string.IsNullOrEmpty(head)) {
                                        html = head;
                                        try {
                                            stream.Close();
                                            client.http_request.Abort();
                                        }
                                        catch (Exception ex) {
                                            g.LogError($"problem cleaning up req/stream: {ex.Message}");
                                        }
                                        break;
                                    }
                                }

                            // if no head tag found, use full stream 
                            if (string.IsNullOrEmpty(html))
                                html = contents;
                            }
                        }
                    }
                    else {
                        html = client.DownloadString(url);
                    }

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
                        g.LogError($" **** 503 -- PROBABLE RATE LIMIT !! [{url}] ****");
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
                        g.LogError($" **** 429 -- TOO MANY REQUESTS !! [{url}] ****");
                        if (wex.Response != null && wex.Response.Headers != null) {
                            //foreach (var header in wex.Response.Headers.AllKeys) {
                            //    var val = wex.Response.Headers[header];
                            //    g.LogWarn($"{header}=[{val}]");
                            // }
                            g.LogWarn($"HEADERS: {wex.Response.Headers.ToString()}");
                        }
                        else
                            g.LogWarn($"NULL HEADERS");
                        //fail_count++;
                        //backoff_secs *= fail_count;
                        //g.LogWarn($"ERR: 429 (fail_count={fail_count}); will sleep for {backoff_secs}...");
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
