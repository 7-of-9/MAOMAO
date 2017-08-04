using HtmlAgilityPack;
using mm_global;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public static class Browser
    {
        public static HtmlDocument Fetch(string url) {
            string html;
            using (var client = new WebClient()) {
                // from: Chrome OSX Version 59.0.3071.115 (Official Build) (64-bit)
                client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
                client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
                //client.Headers[HttpRequestHeader.AcceptEncoding] = "zip, deflate, br";
                client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US,en;q=0.8,id;q=0.6";
                try {
                    html = client.DownloadString(url);
                } catch (WebException wex) {
                    g.LogException(wex, $"FAIL: download url=[{url}]");
                    return null;
                }
                if (string.IsNullOrEmpty(html))
                    return null;
            }
            var doc = new HtmlDocument();
            doc.LoadHtml(html);
            return doc;
        }
    }
}
