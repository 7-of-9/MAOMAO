using mmapi00.Util;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.V2;

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
            [FromBody]dynamic nlp_info)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();

            //g.LogLine(System.Web.Helpers.Json.Encode(nlp_info));
            long user_id_nlp;

            Stopwatch sw = new Stopwatch(); sw.Start();
            if (nlp_info == null) return BadRequest("bad nlp_info");
            if (nlp_info.user_id == null) throw new ArgumentException("missing user_id");
            if (!long.TryParse(nlp_info.user_id.ToString(), out user_id_nlp)) throw new ArgumentException("bad NLP user_id");
            if (user_id != user_id_nlp) throw new ArgumentException("user_id mismatch");

            // process terms & pairs
            var ret = mm_svc.CalaisNlp.ProcessNlpPacket_URL(nlp_info);

            // decache GetNlpInfo() for this url 
            // FIXME -- this doesnt' seem to be working properly; see above - removed caching completely for now on GetNlpInfo()
            var cacheKey = Configuration.CacheOutputConfiguration().MakeBaseCachekey((UrlInfoController t) => t.GetNlpInfo(null));
            var url_href = (string)(nlp_info.url.href.ToString());
            this.RemoveCacheVariants(cacheKey + "-url=" + url_href);

            // record user_url history
            var url = mm_global.Util.RemoveHashFromUrl(nlp_info.url.href.ToString());
            var history_id = mm_svc.User.UserHistory.TrackUrl(url, user_id, 0, 0, 0);

            var db_url = mm_svc.UrlInfo.GetUrl(url);

            return Ok( new { url = nlp_info.url.href,
                new_calais_terms = ret.new_calais_terms,
                           url_W = db_url != null ? db_url.W : -1000,
                         url_W_n = db_url != null ? db_url.W_n : -1000,
                          topics = ret.topics,
                     suggestions = ret.suggestions,
                              ms = sw.ElapsedMilliseconds
            });
        }
    }
}