using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mmapi00.Controllers
{
    public class TestController : ApiController
    {
        [HttpGet]
        [Route("test/headers")]
        public IHttpActionResult DumpHeaders()
        {
            var s = string.Join(" / ", this.Request.Headers.Select(p => $"{p.Key}={string.Join(",", p.Value)}"));

            return Ok(new {
                headers = s
            });
        }
    }
}
