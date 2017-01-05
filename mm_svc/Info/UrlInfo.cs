using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using mmdb_model;
using mm_global;
using mm_aws;

namespace mm_svc
{
    /// <summary>
    /// Returns NLP info for a URL
    /// </summary>  
    public static class UrlInfo
    {
        public static url GetNlpInfo(string url)
        {
            using (var db = mm02Entities.Create())
            {
                // is known in DB w/ populated calais info?
                var db_url = db.urls.FirstOrDefault(p => p.url1 == url);// && p.calais_as_of_utc != null);
                if (db_url != null) {
                    g.LogLine($"returning URL DB info for url_id={db_url.id}, calais_as_of_utc={db_url.calais_as_of_utc}");
                    return db_url;
                }
                return null;
            }
        }
    }
}
