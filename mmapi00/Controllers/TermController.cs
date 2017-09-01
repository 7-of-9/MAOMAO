using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.V2;
using static mm_svc.Terms.TopicTree;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class TermController : ApiController
    {
        /// <summary>
        /// Gets term by id.
        /// </summary>
        /// <returns>Term info.</returns>
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

        /// <summary>
        /// Get term by name.
        /// </summary>
        /// <returns>Term info.</returns>
        [Route("term/lookup")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 24)] // 24 hr / 24 hrs
        public IHttpActionResult GetTerm([FromUri]string[] names)
        {
            var term_infos = new List<TermInfo>();
            Parallel.ForEach(names, (name) => {
                term_infos.Add(mm_svc.Terms.TopicTree.GetTermInfo(name));
            });

            return Ok(new {
                terms = term_infos
            });
        }
    }
}
