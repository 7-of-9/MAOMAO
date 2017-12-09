using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    // only used by new referral flow (anonymous user)

    public static class ShareInfo
    {
        public static ShareInfoReturn GetShareData(string share_code)
        {
            using (var db = mm02Entities.Create()) {
                var share = db.shares.Include("term").Include("url").Include("user")
                              .Where(p => p.share_code == share_code)
                              .FirstOrDefaultNoLock();
                if (share == null)
                    throw new ApplicationException("Not found share code");

                return new ShareInfoReturn() {
                    fullname = (share.user.firstname + " " + share.user.lastname) ?? "",
                    url_title = (share.url != null) ? share.url.meta_title : "",
                    img_url = (share.url != null) ? share.url.img_url : "",
                    topic_title = (share.term != null) ? share.term.name : "",
                    share_all = share.share_all,
                    url_id = share.url_id,
                    topic_id = share.topic_id,
                    source_user_id = share.source_user_id,
                };
            }
        }
    }

    public class ShareInfoReturn {
        public string fullname;
        public string url_title;
        public string img_url;
        public string topic_title;

        public bool share_all;
        public long? url_id;
        public long? topic_id;

        public long source_user_id;
    }
}
