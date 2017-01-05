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

            Uri uri = new Uri(url);

            return uri.Host;    
        }
    }
}
