using mmapi00.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UserTopicsController : ApiController
    {
        [Route("user_topics/add")]
        [HttpGet]
        public IHttpActionResult AddUserTopic(
            long user_id, string hash,
            long topic_id)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            mm_svc.UserTopics.AddUserTopic(user_id, topic_id);
            return Ok(new {});
        }

        [Route("user_topics/remove")]
        [HttpDelete]
        public IHttpActionResult RemoveUserTopic(
           long user_id, string hash,
           long topic_id)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            mm_svc.UserTopics.RemoveUserTopic(user_id, topic_id);
            return Ok(new {});
        }
    }
}
