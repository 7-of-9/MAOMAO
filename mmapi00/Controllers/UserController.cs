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
        /// Register new internal test user, or return existing test user.
        /// </summary>
        /// <returns></returns>
        [Route("user/test")]
        [HttpPost]
        public IHttpActionResult CreateUserTest()
        {
            var db_user = mm_svc.UserRegister.CreateNewTestUser();

            return Ok(new { id = db_user.id, email = db_user.email,
                            firstname = db_user.firstname, lastname = db_user.lastname,
                            nav_id = db_user.email,
                            new_user = true,
            });
        }

        /// <summary>
        /// Register new user by google, or return existing google user.
        /// </summary>
        /// <returns></returns>
        [Route("user/google")]
        [HttpPost]
        public IHttpActionResult CreateUserGoogle([FromBody]user user)
        {
            if (user == null) return BadRequest("bad user input");
            var db_user = mm_svc.UserRegister.CreateGoogleUserIfNotExist(user.firstname, user.lastname, user.email, user.gender, user.avatar, user.google_user_id, out bool new_user);

            return Ok(new { id = db_user.id, email = db_user.email, google_user_id = user.google_user_id, fb_user_id = user.fb_user_id,
                            firstname = db_user.firstname, lastname = db_user.lastname,
                            nav_id  = db_user.firstname.Replace(" ", "") + db_user.lastname.Replace(" ", ""),
                            new_user = new_user
            });
        }

        /// <summary>
        /// Register new user by FB, or return existing FB user.
        /// </summary>
        /// <returns></returns>
        [Route("user/fb")]
        [HttpPost]
        public IHttpActionResult CreateUserFb([FromBody]user user)
        {
            if (user == null) return BadRequest("bad user input");
            var db_user = mm_svc.UserRegister.CreateFacebookUserIfNotExist(user.firstname, user.lastname, user.email, user.gender, user.avatar, user.fb_user_id, out bool new_user);

            return Ok(new { id = db_user.id, email = db_user.email, google_user_id = user.google_user_id, fb_user_id = user.fb_user_id,
                            firstname = db_user.firstname, lastname = db_user.lastname,
                            nav_id = db_user.firstname.Replace(" ", "") + db_user.lastname.Replace(" ", ""),
                            new_user = new_user
            });
        }

        /// <summary>
        /// Links FB or Goog ID to user's account
        /// </summary>
        /// <param name="user_id"></param>
        /// <param name="hash"></param>
        /// <param name="account">JSON object</param>
        /// <returns></returns>
        [Route("user/link")]
        [HttpPost]
        public IHttpActionResult PostUserLinkAccount(
            int user_id, string hash,
            [FromBody]user account)
        {
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            if (account == null) return BadRequest("bad linked account");
            if (account.google_user_id == null && account.fb_user_id == null) return BadRequest("missing google_user_id or fb_user_id");

            var db_user = mm_svc.UserRegister.LinkAccount(user_id, (string)account.google_user_id, (string)account.fb_user_id);

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
            if (!UserAuth.Ok(user_id, hash)) return Unauthorized();
            if (history == null) return BadRequest("bad user_history");
            if (history.url == null) return BadRequest("missing url");
            if (history.document_head_hash == null) return BadRequest("missing document_head_hash");
            //if (history.userId == null) return BadRequest("missing user id");
            //if (history.userId != user_id) throw new ArgumentException("user_id mismatch");

            var history_id = mm_svc.UserHistory.TrackUrl(
                (string)history.url, (string)history.document_head_hash, user_id, (double)history.im_score, (int)history.time_on_tab, (int)history.audible_pings);

            return Ok(new { id = history_id });
        }

    }
}