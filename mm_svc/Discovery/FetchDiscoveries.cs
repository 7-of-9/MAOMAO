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
    public static class FetchDiscoveries
    {
        public static List<DiscoveryInfo> GetForUser(long user_id,
            int page_num = 0, int per_page = 120, string country = null, string city = null)
        {
            using (var db = mm02Entities.Create()) {

                var user_reg_topics_ids = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                if (user_reg_topics_ids.Count == 0)
                    return new List<DiscoveryInfo>();

                var num_topics = user_reg_topics_ids.Count;
                var urls_per_topic = per_page / num_topics; // (int)Math.Ceiling((double)per_page / num_topics);

                var disc_urls = new ConcurrentBag<disc_url>();
                Parallel.ForEach(user_reg_topics_ids, (term_id) => {
                    var urls = GetUrlsForTerm(term_id, urls_per_topic * page_num, urls_per_topic, country, city);
                    urls.ForEach(p => disc_urls.Add(p));
                });

                var ordered = disc_urls.ToList().OrderBy(p => p.main_term_id);
                var ret = ordered.Select(p => InfoFromDiscUrl(p)).ToList();

                return ret;
            }
        }
        
        public static List<DiscoveryInfo> GetForTerm(long term_id,
            int page_num = 0, int per_page = 120, string country = null, string city = null)
        {
            using (var db = mm02Entities.Create()) {

                var disc_urls = GetUrlsForTerm(term_id, per_page * page_num, per_page, country, city);
                var ordered = disc_urls.ToList();
                var ret = ordered.Select(p => InfoFromDiscUrl(p)).ToList();
                return ret;
            }
        }

        public static List<DiscoveryLocationInfo> GetCountryCities()
        {
            using (var db = mm02Entities.Create()) {
                var country_cities_qry = db.disc_url.Select(p => new DiscoveryLocationInfo() { country = p.country, city = p.city }).Distinct();
                //Debug.WriteLine(country_cities_qry.ToString());
                return country_cities_qry.ToListNoLock();
            }
        }

        private static List<disc_url> GetUrlsForTerm(long term_id,
            int start_at = 0, int per_page = 50, string country = null, string city = null)
        {
            // todo --  partition so that we get some of each search type...
            using (var db = mm02Entities.Create()) {

                var disc_urls_qry = db.disc_url
                    .Include("awis_site")
                    .Include("disc_url_cwc")
                    .Include("disc_url_osl")
                    .AsNoTracking()
                    .Where(p => p.main_term_id == term_id);

                if (!string.IsNullOrEmpty(country)) 
                    disc_urls_qry = disc_urls_qry.Where(p => p.country == country);
                if (!string.IsNullOrEmpty(city))
                    disc_urls_qry = disc_urls_qry.Where(p => p.city == city);

                disc_urls_qry = disc_urls_qry
                    .OrderByDescending(p => p.id)
                    .Skip(start_at)
                    .Take(per_page);

                //Debug.WriteLine(disc_urls_qry.ToString());
                return disc_urls_qry.ToListNoLock();
            }
        }

        private static DiscoveryInfo InfoFromDiscUrl(disc_url p)
        {
            using (var db = mm02Entities.Create()) {
                GoldenParents.use_stored_parents_cache = true;

                // get suggestions for search main term and sub-term (aka search suggested term)
                var main_term_parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(p.main_term_id, reprocess: false);
                var main_term_related_topics = main_term_parents.Where(p2 => p2.is_topic && p2.parent_term_id != p.main_term_id).OrderByDescending(p2 => p2.S).Take(2).ToList();
                var main_term_related_suggestions = main_term_parents.Where(p2 => p2.is_topic == false && p2.S_norm > 0.3).OrderByDescending(p2 => p2.S).ToList();

                var sub_term_related_topics = new List<gt_parent>();
                var sub_term_related_suggestions = new List<gt_parent>();
                if (p.term_id != null) {
                    var sub_term_parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics((long)p.term_id, reprocess: false);
                    sub_term_related_topics = sub_term_parents.Where(p2 => p2.is_topic && p2.parent_term_id != p.term_id).OrderByDescending(p2 => p2.S).Take(2).ToList();
                    sub_term_related_suggestions = sub_term_parents.Where(p2 => p2.is_topic == false && p2.S_norm > 0.3).OrderByDescending(p2 => p2.S).ToList();
                }

                var ret = new DiscoveryInfo() {
                    disc_url_id = p.id,

                    url = p.url,
                    title = p.meta_title,
                    utc = p.discovered_at_utc,
                    img = p.img_url,

                    main_term_id = p.main_term_id,
                    main_term = db.terms.Find(p.main_term_id),
                    main_term_name = db.terms.Find(p.main_term_id).name,
                    main_term_related_topics_term_ids = main_term_related_topics.Select(p2 => p2.parent_term_id).ToList(),
                    main_term_related_suggestions_term_ids = main_term_related_suggestions.Select(p2 => p2.parent_term_id).ToList(),

                    sub_term_id = p.term_id,
                    sub_term = db.terms.Find(p.term_id),
                    sub_term_name = db.terms.Find(p.term_id).name,
                    sub_term_related_topics_term_ids = sub_term_related_topics.Select(p2 => p2.parent_term_id).ToList(),
                    sub_term_related_suggestions_term_ids = sub_term_related_suggestions.Select(p2 => p2.parent_term_id).ToList(),

                    search_num = p.search_num,
                    suggested_topic = p.suggested_topic,
                    result_num = p.result_num,
                    term_num = p.term_num,
                    city = p.city,
                    country = p.country,
                    desc = p.desc,

                    site_tld = p.awis_site?.TLD,
                    site_img = Images.ImageNames.GetSite_MasterImage_FullUrl(p.awis_site),

                    cwc = p.disc_url_cwc.Select(p2 => new CwcInfo() { date = (DateTime)p2.date, desc = p2.desc, url = p2.href }).ToList(),
                    osl = p.disc_url_osl.Select(p2 => new OslInfo() { desc = p2.desc, url = p2.href }).ToList(),
                };

                //ret.main_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(ret.main_term);
                //ret.sub_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(ret.sub_term);

                return ret;
            }
        }
    }
}
