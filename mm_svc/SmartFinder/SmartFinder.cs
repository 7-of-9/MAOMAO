using mm_global;
using mm_global.Extensions;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.SmartFinder.Search_Goog;

namespace mm_svc.SmartFinder
{
    public static class SmartFinder
    {
        private const int TERM_SEARCH_INTERVAL_HOURS = 1;
        private const int TERM_SEARCH_BATCH_SIZE = 1;

        private class CityCountry { public string country; public string city; }

        private static List<CityCountry> places = new List<CityCountry>() {
                new CityCountry() { country = "USA", city = "San Francisco" }
              , new CityCountry() { country = "UK", city = "London" }
              , new CityCountry() { country = "Indonesia", city = "Bali" }
              , new CityCountry() { country = "Singapore", city = "Singapore" }
            };

        public static int Find_TopicTree(int n_this = 1, int n_of = 1) {
            var tree = TopicTree.GetTopicTree(n_this, n_of);
            var tree_topics = new List<long>();
            var tree_suggestions = new List<long>(); https://maomao.blob.core.windows.net/t-img/t_4990959_History_M1.jpeg
            tree.ForEach(p => GetTreeTopics(tree_topics, p));
            tree.ForEach(p => GetTreeSuggestions(tree_suggestions, p));

            var topics_to_search = GetTopicsToSearch(tree_topics);
            var suggestions_to_search = GetTopicsToSearch(tree_suggestions);

            g.LogInfo($"topics_to_search={string.Join(",", topics_to_search)}");
            g.LogInfo($"suggestions_to_search={string.Join(",", suggestions_to_search)}");
           
            var ret1 = FindForTopics(topics_to_search, places);
            var ret2 = FindForTopics(suggestions_to_search, places);

            Maintenance.ImagesSites.Maintain(n_this, n_of);
            return ret1 + ret2;
        }

        private static void GetTreeTopics(List<long> terms, TopicTree.TopicTermLink link) {
            if (link.is_topic == true)
                terms.Add(link.topic_id);
            link.child_topics.ForEach(p => GetTreeTopics(terms, p));
        }
        private static void GetTreeSuggestions(List<long> terms, TopicTree.TopicTermLink link) {
            if (link.is_topic == false)
                terms.Add(link.topic_id);
            link.child_suggestions.ForEach(p => GetTreeSuggestions(terms, p));
        }

        // runs SF on all a user's browsed topics & suggestions - should allow instant home->discovery nav (good for demo)
        public static int Find_UserAllTopics(long user_id) {
            using (var db = mm02Entities.Create()) {
                var user_reg_topics = db.user_url.Where(p => p.user_id == user_id).SelectMany(p => p.url.url_parent_term)
                                        .Where(p => p.pri == 1 && p.suggested_dynamic == false)
                                        .Select(p => p.term_id).Distinct().ToListNoLock();
                var topics_to_search = GetTopicsToSearch(user_reg_topics);

                var user = db.users.Find(user_id);
                var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault()?.ToLower();
                var user_city = user.last_api_city?.ToLower();

                var ret = FindForTopics(topics_to_search, places);
                Maintenance.ImagesSites.Maintain();
                return ret;
            }
        }

        // runs SF only on user-registered topics
        public static int Find_UserRegTopics(long user_id) {
            using (var db = mm02Entities.Create()) {
                var user_reg_topics = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                var topics_to_search = GetTopicsToSearch(user_reg_topics);
                
                var user = db.users.Find(user_id);
                var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault()?.ToLower();
                var user_city = user.last_api_city?.ToLower();

                var ret = FindForTopics(topics_to_search, places);
                Maintenance.ImagesSites.Maintain();
                return ret;
            }
        }

