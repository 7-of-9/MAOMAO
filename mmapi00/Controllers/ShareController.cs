using mmapi00.Util;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace mmapi00.Controllers
{
    /// <summary>
    /// Manages shares: single item, by topic, or global
    /// </summary>
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ShareController : ApiController
    {
        /// <summary>
        /// Create new share
        /// Shares are public to any registered MM user who has the share_code
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="url_id">Single Item: url_id, or</param>
        /// <param name="disc_url_id">Single Item: disc_url_id</param>
        /// <param name="topic_id">Single Topic: topic_id</param>
        /// <param name="share_all">All: share all browsing</param>
        /// <returns>Share code to pass to share/accept</returns>
        [HttpPut] [Route("share/create")]
        public IHttpActionResult Create(
            long user_id, string hash,
            long? url_id = null, long? disc_url_id = null,
            long? topic_id = null,
            bool share_all = false)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var share_code = mm_svc.ShareCreator.CreateShare(user_id, null, url_id, disc_url_id, topic_id, share_all);

            return Ok( new {
                share_code = share_code
            });
        }

        /// <summary>
        /// Accepts a MM share
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="share_code">Share code to accept</param>
        /// <returns>Accepted share or not</returns>
        [HttpGet] [Route("share/accept")]
        public IHttpActionResult Accept(
            long user_id, string hash,
            string share_code)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var share_accepted = mm_svc.ShareAcceptor.AcceptShare(user_id, share_code);

            return Ok( new {
                share_accepted = share_accepted
            });
        }

        /// <summary>
        /// Let a share-originator pause or unpause an accepted share.
        /// </summary>
        /// <param name="user_id">User ID of the share-originator (source user ID).</param>
        /// <param name="hash"></param>
        /// <param name="share_code">Share code to work on.</param>
        /// <param name="target_user_id">User ID of the share-receiver (target user ID).</param>
        /// <returns>New source_user_deactivated status for the accepted share.</returns>
        [HttpGet] [Route("share/source/toggle")]
        public IHttpActionResult Source_ToggleShare(
            long user_id, string hash,
            string share_code, long target_user_id)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            using (var db = mm02Entities.Create()) {
                var share = db.shares.Where(p => p.share_code == share_code && p.source_user_id == user_id).FirstOrDefaultNoLock();
                if (share == null) return Unauthorized();

                var accepted_share = db.share_active.Where(p => p.share_id == share.id && p.user_id == target_user_id).FirstOrDefaultNoLock();
                if (accepted_share == null) return Unauthorized();
            }

            var result = mm_svc.ShareMaintainer.SourceToggleStream(user_id, share_code, target_user_id);

            return Ok (new {
                source_user_deactivated = result
            });
        }

        /// <summary>
        /// Let a share-receiver pause or unpause an accepted share.
        /// </summary>
        /// <param name="user_id">User ID of the share-receiver (target user ID).</param>
        /// <param name="hash"></param>
        /// <param name="share_code">Share code to work on.</param>
        /// <param name="source_user_id">User ID of the share-originator (source user ID).</param>
        /// <returns>Whether or not share was succesfully paused.</returns>
        [HttpGet]
        [Route("share/target/toggle")]
        public IHttpActionResult Target_ToggleShare(
            long user_id, string hash,
            string share_code, long source_user_id)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            using (var db = mm02Entities.Create()) {
                var share = db.shares.Where(p => p.share_code == share_code && p.source_user_id == source_user_id).FirstOrDefaultNoLock();
                if (share == null) return Unauthorized();

                var accepted_share = db.share_active.Where(p => p.share_id == share.id && p.user_id == user_id).FirstOrDefaultNoLock();
                if (accepted_share == null) return Unauthorized();
            }

            var result = mm_svc.ShareMaintainer.TargetToggleStream(source_user_id, share_code, user_id);

            return Ok(new {
                user_deactivated = result
            });
        }

        /// <summary>
        /// Get a MM share info -- anonymous by design: called by new user flow.
        /// </summary>
        /// <param name="share_code">Share code to accept</param>
        /// <returns>share info object</returns>
        [HttpGet] [Route("share/info")]
        public IHttpActionResult Info(
            string share_code)
        {
            var data = mm_svc.ShareInfo.GetShareData(share_code);

            return Ok ( new {
                fullname = data.fullname,
                url_title = data.url_title,
                topic_title = data.topic_title,
                share_all = data.share_all,
                url_id = data.url_id,
                topic_id = data.topic_id,
                source_user_id = data.source_user_id,
            });
        }

        /// <summary>
        /// Returns a single-item url share -- required by new-user-referal flow, post signup to present the shared URL.
        /// Expects only a single-item url share to be supplied; will throw if any other type of share is supplied.
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="share_code"></param>
        /// <returns></returns>
        [Route("share/url")] [HttpGet]
        public IHttpActionResult GetSingleItemShare(
            long user_id, string hash,
            string share_code)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var data = mm_svc.UserHomepage.GetSingleShareUrl(user_id, share_code);

            return Ok(new { url_share = data });
        }
    }
}
