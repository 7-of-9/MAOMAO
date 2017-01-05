using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Filters;
using mm_global;

namespace mmapi00
{
    public class AiExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            if (actionExecutedContext != null && actionExecutedContext.Exception != null)
            {  
                g.tel_client.TrackException(actionExecutedContext.Exception);
            }
            base.OnException(actionExecutedContext);
        }
    }
}