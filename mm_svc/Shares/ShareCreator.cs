using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class ShareCreator
    {
        const int MAX_RETRY = 5;
        //
        // todo -- add "url_channel_id" (nvarchar) to [share]
        //  >> to allow sharing of ONE specific YT channel (gets put into share.url_channel_id and into url.channel_id by RecordUrl) <<
        //
        public static string CreateShare(
            
            long user_id,

            // share is directed and only valid for a single (existing) user
            // not used for now; share targets are *new* users, no user ID at share creation time!
            long? target_user_id, 
            
            // share type
            long? url_id = null,        // single item share (one URL)
            long? disc_url_id = null,   // single item share (one disc URL)

            long? topic_id = null,      // OR topic share
            bool share_all = false      // OR global share (all browsing!)
            )
        {
            if (url_id == null && disc_url_id == null && topic_id == null && share_all == false) throw new ApplicationException("bad args 1");
            if (url_id != null && (topic_id != null || disc_url_id != null || share_all == true)) throw new ApplicationException("bad args 2.1");
            if (disc_url_id != null && (topic_id != null || url_id != null || share_all == true)) throw new ApplicationException("bad args 2.2");
            if (topic_id != null && (url_id != null || disc_url_id != null || share_all == true)) throw new ApplicationException("bad args 3");
            if (share_all == true && (url_id != null || disc_url_id != null || topic_id != null)) throw new ApplicationException("bad args 4");

            // promote [disc_url] -> [url]
            if (disc_url_id != null) {
                url_id = Url_FromDiscUrl((long)disc_url_id);
            }

            using (var db = mm02Entities.Create()) {
                int trycount = 0;
again:
                var share_code = NewShareCode();
                if (db.shares.Any(p => p.share_code == share_code)) {
                    g.LogLine("### share_code already used! what are the odds?!");
                    if (++trycount < MAX_RETRY)
                        goto again;
                    else throw new ApplicationException("buy lottery tickets...");
                }

                var share = new share() {
                    source_user_id = user_id,
                    target_user_id = target_user_id,
                    share_code = share_code,
                    url_id = url_id,
                    share_all = share_all,
                    topic_id = topic_id,
                    created_utc = DateTime.UtcNow,
                };
                db.shares.Add(share);
                db.SaveChangesTraceValidationErrors();

                return share_code;
            }
        }

        //
        // "promotes" a disc_url to a url row; to allow sharing from discovery UI for single items
        //
        private static long Url_FromDiscUrl(long disc_url_id)
        {
            using (var db = mm02Entities.Create()) {
                disc_url db_disc_url = db.disc_url.Find(disc_url_id);

                // get AWIS site
                var url = mm_global.Util.RemoveHashFromUrl(db_disc_url.url.ToString());
                var awis_site = mm_svc.SiteInfo.GetOrQueryAwis(url, out bool returned_from_db);
                if (awis_site == null) throw new ApplicationException("bad site");
                //if (!SiteInfo.IsSiteAllowable(awis_site)) throw new ApplicationException("bad site");

                // create if not present
                var db_url = mm_svc.UrlInfo.GetUrl(url, document_head_hash: null);
                if (db_url == null) {
                    var note = $"N/A__FROM_DISC_URL_#{disc_url_id}";
                    db_url = new url() {
                        url1 = db_disc_url.url,
                        url_hash = note,
                        awis_site_id = awis_site.id,
                        cal_lang = "TBD",
                        calais_as_of_utc = null, // no NLP yet
                        meta_title = "TBD",
                        meta_all = "TBD",
                        raw_text = note,
                    };
                    db.urls.Add(db_url);
                    db.SaveChangesTraceValidationErrors();

                    // get or add TLD_TITLE term 
                    var tld_title_term_id = UrlProcessor.GetOrAdd_TldTitleTerm(db, db_url.id);

                    // record TLD_TITLE term
                    UrlProcessor.CalcAndStoreUrlParentTerms_TldTitleTerm(db, db_url.id, tld_title_term_id);

                }

                return db_url.id;
            }
        }

        public static string NewShareCode()
        {
            // var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            // var stringChars = new char[10];
            // var rnd = new Random();
            // for (int i = 0; i < stringChars.Length; i++) {
            //     stringChars[i] = chars[rnd.Next(chars.Length)];
            // }
            // var finalString = new String(stringChars);
            // return finalString;
            // Reference: https://www.codeproject.com/Articles/14403/Generating-Unique-Keys-in-Net
           return Guid.NewGuid().ToString().GetHashCode().ToString("x");
        }
    }
}
