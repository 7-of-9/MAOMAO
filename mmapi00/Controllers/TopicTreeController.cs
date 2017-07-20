using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.V2;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class TopicTreeController : ApiController
    {
        /// <summary>
        /// Gets the entire MM topic tree hierarchy.
        /// </summary>
        /// <returns>The topic tree.</returns>
        [Route("topic_tree/get")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 24)] // 1 hr / 24 hrs
        public IHttpActionResult GetTopicTree()
        {
            var topic_tree = mm_svc.Terms.TopicTree.GetTopicTree();
            return Ok(new {
                tree = topic_tree,
            });
        }
    }
}
