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
        [Route("user_topics/bulk")]
        [HttpPost]
        public IHttpActionResult AddUserTopic(
          long user_id, string hash,
          [FromUri] List<long> topic_ids)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            
            int n = mm_svc.UserTopics.AddUserTopics(user_id, topic_ids);

            //var removed = this.RemoveCacheKeys_2($"mmapi00.controllers.discoverycontroller-discoveryuser_root-user_id={user_id}");
            var removed = this.RemoveCacheKeys_2($"mmapi00.controllers.homepagecontroller-gethome_discovery-user_id={user_id}");
            return Ok(new { added = n, caches_invalidated = removed });
        }


        [Route("user_topics/{topic_id}")]
        [HttpDelete]
        public IHttpActionResult RemoveUserTopic(
           long user_id, string hash,
           long topic_id)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            mm_svc.UserTopics.RemoveUserTopic(user_id, topic_id);

            //var removed = this.RemoveCacheKeys_2($"mmapi00.controllers.discoverycontroller-discoveryuser_root-user_id={user_id}");
            var removed = this.RemoveCacheKeys_2($"mmapi00.controllers.homepagecontroller-gethome_discovery-user_id={user_id}");
            return Ok( new { caches_invalidated = removed });
        }

        [Route("user_topics")]
        [HttpGet]
        public IHttpActionResult GetAllUserTopics(
           long user_id, string hash)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var topics = mm_svc.UserTopics.GetUserTopics(user_id);
            return Ok(new { topics = topics });
        }
    }
}
