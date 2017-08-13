using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_global
{
    public static partial class Util
    {
        public static string GetTldFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return null;

            // if no schema specified, assume http://
            if (!url.Contains(":"))
                url = "http://" + url;

            Uri uri = null;
            try {
                uri = new Uri(url);
            } catch (Exception ex) {
                g.LogError($"{ex.Message} - url={url}");
            }

            return uri.Host;    
        }

        public static string RemoveHashFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url)) return null;

            if (url.Contains("#"))
                return url.Substring(0, url.IndexOf("#"));
            else
                return url;
        }
    }
}
