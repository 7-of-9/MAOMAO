using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;


namespace mm_svc.Discovery {
    public static class GOOG {

        private const string gs_url = "https://www.google.com.sg/search?site=&source=hp&q=chess+singapore&oq={0}";

        public static void Search(string term)
        {
            // Chrome OSX Version 59.0.3071.115 (Official Build) (64-bit)
            // Aug '17

            string html;
            using (var client = new WebClient()) {
                client.Headers[HttpRequestHeader.UserAgent] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
                client.Headers[HttpRequestHeader.Accept] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8";
                //client.Headers[HttpRequestHeader.AcceptEncoding] = "zip, deflate, br";
                client.Headers[HttpRequestHeader.AcceptLanguage] = "en-US,en;q=0.8,id;q=0.6";
                html = client.DownloadString(string.Format(gs_url, term));
            }

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var result_cells = doc.DocumentNode.Descendants("div").Where(p => p.Attributes["class"]?.Value == "g"); 
            foreach (var result_cell in result_cells)
            {
                //
                // (1)
                // get result div
                //
                var r = result_cell.Descendants("h3").Where(p => p.Attributes["class"]?.Value == "r").FirstOrDefault();
                if (r == null)
                    continue;
                var a = r.Descendants("a").FirstOrDefault();
                if (a == null)
                    continue;
                var href = a.Attributes["href"]?.Value;
                if (string.IsNullOrEmpty(href))
                    continue;

                href = ParseGoogRedirect(href);  // data-href={a.Attributes["data-href"]?.Value}");

                //
                // (2) 
                // get supplementary div
                //
                var s = result_cell.Descendants("div").Where(p => p.Attributes["class"]?.Value == "s").FirstOrDefault();
                if (s == null)
                    continue;
                var st = s.Descendants("span").Where(p => p.Attributes["class"]?.Value == "st").FirstOrDefault(); // supplementary text
                if (st == null)
                    continue;
                var text = st.InnerText;

                Debug.WriteLine($"RES: [{a.InnerText}] desc=[{text}] href=[{href}]");

                // on site links
                var onsite_links = s.Descendants("div").Where(p => p.Attributes["class"]?.Value == "osl").FirstOrDefault();
                if (onsite_links != null) {
                    foreach (var osl in onsite_links.Descendants("a")) {
                        Debug.WriteLine($" > OSL: [{osl.InnerText}] href=[{ParseGoogRedirect(osl.Attributes["href"]?.Value)}]");
                    }
                }

                // calendar items
                var cwc = s.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_cwc").FirstOrDefault(); // "calendar web content" ?
                if (cwc != null) {
                    foreach (var sgd in cwc.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_sgd")) { // cwc row
                        // date
                        var qgd = sgd.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_qgd").FirstOrDefault();
                        if (qgd == null)
                            continue;
                        var cwc_date = Convert.ToDateTime(qgd.InnerText);

                        // title
                        var pgd = sgd.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_pgd").FirstOrDefault();
                        if (pgd == null)
                            continue;
                        var cwc_title = pgd.Attributes["title"]?.Value;

                        // link
                        var pgd_a = pgd.Descendants("a").Where(p => p.Attributes["class"]?.Value == "fl").FirstOrDefault();
                        if (pgd_a == null)
                            continue;
                        var cwc_link = ParseGoogRedirect(pgd_a.Attributes["href"]?.Value);

                        Debug.WriteLine($" > CWC: [{cwc_date.ToString("dd MMM yyyy")}] [{cwc_title}] href=[{cwc_link}]");
                    }
                }
            }
        }

        private static string ParseGoogRedirect(string href)
        {
            // e.g. /url?q=http://www.singaporechess.org.sg/training-courses/scf-chess-courses&amp;sa=U&amp;ved=0ahUKEwjrxrf6sbzVAhUEMI8KHViQAc0QFgg...
            if (href.StartsWith("/url?q=")) { 
                var startat = "/url?q=".Length;
                var upto = href.IndexOf("&amp;");
                if (upto == -1)
                    return null;
                return href.Substring(startat, upto - startat);
            }
            else return href;
        }
    }
}
