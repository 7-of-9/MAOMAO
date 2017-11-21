using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.OutputCache.Core.Cache;
using WebApi.OutputCache.V2;

namespace mmapi00
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.MapHttpAttributeRoutes();

            // CORS enable -- http://stackoverflow.com/questions/29024313/asp-net-webapi2-enable-cors-not-working-with-aspnet-webapi-cors-5-2-3
            EnableCrossSiteRequests(config);

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            // setup memory cache provider 
            var cacheConfig = config.CacheOutputConfiguration();
            cacheConfig.RegisterCacheOutputProvider(() => new MemoryCacheDefault());

            config.Filters.Add(new AiExceptionFilterAttribute());
        }

        private static void EnableCrossSiteRequests(HttpConfiguration config)
        {
            var cors = new EnableCorsAttribute(
                origins: "*",
                headers: "*",
                methods: "*");
            config.EnableCors(cors);
        }
    }
}
