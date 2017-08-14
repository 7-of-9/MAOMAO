using HtmlAgilityPack;
using mm_global;
using mm_global.Extensions;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using static mm_svc.SmartFinder.SearchTypes;
using static mm_svc.SmartFinder.SmartFinder;

namespace mm_svc.SmartFinder
{
    public static class Search_Bing
    {
        // http://www.bing.com/search?q=site%3Aquora.com+test+driven
        private const string bs_url = "http://www.bing.com/search?q={0}{1}&first={2}{3}";
        public static bool bing_rate_limit_hit = false;

        internal static object lock_obj = "42";
        internal static DateTime last_access = DateTime.MinValue;

        internal static double min_secs_interval = 1 * 1;

        internal static int total_searches = 0;

        public static List<ImportUrlInfo> Search(string search_term, string site_search,
            SearchTypeNum search_num,
            long user_reg_topic_id,
            long parent_term_id, int term_num,
            bool suggestion,
            int pages = 1,
            string additional_bing_args = "")
        {
            if (bing_rate_limit_hit == true)
                return null;

            // prepare seach term - no fuzzing for bing; seems exact by default, or at least bad at detecting typos!
            var urls = new List<ImportUrlInfo>();
            if (!string.IsNullOrEmpty(site_search) && !site_search.EndsWith(" "))
                site_search = site_search + " ";

            search_term = search_term.Trim().Replace(" ", "+");
            site_search = site_search?.Replace(" ", "+");

            for (int page = 0; page < pages; page++) {

                g.LogGray($">>> BING SEARCH #{total_searches}: {site_search} page={page} [{search_term}]");
                HtmlDocument doc = null;
                try {
                    lock (lock_obj) {
                        while (DateTime.Now.Subtract(last_access).TotalSeconds < min_secs_interval) {
                            //g.LogLine("Search_Goog.Search - waiting 1...");
                            System.Threading.Thread.Sleep(1000);
                        }
                        //}

                        var url = string.Format(bs_url, site_search, search_term, page * 10, additional_bing_args);
                        doc = WebClientBrowser.Fetch(url);
                        if (doc != null)
                            total_searches++;

                        //lock (lock_obj) {
                        last_access = DateTime.Now;
                    }
                }
                catch (ApplicationException aex) {
                    if (aex.Message == "RATE LIMIT HIT") {
                        bing_rate_limit_hit = true;
                        return null;
                    }
                }
                if (doc == null)
                    continue;

                // Bing.com -- Aug '17
                long result_count = -1;
                var sb_count = doc.DocumentNode.Descendants("span").Where(p => p.Attributes["class"]?.Value == "sb_count").FirstOrDefault();
                var results_count_text = sb_count?.InnerText;
                var ss = results_count_text.Split(' ');
                if (ss != null && ss.Length == 2) {
                    long.TryParse(ss[0]?.Replace(",", ""), out result_count);
                }

                var result_cells = doc.DocumentNode.Descendants("li").Where(p => p.Attributes["class"]?.Value == "b_algo");
                ProcessSearchResults(search_num, user_reg_topic_id, parent_term_id, term_num, suggestion, urls, result_cells, result_count);

                // HAP leaks - this fixes
                doc = null;
                GC.Collect();
            }
            return urls;
        }

        private static void ProcessSearchResults(SearchTypeNum search_num, long user_reg_topic_id, long parent_term_id, int term_num, bool suggestion,
            List<ImportUrlInfo> urls, IEnumerable<HtmlNode> result_cells, long result_count)
        {
            int result_num = 0;
            foreach (var result_cell in result_cells) {
                result_num++;

                var h2 = result_cell.Descendants("h2").FirstOrDefault();
                if (h2 == null)
                    continue;
                var a = h2.Descendants("a").FirstOrDefault();
                if (a == null)
                    continue;
                var bcaption = result_cell.Descendants("p").FirstOrDefault();
                if (bcaption == null)
                    continue;

                var title = h2.InnerText;
                var desc = bcaption.InnerText;
                var href = a.Attributes["href"]?.Value;

                // new url info
                Debug.WriteLine($"RES: (of {result_count}) [{title.nonewline()}] desc=[{desc.nonewline()}] href=[{href}]");
                var url_info = new ImportUrlInfo() {
                    search_num = search_num,
                    main_term_id = user_reg_topic_id,
                    parent_term_id = parent_term_id,
                    suggestion = suggestion,
                    url = HttpUtility.UrlDecode(href),
                    desc = HttpUtility.HtmlDecode(desc),
                    title = HttpUtility.HtmlDecode(title),
                    result_num = result_num,
                    term_num = term_num,
                    result_count = result_count,
                };

                urls.Add(url_info);
            }
        }

        //private static string ParseGoogRedirect(string href)
        //{
        //    // e.g. /url?q=http://www.singaporechess.org.sg/training-courses/scf-chess-courses&amp;sa=U&amp;ved=0ahUKEwjrxrf6sbzVAhUEMI8KHViQAc0QFgg...
        //    // e.g. /url?q=http://www.singaporechess.org.sg/training-courses/scf-chess-courses&amp;sa=U&amp;ved=0ahUKEwjrxrf6sbzVAhUEMI8KHViQAc0QFgg...
        //    // sometimes: /interstitial?url=http://sgforums.com/forums/12/topics/453139
        //    foreach (var s in new[] { "/url?url=", "/url?q=", "/interstitial?url=" }) {
        //        if (href.Contains(s)) {
        //            var startat = href.IndexOf(s) + s.Length;
        //            var upto = href.IndexOf("&amp;");
        //            if (upto == -1)
        //                return href.Substring(startat);
        //            else
        //                return href.Substring(startat, upto - startat);
        //        }
        //    }
        //    return href;
        //}
    }
}
