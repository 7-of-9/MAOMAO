using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class ShareInfo
    {
        public static ShareInfoReturn GetShareData(string share_code)
        {
            using (var db = mm02Entities.Create()) {
                var share = db.shares.Include("term").Include("url").Include("user").Where(p => p.share_code == share_code).FirstOrDefaultNoLock();
                if (share == null)
                    throw new ApplicationException("Not found share code");

                return new ShareInfoReturn()
                {
                    fullname = (share.user.firstname + " " + share.user.lastname) ?? "",
                    url_title = (share.url != null) ? share.url.meta_title : "",
                    topic_title = (share.term != null) ? share.term.name : "",
                    share_all = share.share_all,
                };

            }
        }
    }

    public class ShareInfoReturn
    {
        public string fullname;
        public string url_title;
        public string topic_title;
        public bool share_all;
    }
}
