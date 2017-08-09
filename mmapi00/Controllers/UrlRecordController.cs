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
using PusherServer;


namespace mmapi00.Controllers
{
    /// <summary>
    /// Records a URL and returns its TLD title topic
    /// </summary>
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UrlRecordController : ApiController
    {
        public class RecordUrlParam {
            public string href { get; set; }
            public string text { get; set; }
            public string document_head_hash { get; set; }
        }

        /// <summary>
        /// Records a URL and returns its TLD title topic
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="param">input data</param>
        /// <returns></returns>
        [Route("url/record")]
        [HttpPut]
        public IHttpActionResult RecordUrl(
            int user_id, string hash,
            [FromBody] RecordUrlParam param)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            if (param == null) return BadRequest();
            if (string.IsNullOrEmpty(param.href) || string.IsNullOrEmpty(param.text)) return BadRequest();
            Stopwatch sw = new Stopwatch(); sw.Start();

            long? url_id;
            long? tld_topic_id;
            var tld_topic = UrlRecorder.RecordUrl(param.href, param.text, param.document_head_hash, out url_id, out tld_topic_id);

            var history_id = mm_svc.UserHistory.TrackUrl(param.href, param.document_head_hash, user_id, 0, 0, 0);

            // push notification to client
            var options = new PusherOptions();
            options.Cluster = "ap1";
            options.Encrypted = true;

            var pusher = new Pusher("332227", "056a3bc19f7b681fd6fb", "85101936fa2c6216a316", options);

            var result = pusher.Trigger("my-friend-stream-" + user_id, "record-url", new {
                url_id = url_id,
                tld_topic_id = tld_topic_id,
                tld_topic = tld_topic.term_name,
                ms = sw.ElapsedMilliseconds,
            });


            return Ok( new {
                    url_id = url_id,
                    tld_topic_id = tld_topic_id,
                 tld_topic = tld_topic.term_name,
                        ms = sw.ElapsedMilliseconds,
            });
        }
    }
}