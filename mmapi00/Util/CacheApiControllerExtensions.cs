
using System.Collections.Generic;
using System.Web.Http;
using WebApi.OutputCache.V2;

namespace mmapi00
{
    public static class CacheApiControllerExtensions
    {
        public static void RemoveCacheKeys_1(this ApiController controller, string cacheKeyStart)
        {
            // despite its name, this fn. does *not* remove entries "starting with" the string; it requires an exact match.
            var cache = controller.Configuration.CacheOutputConfiguration().GetCacheOutputProvider(controller.Request);
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8:response-ct");
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8:response-etag");
            cache.RemoveStartsWith(cacheKeyStart + ":application/json; charset=utf-8");
        }

        public static int RemoveCacheKeys_2(this ApiController controller, string cacheKeyStart)
        {
            // second attempt - seems to work better (?)
            var cache = controller.Configuration.CacheOutputConfiguration().GetCacheOutputProvider(controller.Request);
            var keys_to_clear = new List<string>();
            foreach (var key in cache.AllKeys) {
                if (key.StartsWith(cacheKeyStart))
                    keys_to_clear.Add(key);
            }
            keys_to_clear.ForEach(p => cache.Remove(p));
            return keys_to_clear.Count;
        }
    }
}