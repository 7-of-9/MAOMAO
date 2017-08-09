using mmapi00.Util;
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
    public class DiscoveryController : ApiController
    {
        [Route("disc/root")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 1)] // 1 hr / 1 hrs
        public IHttpActionResult DiscoveryUser_Root(long user_id, string hash)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            return Ok(new {  });
        }

        [Route("disc/term")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 1)] // 1 hr / 1 hrs
        public IHttpActionResult Discovery_Term(long user_id, string hash, long term_id)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            return Ok(new {  });
        }
    }
}
