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
    }
}