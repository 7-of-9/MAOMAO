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

namespace mmapi00.Controllers
{
    public class UserController : ApiController
    {
        /// <summary>
        /// Register new user by google
        /// </summary>
        /// <returns></returns>
        [Route("api/users/google")]
        [HttpPost]
        public IHttpActionResult CreateUser([FromBody]user user)
        {
            if (user == null) return BadRequest("bad user input");
            var db_user = mm_svc.User.Register.CreateGoogleUserIfNotExist(user.firstname, user.lastname, user.email, user.gender, user.google_user_id);

            return Ok(new { id = db_user.id, email = db_user.email });
        }

        /// <summary>
        /// Returns categorized URL history for the user.
        /// </summary>
        /// <param name="user_id"></param>
        /// <returns></returns>
        [Route("api/users/tmp_demo_history_calc")]
        [HttpGet]
        public IHttpActionResult DEMO_CalcCategorizedHistory_All(long user_id)
        {
            var data = mm_svc.UrlClassifier.TmpDemo_ClassifyAllUserHistory(user_id);

            return Ok( new {
                data = data.Select(p => p.Select(p2 => new {
                    topic_name = p2.term.name, 
                 mmtopic_level = p2.mmtopic_level,
                  topic_S_norm = p2.topic_S_norm,
                          urls = p2.urls.Select(p3 => new {
                              suggestions_for_url = p3.suggestions.OrderByDescending(p4 => p4.S).Select(p4 => new {
                                                            term_name = p4.term.name,
                                                             is_topic = p4.term.IS_TOPIC,
                                                         wiki_nscount = p4.term.wiki_nscount }),
                                              url = new {
                                                    url = p3.url.url1,
                                                url_img = p3.url.img_url,
                                             meta_title = p3.url.meta_title }
                    }),
                }))
            });
        }
    }
}