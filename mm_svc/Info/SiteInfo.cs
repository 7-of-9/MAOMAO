using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using mmdb_model;
using mm_global;
using mm_aws;
using System.Diagnostics;
using mm_global.Extensions;
using mm_svc.Discovery;
using mm_svc.Images;
using System.Threading;
using System.Windows.Forms;
using mm_svc.Util.Utils;

namespace mm_svc
{
    /// <summary>
    /// Returns top-level blacklist/AWIS info for a TLD (site)
    /// </summary>
    public static class SiteInfo
    {
        //
        // TODO: before beta/soft launch -- 
        //          (1) find top 100 banking sites, make sure all are excluded
        //          (2) find top 100 xxx sites, "
        //          (3) find top 100 signin/auth sites (email proviers?), "
        //
        private static string[] disallowAwisCatsContaining = new string[] {
            "Financial_Services/Banking_Services",
            "Financial_Services/Banks",

            "Transportation/Airlines",
            "Transportation/Air",
            "/Transportation",

            "Internet/E-mail/Free/Web-Based",
            "Internet/Searching/Search_Engines",

            "Search_Engines/Google",
            "Guides_and_Directories/Search_Engines",

            "Software/Groupware",
            "Project_Management/Hosted",
            "Servers/Collaboration", 

            "Software/Word_Processors",

            "Android/Markets",
        };

        private static string[] disallowUrlsContaining = new string[] {
            "bank",
            "google.com.", // e.g. www.google.com.sg -- not known by awis, would otherwise be allowable
        };

        private static string[] disallowAwisTitlesContaining = new string[] {
            "bank",
        };

        public static bool IsSiteAllowable(awis_site awis_site)
        {
            bool allowable = true;

            //if (awis_site.awis_cat_id == null) // too restrictive
            //    allowable = false;

            if (awis_site.hard_disallow == true)
                allowable = false;

            if (awis_site.adult == true)
                allowable = false;

            if (awis_site.awis_cat != null && awis_site.awis_cat.abs_path != null)
                if (disallowAwisCatsContaining.Any(p => awis_site.awis_cat.abs_path.IndexOf(p) != -1))
                    allowable = false;

            if (disallowUrlsContaining.Any(p => awis_site.url.ToLower().IndexOf(p.ToLower()) != -1))
                allowable = false;

            if (disallowAwisTitlesContaining.Any(p => awis_site.title.ToLower().IndexOf(p.ToLower()) != -1))
                allowable = false;

            return allowable;
        }

        private static void MaintainSiteLogo(awis_site site)
        {
            // maintain TLD logo (google image search)
            var th = new Thread(() => { //Task.Run(() => {
                Application.DoEvents();
                using (var db2 = mm02Entities.Create()) {
                    var db_site2 = db2.awis_site.Find(site.id);
                    var filename = ImageNames.GetSiteFilename(db_site2);
                    var master_jpeg = filename + "_M1.jpeg";
                    var master_png = filename + "_M1.png";

                    if (!AzureFile.Exists(master_jpeg) && !AzureFile.Exists(master_png)) {
                        var trimmed_tld = TldTitle.GetPartialTldNameWithSuffix(site.TLD);
                        var saved = Search_GoogImage.Search($"{trimmed_tld} website logo", filename, 1, 0, clipart: true);
                        if (saved.Count > 0) { 
                            db_site2.logo_file_name = saved[0];
                            db2.SaveChangesTraceValidationErrors();
                        }
                    }
                }
            });
            th.SetApartmentState(ApartmentState.STA);
            th.Start();
            var sw = new Stopwatch(); sw.Start();
            while (th.ThreadState != System.Threading.ThreadState.Stopped) {// && sw.ElapsedMilliseconds < 1000 * 20) {
                Thread.Sleep(100);
            }
            try { th.Abort(); }
            catch { }
        }

