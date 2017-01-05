
using System.Web.Http;
using WebApi.OutputCache.V2;

namespace mmapi00
{
    public static class CacheApiControllerExtensions
    {
        public static void RemoveCacheVariants(this ApiController controller, string cacheKeyStart)
        {
            // despite its name, this fn. does *not* remove entries "starting with" the string; it requires an exact match.
            var cache = controller.Configuration.CacheOutputConfiguration().GetCacheOutputProvider(controller.Request);
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8:response-ct");
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8:response-etag");
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8");
        }
    }
}