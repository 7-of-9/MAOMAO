using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class ShareMaintainer
    {
        //
        // TODO: honor source_user_deactivated + user_deactivated in Homepage!
        //       test...
        //

        public static bool? SourceToggleStream(long source_user_id, string share_code, long target_user_id)
        {
            using (var db = mm02Entities.Create()) {
                var share = db.shares.Where(p => p.share_code == share_code && p.source_user_id == source_user_id).FirstOrDefaultNoLock();
                if (share == null)
                    return null;

                var existing = db.share_active.Where(p => p.share_id == share.id && p.user_id == target_user_id).FirstOrDefaultNoLock();
                if (existing != null) {
                    existing.source_user_deactivated = !existing.source_user_deactivated;
                    db.SaveChangesTraceValidationErrors();
                    return existing.source_user_deactivated;
                }

                return null;
            }
        }

        public static bool? TargetToggleStream(long source_user_id, string share_code, long target_user_id)
        {
            using (var db = mm02Entities.Create()) {
                var share = db.shares.Where(p => p.share_code == share_code && p.source_user_id == source_user_id).FirstOrDefaultNoLock();
                if (share == null)
                    return null;

                var existing = db.share_active.Where(p => p.share_id == share.id && p.user_id == target_user_id).FirstOrDefaultNoLock();
                if (existing != null) {
                    existing.user_deactivated = !existing.user_deactivated;
                    db.SaveChangesTraceValidationErrors();
                    return existing.user_deactivated;
                }

                return null;
            }
        }
    }
}
