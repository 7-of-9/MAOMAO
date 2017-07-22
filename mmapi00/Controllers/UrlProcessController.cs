using mmapi00.Util;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.V2;
using PusherServer;

namespace mmapi00.Controllers
{
    /// <summary>
    /// Accepts and processes NLP data for a URL
    /// </summary>
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UrlProcessController : ApiController
    {
        /// <summary>
        /// Stores Calais NLP info for a URL
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="nlp_info">JSON of Calais NLP info</param>
        /// <returns></returns>
        [Route("url/process")]
        [HttpPut]
        //[InvalidateCacheOutput("GetNlpInfo")] // not desired - invalidates the cache for all URL params!! see below fixme
        public IHttpActionResult PutNlpInfoCalais(
            long user_id, string hash,
            [FromBody] dynamic nlp_info)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            if (nlp_info == null) return BadRequest("bad nlp_info");
            //long user_id_nlp;
            //if (nlp_info.user_id == null) throw new ArgumentException("missing user_id");
            //if (!long.TryParse(nlp_info.user_id.ToString(), out user_id_nlp)) throw new ArgumentException("bad NLP user_id");
            //if (user_id != user_id_nlp) throw new ArgumentException("user_id mismatch");
            Stopwatch sw = new Stopwatch(); sw.Start();

            // process terms & pairs
            var ret = mm_svc.CalaisNlp.ProcessNlpPacket_URL(nlp_info);

            // decache GetNlpInfo() for this url 
            // FIXME -- this doesnt' seem to be working properly; see above - removed caching completely for now on GetNlpInfo()
            var cacheKey = Configuration.CacheOutputConfiguration().MakeBaseCachekey((UrlInfoController t) => t.GetNlpInfo(null,null));
            var url_href = (string)(nlp_info.url.href.ToString());
            this.RemoveCacheVariants(cacheKey + "-url=" + url_href);

            // record user_url history
            var url = mm_global.Util.RemoveHashFromUrl(nlp_info.url.href.ToString());
            var history_id = mm_svc.UserHistory.TrackUrl(url, (string)nlp_info.document_head_hash, user_id, 0, 0, 0);

            var db_url = mm_svc.UrlInfo.GetUrl(url, (string)nlp_info.document_head_hash);
            
            // push notification to client
            var options = new PusherOptions();
            options.Cluster = "ap1";
            options.Encrypted = true;
            var pusher = new Pusher("332227", "056a3bc19f7b681fd6fb", "85101936fa2c6216a316", options);
            var result = pusher.Trigger("my-friend-stream-" + user_id, "process-url", new
            {
                url = nlp_info.url.href,
                new_calais_terms = ret.new_calais_terms,
                url_W = db_url != null ? db_url.W : -1000,
                url_W_n = db_url != null ? db_url.W_n : -1000,
                url_id = db_url != null ? (long?)db_url.id : null,
                topics = ret.topics,
                suggestions = ret.suggestions,
                ms = sw.ElapsedMilliseconds
            });

            return Ok( new { url = nlp_info.url.href,
                new_calais_terms = ret.new_calais_terms,
                           url_W = db_url != null ? db_url.W : -1000,
                         url_W_n = db_url != null ? db_url.W_n : -1000,
                          url_id = db_url != null ? (long?)db_url.id : null,
                          topics = ret.topics,
                     suggestions = ret.suggestions,
                              ms = sw.ElapsedMilliseconds
            });
        }
    }
}