using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class ShareAcceptor
    {
        public static bool AcceptShare(long user_id, string share_code)
        {
            using (var db = mm02Entities.Create()) {
                var share = db.shares.Where(p => p.share_code == share_code).FirstOrDefaultNoLock();
                if (share == null)
                    return false;

                // if share was directed at a specific target user, validate that the right user has picked up the share
                // (not - not used at the moment, target_user_id == null; shares are directed at new users, not existing users!)
                if (share.target_user_id != null && user_id != share.target_user_id)
                    return false;

                // can't share to self
                if (share.source_user_id == user_id)
                    return false;

                // has the user already accepted this share?
                var existing = db.share_active.Where(p => p.share_id == share.id && p.user_id == user_id).FirstOrDefaultNoLock();
                if (existing != null)
                    return true;

                // new active share
                var share_active = new share_active() {
                    share_id = share.id,
                    user_id = user_id,
                    accepted_utc = DateTime.UtcNow,
                };
                db.share_active.Add(share_active);
                db.SaveChangesTraceValidationErrors();
                return true;
            }
        }
    }
}
