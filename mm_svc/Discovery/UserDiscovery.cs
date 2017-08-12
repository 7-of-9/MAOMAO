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
    public static class UserDiscovery
    {
        public static List<DiscoveryInfo> Get(long user_id, int page_num = 0, int per_page = 50)
        {
            using (var db = mm02Entities.Create()) {

                var user_reg_topics_ids = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();

                var num_topics = user_reg_topics_ids.Count;
                var urls_per_topic = per_page / num_topics;
                
                var disc_urls = new ConcurrentBag<disc_url>();
                Parallel.ForEach(user_reg_topics_ids, (term_id) => {
                    var urls = GetUrlsForTerm(term_id, urls_per_topic * page_num, urls_per_topic);
                    urls.ForEach(p => disc_urls.Add(p));
                });

                var ordered = disc_urls.ToList().OrderBy(p => p.main_term_id);
                var ret = ordered.Select(p => InfoFromDiscUrl(p)).ToList();

                ret.ForEach(p => {
                    p.main_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.main_term);
                    p.sug_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.sug_term);
                });

                return ret;
            }
        }

        private static List<disc_url> GetUrlsForTerm(long term_id, int start_at = 0, int per_page = 50)
        {
            using (var db = mm02Entities.Create()) {
                var disc_urls_qry = db.disc_url
                .Include("awis_site")
                .Include("disc_url_cwc")
                .Include("disc_url_osl")
                .AsNoTracking()
                .Where(p => p.main_term_id == term_id)
                .OrderByDescending(p => p.id)
                .Skip(start_at)
                .Take(per_page);
                return disc_urls_qry.ToListNoLock();
            }
        }

        private static DiscoveryInfo InfoFromDiscUrl(disc_url p)
        {
            using (var db = mm02Entities.Create()) {
                return new DiscoveryInfo() {
                    url = p.url,
                    title = p.meta_title,
                    utc = p.discovered_at_utc,
                    img = p.img_url,

                    main_term_id = p.main_term_id,
                    main_term = db.terms.Find(p.main_term_id),
                    main_term_name = db.terms.Find(p.main_term_id).name,

                    sug_term_id = p.term_id,
                    sug_term = db.terms.Find(p.term_id),
                    sug_term_name = db.terms.Find(p.term_id).name,

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
            }
        }
    }
}
