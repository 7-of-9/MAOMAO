using Microsoft.ApplicationInsights.Extensibility;
using mm_global;
using mm_svc.Discovery;
using mm_svc.Images;
using mm_svc.Util.Utils;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace mm_svc.Maintenance
{
    public static class SiteImages
    {
        public static void Maintain()
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;

            using (var db = mm02Entities.Create()) {
                var sites_mising_logos = db.awis_site.AsNoTracking().Where(p => string.IsNullOrEmpty(p.logo_file_name)).Select(p => p.id).ToListNoLock();
                g.LogInfo($"sites_mising_logos.Count={sites_mising_logos.Count}");
                Parallel.ForEach(sites_mising_logos, new ParallelOptions() { MaxDegreeOfParallelism = 2 }, awis_site_id => {

                    var th = new Thread(() => { // STA for WebBrowser

                        using (var db2 = mm02Entities.Create()) {
                            var db_site2 = db2.awis_site.Find(awis_site_id);
                            var filename = ImageNames.GetSiteFilename(db_site2);
                            var master_jpeg = filename + "_M1.jpeg";
                            var master_png = filename + "_M1.png";

                            if (!AzureImageFile.Exists(AzureImageFileType.SiteLogo, master_jpeg) && !AzureImageFile.Exists(AzureImageFileType.SiteLogo, master_png)) {

                                // (1) tld search
                                var trimmed_tld = TldTitle.GetPartialTldNameWithSuffix(db_site2.TLD);
                                bool none_found;
                                var saved = Search_GoogImage.Search(out none_found, $"{trimmed_tld} website logo", AzureImageFileType.SiteLogo, filename, 5, 0, clipart: true);
                                if (saved.Count > 0) {
                                    db_site2.logo_file_name = saved[0];
                                    db2.SaveChangesTraceValidationErrors();
                                }
                                else if (none_found) {
                                    db_site2.logo_file_name = "(none)";
                                    db2.SaveChangesTraceValidationErrors();
                                }

                                // (2) meta_title search -- not much good
                                //saved = Search_GoogImage.Search($@"{meta_title} ""website logo""", AzureImageFileType.SiteLogo, filename + $"_MT", 1, 0, clipart: true);
                            }
                        }
                    });

                    th.SetApartmentState(ApartmentState.STA);
                    th.Start();
                    var sw = new Stopwatch(); sw.Start();
                    while (th.ThreadState != System.Threading.ThreadState.Stopped) {// && sw.ElapsedMilliseconds < 10000) {
                        Thread.Sleep(100);
                    }
                    try {
                        g.LogLine($"aborting STA thread for awis_site_id={awis_site_id}");
                        th.Abort();
                    }
                    catch { }
                });
            }
        }
    }
}
