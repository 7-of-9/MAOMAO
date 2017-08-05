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

namespace mm_svc.Discovery
{
    public static class SmartFinder
    {
        public enum SearchTypeNum {
            GOOG_MAIN = 1,
            GOOG_COUNTRY = 2,
            GOOG_CITY = 3
        }

        public static int FindForUser(long user_id)
        {
            using (var db = mm02Entities.Create()) {

                var user_reg_topics = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                var discovered_urls = new ConcurrentBag<ImportUrlInfo>();

                foreach (var user_reg_topic_id in user_reg_topics) { //.Take(1)) {
                    // get term, parents & suggestions
                    var term = db.terms.Find(user_reg_topic_id);
                    var parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(user_reg_topic_id, reprocess: true);
                    var topics = parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList();
                    var suggestions = parents.Where(p => !p.is_topic).OrderByDescending(p => p.S).ToList();

                    // remove user_reg_topic from topics and renormalize
                    topics.RemoveAll(p => p.parent_term_id == user_reg_topic_id);
                    topics.ForEach(p => p.S_norm = p.S / topics.Max(p2 => p2.S));

                    // topics are actually quite bad -- they are raw gt_parent (PtR) -- we want parents in defined topic_tree instead
                    //topics.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name} --> parent: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")}"));

                    // suggestions are good -- ADD MAIN TERM TO GOOG SEARCH e.g. "chess + 'strategy'" -- will work well
                    suggestions.ForEach(p => Debug.WriteLine($"user_reg_topic: {term.name} --> suggested: {p.parent_term} S={p.S.ToString("0.0000")} S_norm={p.S_norm.ToString("0.00000000")} is_topic:{p.parent_term.IS_TOPIC}"));
                    continue;

                    // set term numbers (ordering/priority)
                    int term_num;
                    term_num = 1; topics.ForEach(p => p.tmp_term_num = term_num++);
                    term_num = 1; suggestions.ForEach(p => p.tmp_term_num = term_num++);

                    // discovery: top 2 topics
                    Parallel.ForEach(topics.Take(2), (topic) => {
                        DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, topic.parent_term_id, topic.tmp_term_num, suggestion: false);
                    });

                    // discovery: top n suggestions by s_norm
                    Parallel.ForEach(suggestions.Where(p => p.S_norm > 0.75), (suggestion) => {
                        DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, suggestion.parent_term_id, suggestion.tmp_term_num, suggestion: true);
                    });

                    // run discovery for user reg topic term
                    DiscoverForTerm(discovered_urls, user_id, user_reg_topic_id, user_reg_topic_id, term_num: 0, suggestion: false);
                }

                // find new things
                var new_discoveries = new List<ImportUrlInfo>();
                foreach (var url in discovered_urls) {
                    var db_disc_url = db.disc_url.Where(p => // compound uniq key
                                                            p.url == url.url
                                                  && p.search_num == (int)url.search_num
                                           && p.user_reg_topic_id == url.user_reg_topic_id
                                                     && p.term_id == url.parent_term_id
                                             && p.suggested_topic == url.suggestion).FirstOrDefaultNoLock();

                    if (db_disc_url == null) {
                        new_discoveries.Add(url);
                    }
                }

                // get metadata (inc. images) for newly discovered
                ImportUrls.GetMeta(new_discoveries);

                // save new discoveries
                var additions = new_discoveries.Where(p => !string.IsNullOrEmpty(p.meta_title)).Select(p => new disc_url() {
                    discovered_at_utc = DateTime.UtcNow,
                    url = p.url,
                    img_url = p.image_url,
                    meta_title = p.meta_title,
                    search_num = (int)p.search_num,
                    suggested_topic = p.suggestion,
                    term_id = p.parent_term_id,
                    user_reg_topic_id = p.user_reg_topic_id,
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
                }).ToList();

                additions.ForEach(p => { foreach (var cwc in p.disc_url_cwc) cwc.disc_url = p; });
                additions.ForEach(p => { foreach (var osl in p.disc_url_osl) osl.disc_url = p; });
                db.disc_url.AddRange(additions);

                //db.disc_url_cwc.AddRange(new_discoveries.Where(p => p.cwc.Count() > 0).SelectMany(p => p.cwc).Select(p => new disc_url_cwc() {
                //    date = p.date,
                //    desc = p.desc,
                //    disc_url_id = p.url_info.
                //}));
                int new_rows = db.SaveChangesTraceValidationErrors();
                return new_rows;
            }
        }
      
        private static void DiscoverForTerm(
            ConcurrentBag<ImportUrlInfo> all_urls, long user_id, long user_reg_topic_id, long term_id, int term_num, bool suggestion)
        {
            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(term_id);
                var user_reg_topic = db.terms.Find(user_reg_topic_id);
                var user = db.users.Find(user_id);
                var user_country = db.countries.Where(p => p.cc == user.last_api_cc).Select(p => p.name).FirstOrDefault();
                var user_city = user.last_api_city;

                var urls = new List<ImportUrlInfo>();

                string search_desc;
                if (user_reg_topic_id == term_id)
                    search_desc = $"MAIN for [{user_reg_topic.name}]";
                else if (!suggestion)
                    search_desc = $"PARENT for [{user_reg_topic.name}]";
                else
                    search_desc = $"SUGGESTION for [{user_reg_topic.name}]";

                urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{term.name}", SearchTypeNum.GOOG_MAIN, user_reg_topic_id, term_id, term_num, suggestion));
                if (!string.IsNullOrEmpty(user_country))
                    urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{term.name} {user_country}", SearchTypeNum.GOOG_COUNTRY, user_reg_topic_id, term_id, term_num, suggestion));
                if (!string.IsNullOrEmpty(user_city))
                    urls.AddRange(mm_svc.Discovery.Search_Goog.Search($"{term.name} {user_city}", SearchTypeNum.GOOG_CITY, user_reg_topic_id, term_id, term_num, suggestion));

                //
                // todo  -- want to extract every last ounce of value from goog...
                //
                // {term} -- how to get locations? e.g. "board games singapore" // MM mobile location pushes
                // {term} -- how to get top stories?
                // site:reddit.com {term}
                // {term} discussion {country}
                // {term} meetup {country}
                // {term} videos
                // {term} news
                // {term} + filter 24hours

                urls.ForEach(p => {
                    if (!all_urls.Any(p2 => p2.url == p.url))
                        all_urls.Add(p);
                });
            }
        }
    }
}
