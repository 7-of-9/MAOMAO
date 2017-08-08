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
using System.Windows.Forms;

namespace mm_svc.Maintenance
{
    public static class SiteImages
    {
        public static void Maintain(int n_this = 1, int n_of = 1)
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;

            using (var db = mm02Entities.Create()) {
                var sites_mising_logos = db.awis_site.Where(p => string.IsNullOrEmpty(p.logo_file_name))
                                           .Select(p => new { id = p.id, guid = Guid.NewGuid() }).ToListNoLock();
                g.LogInfo($"sites_mising_logos.Count={sites_mising_logos.Count}");

                // using Parallel class causes WebBrowser in STA thread to (after some reps of the loop) start to timeout; no idea why
                //Parallel.ForEach(sites_mising_logos, new ParallelOptions() { MaxDegreeOfParallelism = 1 }, awis_site_id => {

                int threads_to_use = 2;
                var threads = new List<Thread>();
                for (int i = 0; i < threads_to_use; i++) {
                    int thread_id = i;
                    threads.Add(new Thread(() => {

                        foreach (var awis_site in sites_mising_logos) {
                            var awis_site_id = awis_site.id;
                            var awis_site_guid = awis_site.guid;
                            var guid_hash = awis_site_guid.GetHashCode();

                            // threading determine here
                            //if (guid_hash % threads_to_use == thread_id) {

                            // threading determined by caller
                            if (guid_hash % n_of == n_this - 1) {
                            
                                g.LogInfo($"thread_id={thread_id} guid_hash={guid_hash} n_this={n_this} n_of={n_of}");
                                try {
                                    using (var db2 = mm02Entities.Create()) {
                                        //g.LogLine($"thread_id={thread_id} awis_site_id={awis_site_id}");

                                        var db_site2 = db2.awis_site.Find(awis_site_id);
                                        var filename = ImageNames.GetSiteFilename(db_site2);
                                        var master_jpeg = filename + "_M1.jpeg";
                                        var master_png = filename + "_M1.png";

                                        if (!AzureImageFile.Exists(AzureImageFileType.SiteLogo, master_jpeg) && !AzureImageFile.Exists(AzureImageFileType.SiteLogo, master_png)) {

                                            // (1) tld search
                                            var trimmed_tld = TldTitle.GetPartialTldNameWithSuffix(db_site2.TLD);
                                            var saved = Search_GoogImage.Search(out bool none_found, $"{trimmed_tld} website logo", AzureImageFileType.SiteLogo, filename, 5, 0, clipart: true);
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
                                }
                                catch (Exception ex) {
                                    g.LogException(ex);
                                }
                            }
                        }
                    }));
                }

                threads.ForEach(th => {
                    th.SetApartmentState(ApartmentState.STA);
                    th.Start();
                });

                threads.ForEach(th => {
                    var sw = new Stopwatch(); sw.Start();
                    while (th.ThreadState != System.Threading.ThreadState.Stopped) {// && sw.ElapsedMilliseconds < 2000) {
                        Thread.Sleep(100);
                        //Application.DoEvents();
                    }
                    try {
                        g.LogWarn($"aborting STA thread");// for awis_site_id={awis_site_id}");
                        th.Abort();
                    }
                    catch { }
                });
            }
        }
    }
}
