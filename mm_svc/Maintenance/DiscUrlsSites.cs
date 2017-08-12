using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Maintenance
{
    public static class DiscUrlsSites
    {
        public static void FindAwisSitesForDiscUrls()
        {
            using (var db = mm02Entities.Create()) {

                var to_find = db.disc_url.Where(p => p.awis_site_id == null).ToListNoLock();

                // ensure all disc_urls have awis sites
                //Parallel.ForEach(to_find, new ParallelOptions() { MaxDegreeOfParallelism = 4 }, (disc_url) => {
                //    var tld = mm_global.Util.GetTldFromUrl(disc_url.url);
                //    var site = SiteInfo.GetOrQueryAwis(tld, out bool from_db);
                //});

                // fetch awis sites
                Parallel.ForEach(to_find, new ParallelOptions() { MaxDegreeOfParallelism = 4 }, (disc_url) => {
                    var tld = mm_global.Util.GetTldFromUrl(disc_url.url);
                    var site = SiteInfo.GetOrQueryAwis(tld, out bool from_db);

                    using (var db2 = mm02Entities.Create()) {
                        var disc_url2 = db2.disc_url.Find(disc_url.id);
                        disc_url2.awis_site_id = site.id;
                        g.LogInfo($"saving awis_site.id={site.id} for disc_url.id={disc_url2.id}");
                        try {
                            g.RetryMaxOrThrow(() => db2.SaveChangesTraceValidationErrors());
                        }
                        catch { }
                    }
                });
            }
        }

    }
}
