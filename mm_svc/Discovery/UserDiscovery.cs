using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public static class UserDiscovery
    {
        public static List<DiscoveryInfo> Get(long user_id, int start_at = 0, int per_page = 50)
        {
            using (var db = mm02Entities.Create()) {
                var user_reg_topics_ids = db.user_reg_topic.Where(p => p.user_id == user_id).Select(p => p.topic_id).ToListNoLock();
                var disc_urls_qry = db.disc_url.AsNoTracking()
                    .Where(p => user_reg_topics_ids.Contains(p.main_term_id))
                    .OrderByDescending(p => p.id)
                    .Skip(start_at)
                    .Take(50);
                //Debug.WriteLine($"{disc_urls_qry.ToString()}");
                var disc_urls = disc_urls_qry.ToListNoLock();

                var shuffled = disc_urls.OrderBy(p => p.url_hash);
                var ret = shuffled.Select(p => new DiscoveryInfo() {
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

                    // site images: need awis_site_id on disc_url

                    search_num = p.search_num,
                    suggested_topic = p.suggested_topic,
                    result_num = p.result_num,
                    term_num = p.term_num,
                    city = p.city,
                    country = p.country,
                    desc = p.desc,

                }).ToList();

                ret.ForEach(p => {
                    p.main_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.main_term);
                    p.sug_term_img = Images.ImageNames.GetTerm_MasterImage_FullUrl(p.sug_term);
                });

                return ret;
            }
        }
    }
}
