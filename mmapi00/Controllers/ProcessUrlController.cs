using System.Diagnostics;
using System.Web.Http;
using WebApi.OutputCache.V2;
using System.Threading.Tasks;
using System;
using System.Globalization;
using static mm_svc.Terms.GoldenPaths;
using System.Collections.Generic;
using mm_svc;
using System.Web.Http.Cors;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ProcessUrlController : ApiController
    {
        [Route("api/url/process")]
        [HttpPut]
        public IHttpActionResult ProcessUrl(string href, string text)
        {
            if (string.IsNullOrEmpty(href) || string.IsNullOrEmpty(text)) return BadRequest();

            Stopwatch sw = new Stopwatch(); sw.Start();
            var url = mm_global.Util.RemoveHashFromUrl(href);

            // (1) process Calais (same as api/url_nlpinfo_calais) -- but async!

            // (2) return single topic fast (URL title topic)

            return Ok( new {
                ms = sw.ElapsedMilliseconds
            });
        }
    }
}