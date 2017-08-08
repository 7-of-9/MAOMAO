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
using static mm_svc.Discovery.Search_Goog;

namespace mm_svc.Discovery
{
    public static class SmartFinder
    {
        private const int TERM_SEARCH_INTERVAL_HOURS = 1;
        private const int TERM_SEARCH_BATCH_SIZE = 1;

        // todo -- operate on all [url] parent terms -- problem is country search?
        public static int FindForAllUrls() {
            return 0;
        }

        // runs SF on all a user's browsed topics & suggestions - should allow instant home->discovery nav (good for demo)
        public static int Find_UserAllTopics(long user_id) {
            using (var db = mm02Entities.Create()) {
                var user_reg_topics = db.user_url.Where(p => p.user_id == user_id).SelectMany(p => p.url.url_parent_term)
                                        .Where(p => p.pri == 1 && p.suggested_dynamic == false)
                                        .Select(p => p.term_id).Distinct().ToListNoLock();
                var topics_to_search = GetTopicsToSearch(user_reg_topics);

                var ret = FindForCountryTopics(user_id, topics_to_search);

                Maintenance.SiteImages.Maintain();
                return ret;
            }
        }

        // runs SF only on user-registered topics
        public static int Find_UserRegTopics(long user_id) {
            using (var db = mm02Entities.Create()) {
                var user_reg_topics = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                var topics_to_search = GetTopicsToSearch(user_reg_topics);

                var ret = FindForCountryTopics(user_id, topics_to_search);

                Maintenance.SiteImages.Maintain();
                return ret;
            }
        }

        private static int FindForCountryTopics(long user_id,  List<long> topics_to_search)
        {
            using (var db = mm02Entities.Create()) {
                var discovered_urls = new ConcurrentBag<ImportUrlInfo>();
                foreach (var user_reg_topic_id in topics_to_search) {
                    // get term, parents & suggestions
                    var term = db.terms.Find(user_reg_topic_id);
                    var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(user_reg_topic_id, reprocess: true);
                    var topics = parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList();
                    var suggestions = parents.Where(p => !p.is_topic).OrderByDescending(p => p.S).ToList();

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

                    // discovery: top n suggestions by s_norm -- todo: let people tell us when to increase n (by topic)
                    var opts = new ParallelOptions() { MaxDegreeOfParallelism = 2 };
                    Parallel.ForEach(suggestions.Take(5), opts, (suggestion) => {
                        DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, suggestion.parent_term_id, suggestion.tmp_term_num, suggestion: true);
                    });

                    // run discovery for user reg topic term
                    DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, user_reg_topic_id, term_num: 0, suggestion: false);
                }

                // find new things
                var new_conc = new ConcurrentBag<ImportUrlInfo>();
                //var new_discoveries = new List<ImportUrlInfo>();
                //foreach (var url in discovered_urls) {
                Parallel.ForEach(discovered_urls, (url) => {
                    using (var db2 = mm02Entities.Create()) {
                        if (false == db2.disc_url.Any(p => // compound uniq key
                                                    p.url == url.url
                                          && p.search_num == (int)url.search_num
                                        && p.main_term_id == url.main_term_id
                                             && p.term_id == url.parent_term_id
                                     && p.suggested_topic == url.suggestion)) {
                            new_conc.Add(url);
                        }
                    }
                });
                var new_discoveries = new_conc.ToList();

                // get metadata (inc. images) for newly discovered
                ImportUrls.GetMeta(new_discoveries, max_parallel: 4);

                // save new discoveries
                var additions = new_discoveries.Where(p => !string.IsNullOrEmpty(p.meta_title) && p.meta_title.Length < 256 && p.url.Length < 256).Select(
                p => new disc_url() {
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
                }).ToList();
                additions.ForEach(p => { foreach (var cwc in p.disc_url_cwc) cwc.disc_url = p; });
                additions.ForEach(p => { foreach (var osl in p.disc_url_osl) osl.disc_url = p; });
                db.disc_url.AddRange(additions);

                db.disc_term.AddRange(topics_to_search.Select(p => new disc_term() {
                    term_id = p,
                    search_utc = DateTime.UtcNow,
                    added_count = additions.Count,
                }));

                int new_rows = db.SaveChangesTraceValidationErrors();
                g.LogInfo($"DONE: {additions.Count} additions for user_id={user_id}");
                return new_rows;
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

        private static void DiscoverForTerm(
            ConcurrentBag<ImportUrlInfo> all_urls, long user_id, long user_reg_topic_id, long term_id, int term_num, bool suggestion)
        {
            if (Search_Goog.goog_rate_limit_hit == true) {
                g.LogError($"Search_Goog.goog_rate_limit_hit == true: aborting.");
                return;
            }

            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(term_id);
                var user_reg_topic = db.terms.Find(user_reg_topic_id);
                var user = db.users.Find(user_id);
                var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault()?.ToLower();
                var user_city = user.last_api_city?.ToLower();
                if (user_city == user_country)
                    user_city = null;

                var urls = new List<ImportUrlInfo>();

                string search_desc;
                if (user_reg_topic_id == term_id)
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

                // local searches
                if (!string.IsNullOrEmpty(user_country) || !string.IsNullOrEmpty(user_city)) {
                    // general local
                    var gen_local = mm_svc.Discovery.Search_Goog.Search($"{search_str} {user_city} {user_country}", null, SearchTypeNum.GOOG_LOCAL, user_reg_topic_id, term_id, term_num, suggestion, pages: 1);
                    gen_local.ForEach(p => { p.city = user_city; p.country = user_country; });
                    urls.AddRange(gen_local);

                    // events local
                    var events_local = mm_svc.Discovery.Search_Goog.Search($"events {search_str} {user_city} {user_country}", null, SearchTypeNum.GOOG_LOCAL_EVENTS, user_reg_topic_id, term_id, term_num, suggestion, pages: 1);
                    events_local.ForEach(p => { p.city = user_city; p.country = user_country; });
                    urls.AddRange(events_local);
                }

                // site searches
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:youtube.com", SearchTypeNum.GOOG_YOUTUBE, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:vimeo.com", SearchTypeNum.GOOG_VIMEO, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:dailymotion.com", SearchTypeNum.GOOG_DAILYMOTION, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));

                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:quora.com", SearchTypeNum.GOOG_QUORA, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:medium.com", SearchTypeNum.GOOG_MEDIUM, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:ycombinator.com", SearchTypeNum.GOOG_YCOMBINATOR, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));

                if (!suggestion) { // low signal sites
                    urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:buzzfeed.com", SearchTypeNum.GOOG_BUZZFEED, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                    urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str}", "site:mashable.com", SearchTypeNum.GOOG_MASHABLE, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));
                }

                // news search
                /*urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str} news", SearchTypeNum.GOOG_NEWS, user_reg_topic_id, term_id, term_num, suggestion));

                // discussion search
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{search_str} discussion", SearchTypeNum.GOOG_DISCUSSION, user_reg_topic_id, term_id, term_num, suggestion));*/

                // cool search 
                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"cool {search_str} stuff", null, SearchTypeNum.GOOG_COOL, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));

                // trending search -- not good: goog itself handles this to a large extent
                /*urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"trending {search_str}", null, SearchTypeNum.GOOG_TRENDING, user_reg_topic_id, term_id, term_num, suggestion, pages: 1));*/


                urls.ForEach(p => {
                    if (!all_urls.Any(p2 => p2.url == p.url))
                        all_urls.Add(p);
                });
            }
        }
    }
}
