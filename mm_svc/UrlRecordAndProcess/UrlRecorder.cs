using mm_global;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UrlRecorder
    {
        //
        // Initial call: records URL w/ single url title term
        //
        public static UrlInfo.UrlParent RecordUrl(string href, string raw_text, out long? url_id, out long? tld_topic_id)
        {
            url_id = null;

            // get awis site -- prep/sanity checking
            var url = mm_global.Util.RemoveHashFromUrl(href.ToString());
            bool returned_from_db;
            var awis_site = mm_svc.SiteInfo.GetOrQueryAwis(url, out returned_from_db);
            if (awis_site == null) throw new ApplicationException("bad site");
            if (!SiteInfo.IsSiteAllowable(awis_site)) throw new ApplicationException("bad site");

            // check not already recorded
            var db_url = mm_svc.UrlInfo.GetUrl(url);
            if (db_url == null) {
                using (var db = mm02Entities.Create()) {
                    // create new url row
                    db_url = new url();
                    db_url.url1 = url;
                    db_url.awis_site_id = awis_site.id;
                    db_url.cal_lang = "TBD";
                    db_url.calais_as_of_utc = null; // no NLP yet
                    db_url.meta_title = "TBD";
                    db_url.meta_all = "TBD";
                    db.urls.Add(db_url);
                    db.SaveChangesTraceValidationErrors();
                    g.LogLine($"recorded url url1={db_url.url1}");

                    // ***TODO: record raw text here...

                    // get or add TLD_TITLE term 
                    var tld_title_term_id = UrlProcessor.GetOrAdd_TldTitleTerm(db, db_url.id);

                    // record TLD_TITLE term
                    UrlProcessor.CalcAndStoreUrlParentTerms_TldTitleTerm(db, db_url.id, tld_title_term_id);
                }
            }

            // get url title term -- will be no calais or wiki terms yet
            List<UrlInfo.UrlParent> topics = null;
            List<UrlInfo.UrlParent> suggestions = null;
            UrlInfo.UrlParent url_title_term;
            UrlInfo.GetFilteredTopicsAndSuggestions(db_url.id, out topics, out suggestions, out url_title_term, out tld_topic_id);

            url_id = db_url.id;
            return url_title_term;
        }
    }
}
