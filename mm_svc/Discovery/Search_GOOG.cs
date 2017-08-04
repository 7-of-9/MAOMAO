using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Discovery.SmartFinder;

namespace mm_svc.Discovery {
    public static class Search_Goog
    {

        private const string gs_url = "https://www.google.com.sg/search?site=&source=hp&q={0}";

        public static List<ImportUrlInfo> Search(string term,
            SearchTypeNum search_num,
            long user_reg_topic_id,
            long parent_term_id,
            bool suggestion)
        {
            var urls = new List<ImportUrlInfo>();
            var doc = Browser.Fetch(string.Format(gs_url, term));

            // Google.com.sg -- Aug '17
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
                var desc = st.InnerText;
                var title = a.InnerText;

                Debug.WriteLine($"RES: [{title}] desc=[{desc}] href=[{href}]");
                var url_info = new ImportUrlInfo() {
                    search_num = search_num,
                    user_reg_topic_id = user_reg_topic_id,
                    parent_term_id = parent_term_id,
                    suggestion = suggestion,

                    url = href,
                    desc = desc,
                    title = title,
                };

                // on site links
                var onsite_links = s.Descendants("div").Where(p => p.Attributes["class"]?.Value == "osl").FirstOrDefault();
                if (onsite_links != null) {
                    foreach (var osl in onsite_links.Descendants("a")) {
                        var osl_info = new OnsiteLinkInfo() {
                            url_info = url_info,
                            desc = osl.InnerText,
                            href = ParseGoogRedirect(osl.Attributes["href"]?.Value)
                        };
                        url_info.osl.Add(osl_info);
                        Debug.WriteLine($" > OSL: [{osl_info.desc}] href=[{osl_info.desc}]");
                    }
                }

                // calendar items
                var cwc = s.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_cwc").FirstOrDefault(); // "calendar web content" ?
                if (cwc != null) {
                    foreach (var sgd in cwc.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_sgd")) { // "cwc" row
                        // date or title ?!
                        var qgd = sgd.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_qgd").FirstOrDefault();
                        if (qgd == null)
                            continue;

                        // title or title ?!
                        var pgd = sgd.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_pgd").FirstOrDefault();
                        if (pgd == null)
                            continue;

                        // link
                        var pgd_a = pgd.Descendants("a").Where(p => p.Attributes["class"]?.Value == "fl").FirstOrDefault();
                        if (pgd_a == null)
                            continue;
                        var cwc_link = ParseGoogRedirect(pgd_a.Attributes["href"]?.Value);

                        // "qgd" or "pgd" could hold the date/desc - they appear both ways round, randomly
                        DateTime cwc_date;
                        string cwc_title;
                        if (DateTime.TryParse(qgd.InnerText, out cwc_date)) {
                            cwc_title = pgd.Attributes["title"]?.Value;
                        }
                        else if (DateTime.TryParse(pgd.InnerText, out cwc_date)) {
                            cwc_title = qgd.Attributes["title"]?.Value;
                        }
                        else
                            continue;

                        var cwc_info = new CalendarWebContentInfo() {
                            url_info = url_info,
                            desc = cwc_title,
                            date = cwc_date,
                            href = cwc_link,
                        };
                        url_info.cwc.Add(cwc_info);
                        Debug.WriteLine($" > CWC: [{cwc_info.date.ToString("dd MMM yyyy")}] [{cwc_info.desc}] href=[{cwc_info.href}]");
                    }
                }

                urls.Add(url_info);
            }

            return urls;
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
