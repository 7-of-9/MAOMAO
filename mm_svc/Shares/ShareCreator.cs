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
            long? topic_id = null,      // topic share
            bool share_all = false      // global share (all browsing!)
            )
        {
            if (url_id == null && topic_id == null && share_all == false) throw new ApplicationException("bad args 1");
            if (url_id != null && (topic_id != null || share_all == true)) throw new ApplicationException("bad args 2");
            if (topic_id != null && (url_id != null || share_all == true)) throw new ApplicationException("bad args 3");
            if (share_all == true && (url_id != null || topic_id != null)) throw new ApplicationException("bad args 4");

            using (var db = mm02Entities.Create()) {
                int trycount = 0;
again:
                var share_code = NewShareCode();
                if (db.shares.Any(p => p.share_code == share_code)) {
                    g.LogLine("### share_code already used! what are the odds?!");
                    if (++trycount < 3)
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

        public static string NewShareCode()
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var stringChars = new char[10];
            var rnd = new Random();
            for (int i = 0; i < stringChars.Length; i++) {
                stringChars[i] = chars[rnd.Next(chars.Length)];
            }
            var finalString = new String(stringChars);
            return finalString;
        }
    }
}
