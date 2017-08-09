using HtmlAgilityPack;
using mm_global;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using static mm_svc.SmartFinder.SmartFinder;

namespace mm_svc.SmartFinder {
    public static class Search_Goog
    {
        private const string gs_url = "http://www.google.com/search?q={0}{1}&start={2}";
        public static bool goog_rate_limit_hit = false;

        internal static object lock_obj = "42";
        internal static DateTime last_access = DateTime.Now;
        internal static double min_secs_interval = 5;

        public enum SearchTypeNum
        {
            GOOG_MAIN = 1,           // too general - not relevent enough?
            GOOG_LOCAL = 2,          // country + city
            GOOG_DISCUSSION = 3,
            GOOG_YOUTUBE = 4,
            GOOG_NEWS = 5,
            GOOG_COOL = 6,
            GOOG_TRENDING = 7,
            GOOG_LOCAL_EVENTS = 8,
            GOOG_QUORA = 9,
            GOOG_BUZZFEED = 10,
            GOOG_MASHABLE = 11,
            GOOG_MEDIUM = 12,
            GOOG_YCOMBINATOR = 13,
            GOOG_VIMEO = 14,
            GOOG_DAILYMOTION = 15,
        }

        private static string UCaseFirst(string s) {
            if (s.Length > 1) {
                var r = char.ToUpper(s[0]).ToString();
                if (s.Length > 1)
                    r += s.Substring(1);
                return r;
            } else return s;
        }
        private static string OmmitRandom(string s) {
            if (s.Length > 6) {
                var rnd = new Random();
                var omit_at = rnd.Next(1, s.Length - 2);
                var r = s.Substring(0, omit_at) + s.Substring(omit_at + 1);
                return r;
            } else return s;
        }

        public static List<ImportUrlInfo> Search(string search_term, string site_search,
            SearchTypeNum search_num,
            long user_reg_topic_id,
            long parent_term_id, int term_num,
            bool suggestion,
            int pages = 1)
        {
            if (goog_rate_limit_hit == true)
                return null;

            // fuzz search terms
            var rnd = new Random();
            var words = search_term.Trim().Split(' ');
            string fuzzed_search_term = "";
            foreach (var word in words) {
                var fuzzed_word = word;
                if (rnd.NextDouble() < 0.5)
                    fuzzed_word = UCaseFirst(fuzzed_word);
                if (rnd.NextDouble() < 0.9)
                    fuzzed_word = OmmitRandom(fuzzed_word);
                if (rnd.NextDouble() < 0.1)
                    fuzzed_word = fuzzed_word.ToUpper();
                fuzzed_search_term += fuzzed_word + " ";
            }
            //var ss = fuzzed_search_term.Split(' ').ToList();
            //fuzzed_search_term = string.Join(" ", ss.OrderBy(p => rnd.Next()).ToList());

            var urls = new List<ImportUrlInfo>();
            if (!string.IsNullOrEmpty(site_search) && !site_search.EndsWith(" "))
                site_search = site_search + " ";

            for (int page = 0; page < pages; page++) {

                g.LogInfo($">>> GOOG SEARCH: {site_search} page={page} [{fuzzed_search_term}] (FUZZED)");
                HtmlDocument doc = null;
                try {
                    lock (lock_obj) {
                        while (DateTime.Now.Subtract(last_access).TotalSeconds < min_secs_interval) {
                            g.LogLine("Search_Goog.Search - waiting...");
                            System.Threading.Thread.Sleep(2000);
                        }
                    //}

                        doc = Browser.Fetch(string.Format(gs_url, site_search, fuzzed_search_term, page * 10));

                    //lock (lock_obj) {
                        last_access = DateTime.Now;
                    }
                }
                catch (ApplicationException aex) {
                    if (aex.Message == "RATE LIMIT HIT") {
                        goog_rate_limit_hit = true;
                        return null;
                    }
                }
                if (doc == null)
                    continue;

                // Google.com.sg -- Aug '17
                var result_cells = doc.DocumentNode.Descendants("div").Where(p => p.Attributes["class"]?.Value == "g");
                ProcessSearchResults(search_num, user_reg_topic_id, parent_term_id, term_num, suggestion, urls, result_cells);

                // todo ... place results don't have any obvious url associated, so they really don't fit well into the current schema
                //  but obviously extremely cool in principle for MMM...
                //var places_cells = doc.DocumentNode.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_gt");
                //ProcessPlacesResults(search_num, user_reg_topic_id, parent_term_id, term_num, suggestion, urls, places_cells);

                // HAP leaks - this fixes
                doc = null;
                GC.Collect();
            }
            return urls;
        }

        private static void ProcessPlacesResults(
            SearchTypeNum search_num, long user_reg_topic_id, long parent_term_id, bool suggestion, int term_num,
            List<ImportUrlInfo> urls, IEnumerable<HtmlNode> places_cells)
        {
            foreach (var place_cell in places_cells) {
                var rl = place_cell.Descendants("div").Where(p => p.Attributes["class"]?.Value == "_rl").FirstOrDefault();

                var rllt__details = place_cell.Descendants("span").Where(p => p.Attributes["class"]?.Value.Contains("rllt__details") == true).FirstOrDefault();
                if (rllt__details == null)
                    continue;

                var rllt__details_divs = rllt__details.Descendants("div");
                if (rllt__details_divs.Count() < 3)
                    continue;

                var place_name = rl.InnerText;
                var place_addr = rllt__details_divs.Skip(2).First().InnerText;
            }
        }

        private static void ProcessSearchResults(SearchTypeNum search_num, long user_reg_topic_id, long parent_term_id, int term_num, bool suggestion,
            List<ImportUrlInfo> urls, IEnumerable<HtmlNode> result_cells)
        {
            int result_num = 0;
            foreach (var result_cell in result_cells) {
                result_num++;

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

                // new url info
                Debug.WriteLine($"RES: [{title}] desc=[{desc}] href=[{href}]");
                //if (href.StartsWith("/") && Debugger.IsAttached)
                //    Debugger.Break();
                var url_info = new ImportUrlInfo() {
                    search_num = search_num,
                    main_term_id = user_reg_topic_id,
                    parent_term_id = parent_term_id,
                    suggestion = suggestion,
                    url = href,
                    desc = HttpUtility.HtmlDecode(desc),
                    title = HttpUtility.HtmlDecode(title),
                    result_num = result_num,
                    term_num = term_num,
                };

                // on site links
                var onsite_links = s.Descendants("div").Where(p => p.Attributes["class"]?.Value == "osl").FirstOrDefault();
                if (onsite_links != null) {
                    foreach (var osl in onsite_links.Descendants("a")) {
                        var osl_info = new OnsiteLinkInfo() {
                            url_info = url_info,
                            desc = HttpUtility.HtmlDecode(osl.InnerText),
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
                            desc = HttpUtility.HtmlDecode(cwc_title),
                            date = cwc_date,
                            href = cwc_link,
                        };
                        url_info.cwc.Add(cwc_info);
                        Debug.WriteLine($" > CWC: [{cwc_info.date.ToString("dd MMM yyyy")}] [{cwc_info.desc}] href=[{cwc_info.href}]");
                    }
                }

                urls.Add(url_info);
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
