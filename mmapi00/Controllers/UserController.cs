using Microsoft.ApplicationInsights;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using mm_global;
using mmdb_model;
using WebApi.OutputCache.V2;
using System.Dynamic;
using WebApi.OutputCache.Core.Cache;
using System.Threading.Tasks;
using System.Web.Http.Cors;
using mmapi00.Util;

namespace mmapi00.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class UserController : ApiController
    {
        /// <summary>
        /// Register new user by google
        /// </summary>
        /// <returns></returns>
        [Route("user/google")]
        [HttpPost]
        public IHttpActionResult CreateUser([FromBody]user user)
        {
            if (user == null) return BadRequest("bad user input");
            var db_user = mm_svc.User.Register.CreateGoogleUserIfNotExist(user.firstname, user.lastname, user.email, user.gender, user.google_user_id);

            return Ok(new { id = db_user.id, email = db_user.email });
        }

        /// <summary>
        /// Stores user browse history
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="history">JSON of user history</param>
        /// <returns></returns>
        [Route("user/history")]
        [HttpPost]
        public IHttpActionResult PostUserHistory(
            int user_id, string hash,
            [FromBody]dynamic history)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();
            if (history == null) return BadRequest("bad user_history");
            if (history.url == null) return BadRequest("missing url");
            if (history.userId == null) return BadRequest("missing user id");
            if (history.userId != user_id) throw new ArgumentException("user_id mismatch");

            var history_id = mm_svc.User.UserHistory.TrackUrl(
                (string)history.url, (int)history.userId, (double)history.im_score, (int)history.time_on_tab, (int)history.audible_pings);

            return Ok(new { id = history_id });
        }

        /// <summary>
        /// Returns categorized URL history for the user.
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <returns></returns>
        [Route("user/home")]
        [HttpGet]
        public IHttpActionResult DEMO_CalcCategorizedHistory_All(
            long user_id, string hash)
        {
            if (!UserHash.Ok(user_id, hash)) return Unauthorized();
            var data = mm_svc.UrlClassifier.TmpDemo_ClassifyAllUserHistory(user_id);

            return Ok( new {

                topics = data.topics,
                  urls = data.urls.Select(p => new {
                    suggestions_for_url = p.suggestions,//.Select(p2 => new { suggested_term = p2.term_name, S = p2.S }),
                                     id = p.url.id,
                                   href = p.url.url1,
                                    img = p.url.img_url,
                                  title = p.url.meta_title,
                                hit_utc = p.hit_utc,
                               im_score = p.im_score,
                            time_on_tab = p.time_on_tab
                    })

            //    data = data
            //    .Select(p => new {
            //        chain = p.Select(p2 => new {
            //                    topic_name = p2.term.name,
            //                 //mmtopic_level = p2.mmtopic_level,
            //                 // topic_S_norm = p2.topic_S_norm,
            //                          urls = p2.urls.Select(p3 => new {
            //                                                    url = new {
            //                                                        url_href = p3.url.url1,
            //                                                         url_img = p3.url.img_url,
            //                                                      meta_title = p3.url.meta_title },

            //                                    suggestions_for_url = p3.suggestions.OrderByDescending(p4 => p4.S).Select(p4 => new {
            //                                                 suggestion_name = p4.term.name,
            //                                                        is_topic = p4.term.IS_TOPIC,
            //                                                    wiki_nscount = p4.term.wiki_nscount }),
            //                          }),
            //}) })

            });
        }
    }
}