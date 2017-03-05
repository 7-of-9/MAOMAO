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
        public class ParentTerm { public string info; }

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

        public static void GetTopicsAndSuggestions(long url_id, out List<UrlInfo.ParentTerm> ret_topics, out List<UrlInfo.ParentTerm> ret_suggested)
        {
            using (var db = mm02Entities.Create()) {
                var parents = db.url_parent_term.AsNoTracking().Include("term").Where(p => p.url_id == url_id).ToListNoLock();
                var topics = parents.Where(p => p.found_topic).ToList();
                ret_topics = topics.Select(p2 => new UrlInfo.ParentTerm() { info = $"{p2.term} *TL={p2.mmtopic_level} avg_TSS_leaf={p2.avg_TSS_leaf} (min_d={p2.min_d_paths_to_root_url_terms} max_d={p2.max_d_paths_to_root_url_terms} perc_ptr_topics={(p2.perc_ptr_topics * 100).ToString("0.00")}%) --> S={p2.S?.ToString("0.00000")} S_norm={p2.S_norm?.ToString("0.00")} avg_S={p2.avg_S?.ToString("0.0000")}" }).ToList();
                ret_suggested = parents.Where(p => p.suggested_dynamic && !topics.Select(p2 => p2.id).Contains(p.id)).ToList().Select(p2 => new UrlInfo.ParentTerm() { info = $"{p2.term} -> S={p2.S?.ToString("0.00000")}" }).ToList();
            }
        }
    }
}
