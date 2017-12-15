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
    public class HomepageController : ApiController
    {
        /// <summary>
        /// Returns user's Discovery stream (server-suggested, based on user's subscribed topics)
        /// (was: disc/root)
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="page_num"></param>
        /// <param name="per_page"></param>
        /// <param name="country"></param>
        /// <param name="city"></param>
        /// <returns></returns>
        [Route("home/discover")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 0, ServerTimeSpan = 60 * 60 * 1)] // only server cache, so we can invalidate
        public IHttpActionResult GetHome_Discovery(long user_id, string hash,
            int page_num = 0, int per_page = 60, string country = null, string city = null)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            var ret = new {
                locations = mm_svc.Discovery.FetchDiscoveries.GetCountryCities(),
              discoveries = mm_svc.Discovery.FetchDiscoveries.GetForUser(user_id, page_num, per_page, country, city),
            };
            return Ok(ret);
        }

        /// <summary>
        /// Returns user's Friends stream (browsing shared by friends, either from Site or Extension)
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="page_num">Zero-based page number to return; pass null for no pagination. If set, per_page must also be set.</param>
        /// <param name="per_page"></param>
        /// <param name="filter_friend_id">TODO</param>
        /// <param name="filter_topic_id">TODO</param>
        /// <returns></returns>
        [Route("home/friends")]
        [HttpGet]
        public IHttpActionResult GetHome_Friends(
            long user_id, string hash,
            int? page_num = null, int per_page = 60,
            long? filter_friend_id = null,
            long? filter_topic_id = null)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            
            var data = mm_svc.UserHomepage.Get(
                user_id, page_num, per_page, get_own: false, get_friends: true,
                filter_user_id: filter_friend_id, filter_term_id: filter_topic_id);
            return Ok( new { received = data.received,
                        urls_received = data.urls_received,
                               topics = data.topics });
        }

        /// <summary>
        /// Returns user's Own stream (his own browsing, from Extension)
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="page_num">Zero-based page number to return; pass null for no pagination. If set, per_page must also be set.</param>
        /// <param name="per_page"></param>
        /// <param name="filter_topic_id"></param>
        /// <returns></returns>
        [Route("home/own")]
        [HttpGet]
        public IHttpActionResult GetHome_Own(
            long user_id, string hash,
            int? page_num = null, int per_page = 60,
            long? filter_topic_id = null)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            var data = mm_svc.UserHomepage.Get(user_id, page_num, per_page, get_own: true, get_friends: false);
            return Ok(new { mine = data.mine,
                       urls_mine = data.urls_mine,
                          topics = data.topics });
        }

        //[Route("user/homepage")]
        //[HttpGet]
        //public IHttpActionResult GetUserHomepage(
        //    long user_id, string hash)
        //{
        //    if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
        //    var data = mm_svc.UserHomepage.Get(user_id);
        //    return Ok(new { mine = data.mine, received = data.received, topics = data.topics });
        //}

        //[Route("user/home")]
        //[HttpGet]
        //public IHttpActionResult DEMO_CalcCategorizedHistory_All(
        //    long user_id, string hash)
        //{
        //    if (!UserHash.Ok(user_id, hash)) return Unauthorized();
        //    var data = mm_svc.UrlClassifier.TmpDemo_ClassifyAllUserHistory(user_id);
        //    return Ok( new {
        //        topics = data.topics,
        //          urls = data.urls.Select(p => new {
        //            suggestions_for_url = p.suggestions,//.Select(p2 => new { suggested_term = p2.term_name, S = p2.S }),
        //                             id = p.url.id,
        //                           href = p.url.url1,
        //                            img = p.url.img_url,
        //                          title = p.url.meta_title,
        //                        hit_utc = p.hit_utc,
        //                       im_score = p.im_score,
        //                    time_on_tab = p.time_on_tab
        //            })
        //    });
        //}
    }
}
