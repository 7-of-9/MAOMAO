using mmapi00.Util;
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
        /// <param name="url_id">Share single URL</param>
        /// <param name="topic_id">Or: Share single topic</param>
        /// <param name="share_all">Or: Share all</param>
        /// <returns>Share code to pass to share/accept</returns>
        [HttpPut] [Route("share/create")]
        public IHttpActionResult Create(
            long user_id, string hash, 
            long? url_id = null, long? topic_id = null, bool share_all = false)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            var share_code = mm_svc.ShareCreator.CreateShare(user_id, null, url_id, topic_id, share_all);

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
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            var share_accepted = mm_svc.ShareAcceptor.AcceptShare(user_id, share_code);

            return Ok(new {
                share_accepted = share_accepted
            });
        }
    }
}