using System.Diagnostics;
using System.Web.Http;
using WebApi.OutputCache.V2;
using System.Threading.Tasks;
using System;
using System.Globalization;

namespace mmapi00.Controllers
{
    /// <summary>
    /// Returns top-level info about a URL
    /// </summary>
    public class InfoController : ApiController
    {
        /// <summary>
        /// Returns top-level allowability info for a TLD
        /// </summary>
        /// <param name="tld">TLD on which you would like info</param>
        /// <returns></returns>
        [Route("api/allowable")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 30, ServerTimeSpan = 60 * 60 * 24 * 30)] // 30 seconds / 30 days
        public IHttpActionResult IsAllowable(string tld)
        {
            if (string.IsNullOrEmpty(tld)) return BadRequest("bad tld");

            // TODO:
            // {"Message":"An error has occurred.","ExceptionMessage":
            // "Cannot insert duplicate key row in object 'dbo.awis_site' with unique index 'IX_awis_site_tld'. The duplicate key value is (www.ocbc.com).\r\n
            // The statement has been terminated.","ExceptionType":"System.Data.SqlClient.SqlException","StackTrace":"   at mm_global.Global.HandleOptimisticConcurrencyExceptions(DbContext db, Exception ex, Int32 level) in Y:\\src\\fs\\global\\global.cs:line 307\r\n   at mm_global.Global.HandleOptimisticConcurrencyExceptions(DbContext db, Exception ex, Int32 level) in Y:\\src\\fs\\global\\global.cs:line 303\r\n   
            // at mm_global.Global.HandleOptimisticConcurrencyExceptions(DbContext db, Exception ex, Int32 level) in Y:\\src\\fs\\global\\global.cs:line 303\r\n   at mmdb_model.dbContextExtensions.SaveChangesTraceValidationErrors(DbContext db) in Y:\\src\\fs\\mmdb_model\\Extensions\\DbContext.cs:line 30\r\n   at mm_svc.SiteInfo.GetOrQueryAwis(String site_tld_or_url, Boolean& returned_from_db) in Y:\\src\\fs\\mm_svc\\Sites\\SiteInfo.cs:line 86\r\n   at mmapi00.Controllers.InfoController.IsAllowable(String tld) in Y:\\src\\fs\\mmapi00\\Controllers\\InfoController.cs:line 51\r\n   at lambda_method(Closure , Object , Object[] )\r\n   at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ActionExecutor.<>c__DisplayClass10.<GetExecutor>b__9(Object instance, Object[] methodParameters)\r\n   at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ActionExecutor.Execute(Object instance, Object[] arguments)\r\n   at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ExecuteAsync(HttpControllerContext controllerContext, IDictionary`2 arguments, CancellationToken cancellationToken)\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ApiControllerActionInvoker.<InvokeActionAsyncCore>d__0.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Filters.ActionFilterAttribute.<CallOnActionExecutedAsync>d__5.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Web.Http.Filters.ActionFilterAttribute.<CallOnActionExecutedAsync>d__5.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Filters.ActionFilterAttribute.<ExecuteActionFilterAsyncCore>d__0.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ActionFilterResult.<ExecuteAsync>d__2.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ExceptionFilterResult.<ExecuteAsync>d__0.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Web.Http.Controllers.ExceptionFilterResult.<ExecuteAsync>d__0.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess(Task task)\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Dispatcher.HttpControllerDispatcher.<SendAsync>d__1.MoveNext()"}
            bool returned_from_db;
            var awis_site = mm_svc.SiteInfo.GetOrQueryAwis(tld, out returned_from_db);
            if (awis_site == null)
                return Ok(new { allowable = false });

            // blacklisted (not allowable) or not?
            bool allowable = mm_svc.SiteInfo.IsSiteAllowable(awis_site);

            // ret
            return Ok(new {
                allowable = allowable,
              //returned_from_db = returned_from_db,
                as_of = awis_site.as_of_utc,
                awis_cat = /*allowable &&*/ awis_site.awis_cat != null ? awis_site.awis_cat.abs_path : null,
                tld = tld
            });
        }

       
        /// <summary>
        /// Returns NLP info (if known) and overall known state for a URL
        /// </summary>
        /// <param name="url">URL on which you would like NLP and known info</param>
        /// <returns></returns>
        [Route("api/url_nlpinfo")]
        [HttpGet]
        [CacheOutput(ClientTimeSpan = 0, ServerTimeSpan = 60 * 60 * 24 * 30)] // 30 days
        public IHttpActionResult GetNlpInfo(string url)
        {
            if (string.IsNullOrEmpty(url)) return BadRequest("bad url");

            var db_url = mm_svc.UrlInfo.GetNlpInfo(url);

            return Ok( new { is_known = db_url != null,
                      has_calais_info = db_url != null && db_url.calais_as_of_utc != null,
                                  url = url });
        }

        /// <summary>
        /// Stores Calais NLP info for a URL
        /// </summary>
        /// <param name="nlp_info">JSON of Calais NLP info.</param>
        /// <returns></returns>
        [Route("api/url_nlpinfo_calais")]
        [HttpPut]
      //[InvalidateCacheOutput("GetNlpInfo")] // really not ideal; invalidates the cache for all URL params!!
        public IHttpActionResult PutNlpInfoCalais([FromBody]dynamic nlp_info)
        {
            //g.LogLine(System.Web.Helpers.Json.Encode(nlp_info));

            Stopwatch sw = new Stopwatch(); sw.Start();
            if (nlp_info == null) return BadRequest("bad nlp_info");

            int new_terms = -1, new_pairs = -1;
            Task.Factory.StartNew(() => {
                // process terms & pairs
                mm_svc.CalaisNlp.ProcessResult(nlp_info, out new_terms, out new_pairs);

                // decache GetNlpInfo() for this url 
                string url = nlp_info.url.href.ToString();
                var cacheKey = Configuration.CacheOutputConfiguration().MakeBaseCachekey((InfoController t) => t.GetNlpInfo(null));
                this.RemoveCacheVariants(cacheKey + "-url=" + url);
            });


            // TODO: link URL to NLP terms so we don't keep hitting it!

            // NOW CAN? -- use occurs_count on terms to infer term adjacency hiearchy ?
            // TODO?: post-process NLP wrt/ metadata etc, to match .js ?

            return Ok(new { url = nlp_info.url.href,
                      new_terms = new_terms,
                      new_pairs = new_pairs,
                             ms = sw.ElapsedMilliseconds });
        }

        /// <summary>
        /// Stores user history
        /// </summary>
        /// <param name="history">JSON of user history.</param>
        /// <returns></returns>
        [Route("api/url_history")]
        [HttpPost]
        public IHttpActionResult PostUserHistory([FromBody]dynamic history)
        {
            if (history == null) return BadRequest("bad user_history");
            if (history.url == null) return BadRequest("missing url");
            if (history.userId == null) return BadRequest("missing user id");

            var history_id = mm_svc.User.UserHistory.TrackingByUrl(
                (string)history.url, (int)history.userId, (double)history.im_score, (int)history.time_on_tab, (int)history.audible_pings);

            return Ok( new { id = history_id });
        }
    }
}