        private static int FindForTopics(List<long> topics_to_search, List<CityCountry> places)
        {
            using (var db = mm02Entities.Create()) {
                var discovered_urls = new ConcurrentBag<ImportUrlInfo>();
                int added_urls = 0;
                foreach (var user_reg_topic_id in topics_to_search) {
                    // get term, parents & suggestions
                    var term = db.terms.Find(user_reg_topic_id);
                    var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(user_reg_topic_id, reprocess: true);
                    var topics = parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList();
                    var suggestions = parents.Where(p => p.is_topic == false /*&& p.parent_term.IS_TOPIC == false*/).OrderByDescending(p => p.S).ToList();

                    // remove user_reg_topic from topics and renormalize
                    //topics.RemoveAll(p => p.parent_term_id == user_reg_topic_id);
                    //topics.ForEach(p => p.S_norm = p.S / topics.Max(p2 => p2.S));
                    suggestions.RemoveAll(p => p.parent_term_id == user_reg_topic_id);

                    // topics are actually quite bad -- they are raw gt_parent (PtR) -- we want parents in defined topic_tree instead
                    //topics.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name} --> parent: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")}"));

                    // suggestions are good
                    suggestions.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name} --> suggested: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")} is_topic:{p.parent_term.IS_TOPIC}"));

                    // set term numbers (ordering/priority)
                    int term_num;
                    //term_num = 1; topics.ForEach(p => p.tmp_term_num = term_num++);
                    term_num = 1; suggestions.ForEach(p => p.tmp_term_num = term_num++);

                    // discovery: top 2 topics
                    //Parallel.ForEach(topics.Take(2), (topic) => {
                    //    DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, topic.parent_term_id, topic.tmp_term_num, suggestion: false);
                    //});

                    //continue;

                    // discovery: top n suggestions by s_norm -- todo: let people tell us when to increase n (by topic)
                    var opts = new ParallelOptions() { MaxDegreeOfParallelism = 1 };
                    const int SUGGESTIONS_TO_TAKE = 5;
                    Parallel.ForEach(suggestions.Take(SUGGESTIONS_TO_TAKE), opts, (suggestion) => {
                        added_urls += DiscoverForTerm(user_reg_topic_id, suggestion.parent_term_id, suggestion.tmp_term_num, suggestion: true, places: places);
                    });

                    // run discovery for user reg topic term
                    added_urls += DiscoverForTerm(user_reg_topic_id, user_reg_topic_id, term_num: 0, suggestion: false, places: places);
                }

