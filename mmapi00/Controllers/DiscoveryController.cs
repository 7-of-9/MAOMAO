using mmapi00.Util;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.Core.Cache;
using WebApi.OutputCache.V2;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class DiscoveryController : ApiController
    {
        [Route("disc/cache_clear")]
        [HttpGet]
        public IHttpActionResult ClearCache_DiscoveryUser_Root(long user_id) {

            var removed = this.RemoveCacheKeys_2($"mmapi00.controllers.discoverycontroller-discoveryuser_root-user_id={user_id}");
            return Ok( new { removed_count = removed } );
        }

        [Route("disc/root")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 0, ServerTimeSpan = 60 * 60 * 1)] // only server cache, so we can invalidate
        public IHttpActionResult DiscoveryUser_Root(long user_id, string hash,
            int page_num = 0, int per_page = 60, string country = null, string city = null)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var ret = new {
                  locations = mm_svc.Discovery.FetchDiscoveries.GetCountryCities(),
                discoveries = mm_svc.Discovery.FetchDiscoveries.GetForUser(user_id, page_num, per_page: per_page, country: country, city: city),
            };
            return Ok(ret);
        }

        [Route("disc/term")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 1)] // 1 hr / 1 hrs
        public IHttpActionResult Discovery_Term(//long user_id, string hash,
            long term_id, int page_num = 0, int per_page = 60, string country = null, string city = null)
        {
            //if (!UserAuth.Ok(user_id, hash)) return Unauthorized();

            var ret = new {
                  locations = mm_svc.Discovery.FetchDiscoveries.GetCountryCities(),
                discoveries = mm_svc.Discovery.FetchDiscoveries.GetForTerm(term_id, page_num, per_page: per_page, country: country, city: city),
            };
            return Ok(ret);
        }


        [Route("disc/url/{url_id}")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 60 * 60 * 1, ServerTimeSpan = 60 * 60 * 1)] // 1 hr / 1 hrs
        public IHttpActionResult Discovery_URL(long url_id)
        {
            var ret = mm_svc.Discovery.FetchDiscoveries.getForUrl(url_id);
            return Ok(ret);
        }
    }
}