        public static awis_site GetOrQueryAwis(string site_tld_or_url, out bool returned_from_db)
        {
            using (var db = mm02Entities.Create())
            {
                string tld = mm_global.Util.GetTldFromUrl(site_tld_or_url);
                int try_count = 0;

retry:
                if (try_count > 2)
                    throw new ApplicationException("too many SaveChanges_IgnoreDupeKeyEx failures.");

                // in DB list of known sites?
                awis_cat db_cat = null;
                var db_site_qry = db.awis_site.Include("awis_cat").Where(p => p.TLD == tld);
                var db_site = db_site_qry.FirstOrDefaultNoLock();
                if (db_site != null) {
                    g.LogLine($"returning AWIS DB info for site_id={db_site.id}, as_of={db_site.as_of_utc}");
                    returned_from_db = true;
                    MaintainSiteLogo(db_site);
                    return db_site;
                }

                // if not, fetch info from AWIS
                g.LogInfo($"FETCHING AWIS info for unknown tld={tld}...");
                dynamic info = AWIS.GetTldInfo(tld);  // http://docs.aws.amazon.com/AlexaWebInfoService/latest/
                var content_data = info.UrlInfoResponse.Response.UrlInfoResult.Alexa.ContentData;

                // maintain AWIS category
                dynamic categories = null;
                try {
                    categories = info.UrlInfoResponse.Response.UrlInfoResult.Alexa.Related.Categories.CategoryData;
                }
                catch (Exception ex) {  // handle no returned AWIS category -- assign to stoplist by virtue of missing AWIS category
                    if (ex.Message == "'System.Dynamic.ExpandoObject' does not contain a definition for 'Categories'")
                        g.LogInfo($"WARN: got no AWIS category info unknown tld={tld} - {ex.Message}!");
                    else throw;
                }

                // record cateogory if AWIS returned it
                if (categories != null) { 
                    var cat = categories is IEnumerable<object> ? categories[0] : categories;
                    var cat_title = (string)cat.Title;  // only the *first* category seems useful - others seem innacurate
                    var cat_path = (string)cat.AbsolutePath;
                    db_cat = db.awis_cat.Where(p => p.abs_path == cat_path).FirstOrDefaultNoLock();
                    if (db_cat == null) {
                        db_cat = new awis_cat();
                        db_cat.abs_path = cat_path.TruncateMax(128);
                        db_cat.title = cat_title;
                        db.awis_cat.Add(db_cat);
                        if (db.SaveChanges_IgnoreDupeKeyEx() == false) { try_count++; goto retry; }

                        g.LogLine($"wrote new AWIS cat_id={db_cat.id} [{db_cat.abs_path}]");
                    }
                    else
                        g.LogLine($"known AWIS cat_id={db_cat.id} [{db_cat.abs_path}]");
                }

                // maintain AWIS site -- with or without category
                var url = (string)content_data.DataUrl;
                var title = (string)content_data.SiteData.Title;
                var desc = "?"; try {
                    desc = (string)content_data.SiteData.Description;
                } catch(Exception ex) {
                    if (ex.Message != "'System.Dynamic.ExpandoObject' does not contain a definition for 'Description'")
                        throw;
                }
                var adult_content = (string)content_data.AdultContent;
                var lang = content_data.Language is string ? "?" : (string)content_data.Language.Locale;
              //var links_in_count = (string)content_data.LinksInCount;
                db_site = new awis_site();
                db_site.adult = adult_content == "yes";
                db_site.as_of_utc = DateTime.UtcNow;
                db_site.awis_cat_id = db_cat != null ? (long?)db_cat.id : null;
                db_site.lang = lang;
                db_site.title = title;
                db_site.TLD = tld;
                db_site.url = url;
                db_site.desc = desc;
                db.awis_site.Add(db_site);
                if (db.SaveChanges_IgnoreDupeKeyEx() == false) { try_count++; goto retry; }
                g.LogLine($"wrote new AWIS site_id={db_site.id} [{db_site.url}]");

                MaintainSiteLogo(db_site);

                returned_from_db = false;
                return db_site;

                // related links: not used
                //var related = info.UrlInfoResponse.Response.UrlInfoResult.Alexa.Related.RelatedLink;
                //var related_links = related.RelatedLinks;
                //foreach (var related_link in related_links) {
                //    var related_link_data_url = (string)related_link.DataUrl;
                //    var related_link_navigable_url = (string)related_link.NavigableUrl;
                //    var related_link_title = (string)related_link.Title;
                //}
            }
        }
    }
}