                //return ProcessDiscoveries(topics_to_search, country, city, db, discovered_urls);
                return added_urls;
            }
        }

        // restrict each run to a reasonable batch of terms - prioritize topics never searched
        private static List<long> GetTopicsToSearch(List<long> topic_ids)
        {
            var to_refresh = new ConcurrentBag<long>();
            var never_searched = new ConcurrentBag<long>();
            Parallel.ForEach(topic_ids, (topic_id) => {
                using (var db2 = mm02Entities.Create()) {
                    var last_search = db2.disc_term.AsNoTracking().Where(p => p.term_id == topic_id).OrderByDescending(p => p.search_utc).FirstOrDefaultNoLock();
                    if (last_search != null) {
                        var since_last_search = DateTime.UtcNow.Subtract(last_search.search_utc);
                        if (since_last_search.TotalHours >= TERM_SEARCH_INTERVAL_HOURS)
                            to_refresh.Add(topic_id);
                    }
                    else never_searched.Add(topic_id);
                }
            });
            var topics_to_search = never_searched.OrderBy(p => p).Union(to_refresh.OrderBy(p => p)).Take(TERM_SEARCH_BATCH_SIZE).ToList();
            return topics_to_search;
        }

        private static int DiscoverForTerm(
            long main_term_id, long term_id, int term_num, bool suggestion,
            List<CityCountry> places)
        {
            if (Search_Goog.goog_rate_limit_hit == true) {
                g.LogError($"Search_Goog.goog_rate_limit_hit == true: aborting.");
                return 0;
            }

            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(term_id);
                var user_reg_topic = db.terms.Find(main_term_id);
                //var user = db.users.Find(user_id);
                //var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault()?.ToLower();
                //var user_city = user.last_api_city?.ToLower();

                string search_desc;
                if (main_term_id == term_id)
                    search_desc = $"MAIN for [{user_reg_topic.name}]";
                else if (!suggestion)
                    search_desc = $"PARENT for [{user_reg_topic.name}]";
                else
                    search_desc = $"SUGGESTION for [{user_reg_topic.name}]";

                // for suggestions - also include main (user-reg-topic) term name, for better goog matching
                string search_str;
                if (suggestion)
                    search_str = $"{user_reg_topic.name} {term.name}";
                else
                    search_str = $"{term.name}";

                // main search - too general?
                /*urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{term.name}", SearchTypeNum.GOOG_MAIN, user_reg_topic_id, term_id, term_num, suggestion));*/

                var imports = new List<ImportUrlInfo>();

                // local searches
                foreach (var place in places) {
                    var city = place.city;
                    var country = place.country;
                    if (city == country)
                        city = null;

                    if (!string.IsNullOrEmpty(country) || !string.IsNullOrEmpty(city)) {
                        // general local
                        var gen_local = mm_svc.SmartFinder.Search_Goog.Search($"{search_str} {city} {country}", null, SearchTypeNum.GOOG_LOCAL, main_term_id, term_id, term_num, suggestion, pages: 1);
                        gen_local.ForEach(p => { p.city = city; p.country = country; });
                        imports.AddRange(gen_local);

                        // events local
                        var events_local = mm_svc.SmartFinder.Search_Goog.Search($"events {search_str} {city} {country}", null, SearchTypeNum.GOOG_LOCAL_EVENTS, main_term_id, term_id, term_num, suggestion, pages: 1);
                        events_local.ForEach(p => { p.city = city; p.country = country; });
                        imports.AddRange(events_local);
                    }
                }

                // site searches
                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:youtube.com", SearchTypeNum.GOOG_YOUTUBE, main_term_id, term_id, term_num, suggestion, pages: 1));

                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:vimeo.com", SearchTypeNum.GOOG_VIMEO, main_term_id, term_id, term_num, suggestion, pages: 1));

                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:dailymotion.com", SearchTypeNum.GOOG_DAILYMOTION, main_term_id, term_id, term_num, suggestion, pages: 1));

                // all IPs are 429 too many requests; their reset seems quite lengthy - if ever ?! removing for now, pending new IPs or reset on their side
                //imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:quora.com", SearchTypeNum.GOOG_QUORA, main_term_id, term_id, term_num, suggestion, pages: 1));

                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:medium.com", SearchTypeNum.GOOG_MEDIUM, main_term_id, term_id, term_num, suggestion, pages: 1));

                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:ycombinator.com", SearchTypeNum.GOOG_YCOMBINATOR, main_term_id, term_id, term_num, suggestion, pages: 1));

                if (!suggestion) { // low signal sites
                    imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:buzzfeed.com", SearchTypeNum.GOOG_BUZZFEED, main_term_id, term_id, term_num, suggestion, pages: 1));
                    imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:mashable.com", SearchTypeNum.GOOG_MASHABLE, main_term_id, term_id, term_num, suggestion, pages: 1));
                }

                // cool search 
                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"cool {search_str} stuff", null, SearchTypeNum.GOOG_COOL, main_term_id, term_id, term_num, suggestion, pages: 1));

                // news search
                /*urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str} news", SearchTypeNum.GOOG_NEWS, user_reg_topic_id, term_id, term_num, suggestion));

                // discussion search
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str} discussion", SearchTypeNum.GOOG_DISCUSSION, user_reg_topic_id, term_id, term_num, suggestion));

                // trending search -- not good: goog itself handles this to a large extent
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"trending {search_str}", null, SearchTypeNum.GOOG_TRENDING, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));*/

                return ProcessUrlImports(imports, main_term_id, db);
            }
        }

        private static int ProcessUrlImports(List<ImportUrlInfo> url_imports, long term_id, mm02Entities db)
        {
            if (url_imports != null)
                return ProcessDiscoveries(term_id, db, url_imports);
            return 0;
        }

        private static int ProcessDiscoveries(long term_id, mm02Entities db, List<ImportUrlInfo> discovered_urls)
        {
            // which things are new?
            var new_conc = new ConcurrentBag<ImportUrlInfo>();
            Parallel.ForEach(discovered_urls, (url) => {
                using (var db2 = mm02Entities.Create()) {
                    if (false == g.RetryMaxOrThrow(() => db2.disc_url.Any(p => // compound uniq key
                                                p.url == url.url
                                      && p.search_num == (int)url.search_num
                                    && p.main_term_id == url.main_term_id
                                         && p.term_id == url.parent_term_id
                                 && p.suggested_topic == url.suggestion))) {
                        new_conc.Add(url);
                    }
                }
            });
            var new_discoveries = new_conc.ToList();

            // get metadata (inc. images) for newly discovered
            ImportUrls.GetMeta(new_discoveries);

            // save new discoveries 
            var to_save = new_discoveries.Where(p =>
                !string.IsNullOrEmpty(p.meta_title) && p.meta_title.Length < 256 
             && p.url.Length < 256
             && p.image_url?.Length < 512
             );
            int new_disc_urls = 0;
            //Parallel.ForEach(to_save, p => {
            to_save.ToList().ForEach(p => {
                using (var db2 = mm02Entities.Create()) {

                    // shouldn't be necessary - see above; problems with per-proces work sharing?
                    //var existing = db2.disc_url.Where(p2 => // compound uniq key
                    //                        p2.url == p.url
                    //              && p2.search_num == (int)p.search_num
                    //            && p2.main_term_id == p.main_term_id
                    //                 && p2.term_id == p.parent_term_id
                    //         && p2.suggested_topic == p.suggestion).FirstOrDefaultNoLock();
                    //if (existing == null) {

                    var additions = new List<disc_url>() { new disc_url() {  //to_save.Select(p => new disc_url() {
                            discovered_at_utc = DateTime.UtcNow,
                            url = p.url,
                            img_url = p.image_url,
                            meta_title = p.meta_title,
                            desc = p.desc,
                            search_num = (int)p.search_num,
                            suggested_topic = p.suggestion,
                            term_id = p.parent_term_id,
                            main_term_id = p.main_term_id,
                            disc_url_cwc = p.cwc.Select(p2 => new disc_url_cwc() {
                                date = p2.date,
                                desc = p2.desc,
                                href = p2.href,
                            }).ToList(),
                            disc_url_osl = p.osl.Select(p2 => new disc_url_osl() {
                                desc = p2.desc,
                                href = p2.href,
                            }).ToList(),
                            result_num = p.result_num,
                            term_num = p.term_num,
                            city = p.city,
                            country = p.country,
                            url_hash = p.url.GetHashCode(),
                            awis_site_id = p.awis_site_id,
                            status = p.status,
                            disc_url_html = new List<disc_url_html>() { new disc_url_html() {
                                html = p.html,
                            } },
                        } }; //).ToList();

                    additions.ForEach(p2 => { foreach (var cwc in p2.disc_url_cwc) cwc.disc_url = p2; });
                    additions.ForEach(p2 => { foreach (var osl in p2.disc_url_osl) osl.disc_url = p2; });
                    additions.ForEach(p2 => { foreach (var disc_url_html in p2.disc_url_html) disc_url_html.disc_url = p2; });
                    db.disc_url.AddRange(additions);

                    db.disc_term.Add(new disc_term() {
                        term_id = term_id,
                        search_utc = DateTime.UtcNow,
                        added_count = additions.Count,
                    });

                    g.LogLine($"WRITING: {additions.Count} disc_url for term_id={term_id}");
                    g.RetryMaxOrThrow(() => db.SaveChanges_IgnoreDupeKeyEx()); //.SaveChangesTraceValidationErrors();
                    new_disc_urls++;
                    g.LogCyan($"DONE: {additions.Count} additions for term_id={term_id}");

                    //}
                }
            });

            g.LogGreen($"ProcessDiscoveries -- DONE: new_discoveries.Count={new_discoveries.Count} new_disc_urls={new_disc_urls}");
            return new_disc_urls;
        }
    }
}
