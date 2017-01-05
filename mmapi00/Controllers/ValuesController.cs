using Microsoft.ApplicationInsights;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mmapi00.Controllers
{
    public class ValuesController : ApiController
    {
        // GET api/values
        public IEnumerable<string> Get()
        {
            //try
            {
                throw new ApplicationException("test");
            }
            //catch (Exception ex)
            //{
            //    var telemetry = new TelemetryClient();
            //    telemetry.TrackException(ex);
            //    throw;
            //}
        }

        public IHttpActionResult Get(string id)
        {
            var ret = new { a = 1, b = id };
            return Ok(ret);
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
