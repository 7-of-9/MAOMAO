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
    public class Share : ApiController
    {
        [HttpPut] [Route("share/create")]
        public IHttpActionResult Create(
            long user_id, string hash, 
            long? url_id = null, long? topic_id = null, bool share_all = false)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            return Ok(new {
            });
        }

        [HttpGet] [Route("share/accept")]
        public IHttpActionResult Accept(
            long user_id, string hash,
            string share_code)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            return Ok(new {
            });
        }
    }
}