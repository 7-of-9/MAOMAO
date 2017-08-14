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
using static mm_svc.SmartFinder.SearchTypes;

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

        //
        // running without suggestions for now; see what main topic tree turnover/research frequency can be...
        //
        public static int Find_TopicTree(int n_this = 1, int n_of = 1) {
            var tree = TopicTree.GetTopicTree();// n_this, n_of);
            var tree_topics = new List<long>();
            var tree_suggestions = new List<long>();

            // get tree: topics & suggestions
            tree.ForEach(p => GetTreeTopics(tree_topics, p));
            tree.ForEach(p => GetTreeSuggestions(tree_suggestions, p));
            tree_topics = tree_topics.Distinct().ToList();
            tree_suggestions = tree_suggestions.Distinct().Where(p => !tree_topics.Contains(p)).ToList();
            g.LogYellow($"# tree_topics={tree_topics.Count}");
            g.LogYellow($"# tree_suggestions={tree_suggestions.Count}");

            // dbg
            using (var db = mm02Entities.Create()) {
                var user_reg_topics = db.user_reg_topic.Select(p => p.topic_id).Distinct().ToListNoLock();
                var user_terms_not_in_tree_topics = user_reg_topics.Where(p => !tree_topics.Contains(p)).ToList();
                var user_terms_not_in_tree_suggestions = user_reg_topics.Where(p => !tree_suggestions.Contains(p)).ToList();

                g.LogError($"user_terms_not_in_tree_topics.Count={user_terms_not_in_tree_topics.Count}");
                user_terms_not_in_tree_topics.ForEach(p => g.LogError($"user_terms_not_in_tree_topics: term_id={p}"));

                //g.LogYellow($"user_terms_not_in_tree_suggestions.Count={user_terms_not_in_tree_suggestions.Count}");
                //user_terms_not_in_tree_suggestions.ForEach(p => g.LogYellow($"user_terms_not_in_tree_suggestions: term_id={p}"));
            }

            // filter 
            var topics_to_search = GetTopicsToSearch(tree_topics, suggestions: false, n_this: n_this, n_of: n_of);
            var suggestions_to_search = GetTopicsToSearch(tree_suggestions, suggestions: true, n_this: n_this, n_of: n_of);
            g.LogCyan($"topics_to_search={string.Join(",", topics_to_search)}");
            g.LogCyan($"suggestions_to_search={string.Join(",", suggestions_to_search)}");

            // search
            var ret1 = FindForTopics(topics_to_search, places);
            var ret2 = FindForTopics(suggestions_to_search, places); 

            // todo -- how to keep getting new urls on each run?
            // might need to try pages > 1 to keep finding new things; might need more search engines
            // might need filter by date (goog)

            // removing this phase for now (to run as separate job); takes too long - would rather have more results
            // faster with delayed site images
            //Maintenance.ImagesSites.Maintain(n_this, n_of);

            return ret1;// + ret2;
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
                foreach (var term_id in topics_to_search) {
                    // get term, parents & suggestions
                    var term = db.terms.Find(term_id);
                    var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(term_id, reprocess: true);
                    var topics = parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList();
                    var suggestions = parents.Where(p => p.is_topic == false /*&& p.parent_term.IS_TOPIC == false*/).OrderByDescending(p => p.S).ToList();

                    // remove user_reg_topic from topics and renormalize
                    //topics.RemoveAll(p => p.parent_term_id == user_reg_topic_id);
                    //topics.ForEach(p => p.S_norm = p.S / topics.Max(p2 => p2.S));
                    suggestions.RemoveAll(p => p.parent_term_id == term_id);

                    // topics are actually quite bad -- they are raw gt_parent (PtR) -- we want parents in defined topic_tree instead
                    //topics.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name} --> parent: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")}"));

                    // suggestions are good
                    suggestions.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name}[{term.id}] --> suggested: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")} is_topic:{p.parent_term.IS_TOPIC}"));

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
                    var suggestions_found_urls = 0;
                    var main_term_found_urls = 0;
                    const int SUGGESTIONS_TO_TAKE = 3;
                    Parallel.ForEach(suggestions.Take(SUGGESTIONS_TO_TAKE), new ParallelOptions() { MaxDegreeOfParallelism = 1 }, (suggestion) => {
                        suggestions_found_urls = DiscoverForTerm(term_id, suggestion.parent_term_id, suggestion.tmp_term_num, suggestion: true, places: places);
                    });

                    // run discovery for main topic term
                    main_term_found_urls = DiscoverForTerm(term_id, term_id, term_num: 0, suggestion: false, places: places);

                    added_urls += suggestions_found_urls;
                    added_urls += main_term_found_urls;

                    // record last discovery pass for term
                    g.LogCyan($"FindForTopic: term={term.name} - done; added {suggestions_found_urls + main_term_found_urls} URLs.");
                    db.disc_term.Add(new disc_term() {
                        term_id = term_id,
                        search_utc = DateTime.UtcNow,
                        added_count = suggestions_found_urls + main_term_found_urls,
                    });
                    g.RetryMaxOrThrow(() => db.SaveChangesTraceValidationErrors());
                }

                return added_urls;
            }
        }

        // restrict each run to a reasonable batch of terms - prioritize topics never searched
        private static List<long> GetTopicsToSearch(List<long> topic_ids, bool suggestions = false, int n_this = 1, int n_of = 1)
        {
            var to_refresh = new ConcurrentDictionary<long, TimeSpan>(); // term_id, last search_utc
            var terms_never_searched = new ConcurrentBag<long>();
            Parallel.ForEach(topic_ids.Where(p => Math.Abs(p.GetHashCode()) % n_of == n_this - 1), (topic_id) => {
                using (var db2 = mm02Entities.Create()) {

                    // latest search for this term
                    var latest_search = db2.disc_term.AsNoTracking().Where(p => p.term_id == topic_id).OrderByDescending(p => p.search_utc).FirstOrDefaultNoLock();
                    if (latest_search != null) {
                        var since_latest_search = DateTime.UtcNow.Subtract(latest_search.search_utc);
                        if (since_latest_search.TotalHours >= TERM_SEARCH_INTERVAL_HOURS) {
                            to_refresh.TryAdd(topic_id, since_latest_search);
                        }
                    }
                    else
                        terms_never_searched.Add(topic_id);
                }
            });
            var x = to_refresh.ToList();
            x.Sort((p1, p2) => p2.Value.CompareTo(p1.Value));
            x.ForEach(p => g.LogLine($"GetTopicsToSearch(suggestions={suggestions}): refresh term -- since_last_search={p.Value} term_id={p.Key}"));
            var terms_to_refresh = x.Select(p => p.Key).ToList();

            g.LogWarn($"GetTopicsToSearch(suggestions={suggestions}): terms_never_searched.Count={terms_never_searched.Count} (of {topic_ids.Count}): {string.Join(",", terms_never_searched)}");
            g.LogInfo($"GetTopicsToSearch(suggestions={suggestions}): terms_to_refresh.Count={terms_to_refresh.Count} (of {topic_ids.Count}): {string.Join(",", terms_to_refresh)}");

            // ordered list of terms to search: terms never never searched first, followed by terms to refresh ordered by last search time
            var topics_to_search = terms_never_searched.Union(terms_to_refresh)
                .Take(TERM_SEARCH_BATCH_SIZE).ToList();
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
                var main_term = db.terms.Find(main_term_id);
                //var user = db.users.Find(user_id);
                //var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault()?.ToLower();
                //var user_city = user.last_api_city?.ToLower();

                string search_desc;
                if (main_term_id == term_id)
                    search_desc = $"MAIN for [{main_term.name}]";
                else if (!suggestion)
                    search_desc = $"PARENT for [{main_term.name}]";
                else
                    search_desc = $"SUGGESTION for [{main_term.name}]";

                // for suggestions - also include main (user-reg-topic) term name, for better goog matching
                string search_str;
                if (suggestion)
                    search_str = $"{main_term.name} {term.name}";
                else
                    search_str = $"{term.name}";

                var imports = new List<ImportUrlInfo>();

                // main search - too general?
                /*urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{term.name}", SearchTypeNum.GOOG_MAIN, user_reg_topic_id, term_id, term_num, suggestion));*/

                // test - wiki
                /*imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:wikipedia.org", SearchTypeNum.GOOG_WIKI, main_term_id, term_id, term_num, suggestion, pages: 1));*/

                // recent search
                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", null, SearchTypeNum.GOOG_LAST_24_HOURS, main_term_id, term_id, term_num, suggestion, pages: 1,
                                    additional_goog_args: "&source=lnt&tbs=qdr:d&sa=X&biw=1440&bih=705")); // last one day

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

                imports.AddRange(mm_svc.SmartFinder.Search_Goog.Search($"{search_str}", "site:quora.com", SearchTypeNum.GOOG_QUORA, main_term_id, term_id, term_num, suggestion, pages: 1));

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

                if (imports != null) {
                    var new_disc_urls = ProcessDiscoveries(term_id, db, imports);
                    g.LogYellow($">> DiscoverForTerm: main_term={main_term.name} term={term.name} suggestion={suggestion}: # new_disc_urls={new_disc_urls}");
                    return new_disc_urls;
                }
                else return 0;
            }
        }

        private static int ProcessDiscoveries(long term_id, mm02Entities db, List<ImportUrlInfo> discovered_urls)
        {
            // which things are new?
            var new_conc = new ConcurrentBag<ImportUrlInfo>();
            foreach (var chunk in discovered_urls.ChunkBy(4)) {
                Parallel.ForEach(chunk, (url) => {
                    using (var db2 = mm02Entities.Create()) {
                        if (false == g.RetryMaxOrThrow(() => db2.disc_url.Any(p => // compound uniq key
                                                    p.url == url.url
                                          && p.search_num == (int)url.search_num
                                        && p.main_term_id == url.main_term_id
                                             && p.term_id == url.parent_term_id
                                     && p.suggested_topic == url.suggestion), sleepSeconds: 3, retryMax: 5)) {
                            new_conc.Add(url);
                        }
                    }
                });
            }
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
                        desc = p.desc.TruncateEllipsis(512),
                        search_num = (int)p.search_num,
                        suggested_topic = p.suggestion,
                        term_id = p.parent_term_id,
                        main_term_id = p.main_term_id,
                        disc_url_cwc = p.cwc.Where(p2 => p2.href.Length < 256).Select(p2 => new disc_url_cwc() {
                            date = p2.date,
                            desc = p2.desc.TruncateEllipsis(512),
                            href = p2.href,
                        }).ToList(),
                        disc_url_osl = p.osl.Where(p2 => p2.href.Length < 256).Select(p2 => new disc_url_osl() {
                            desc = p2.desc.TruncateEllipsis(512),
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

                    //g.LogLine($"WRITING: {additions.Count} [disc_url] for term_id={term_id}");
                    g.RetryMaxOrThrow(() => db.SaveChanges_IgnoreDupeKeyEx()); //.SaveChangesTraceValidationErrors();
                    new_disc_urls++;
                    g.LogLine($"DONE: {additions.Count} additions for term_id={term_id}");

                    //}
                }
            });

            //g.LogGreen($"ProcessDiscoveries -- DONE: new_discoveries.Count={new_discoveries.Count} new_disc_urls={new_disc_urls}");
            return new_disc_urls;
        }
    }
}
