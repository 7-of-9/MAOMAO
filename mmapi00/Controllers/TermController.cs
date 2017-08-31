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
    public class TermController : ApiController
    {
        /// <summary>
        /// Gets info for a term_id.
        /// </summary>
        /// <returns>The topic tree.</returns>
        [Route("term/{id}")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 24)] // 24 hr / 24 hrs
        public IHttpActionResult GetTerm(long id)
        {
            var term_info = mm_svc.Terms.TopicTree.GetTermInfo(id);

            return Ok(new {
                term = term_info
            });
        }
    }
}
