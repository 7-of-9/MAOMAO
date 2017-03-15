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
using mmapi00.Util;

namespace mmapi00.Controllers
{
    /// <summary>
    /// Records a URL and returns its TLD title topic
    /// </summary>
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UrlRecord : ApiController
    {
        /// <summary>
        /// Records a URL and returns its TLD title topic
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="href">URI for URL</param>
        /// <param name="text">NLP text for URL</param>
        /// <returns></returns>
        [Route("api/url/record")]
        [HttpPut]
        public IHttpActionResult RecordUrl(
            int user_id, string hash,
            string href, string text)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();
            if (string.IsNullOrEmpty(href) || string.IsNullOrEmpty(text)) return BadRequest();

            Stopwatch sw = new Stopwatch(); sw.Start();

            //
            // ***TODO: mm02 needs to call this fn. first, then use returned tld_topic
            //          for sharing by TLD UX.
            //
            //  (in parallel, it's calling calais and will PUT the results when they're ready)
            //
            var tld_topic = UrlRecorder.RecordUrl(href, text);

            // record user_url history
            var history_id = mm_svc.User.UserHistory.TrackUrl(href, user_id, 0, 0, 0);

            return Ok( new {
                ms = sw.ElapsedMilliseconds,
                tld_topic = tld_topic.term_name,
            });
        }
    }
}