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
        public class UrlParent {
            public string term_name;
            public bool is_topic;
            public string dbg_info;
            public double S;
        }

        public static url GetUrl(string url)
        {
            using (var db = mm02Entities.Create()) {
                var db_url = db.urls.Where(p => p.url1 == url).FirstOrDefaultNoLock();
                if (db_url != null) {
                    g.LogLine($"returning URL DB info for url_id={db_url.id}, calais_as_of_utc={db_url.calais_as_of_utc}");
                    return db_url;
                }
                return null;
            }
        }

        public static void GetFilteredTopicsAndSuggestions(long url_id,
            out List<UrlInfo.UrlParent> ret_topics,
            out List<UrlInfo.UrlParent> ret_suggested,
            out UrlInfo.UrlParent ret_tld_title_term
            )
        {
            using (var db = mm02Entities.Create()) {
                var parents = db.url_parent_term.AsNoTracking().Include("term").Where(p => p.url_id == url_id).ToListNoLock();

                // topics: take top 3 max by S desc
                var topics = parents.Where(p => p.found_topic).OrderByDescending(p => p.S).Take(3).ToList();

                // suggested: take top 3 max by S desc
                var suggested = parents.Where(p => p.suggested_dynamic).OrderByDescending(p => p.S).Take(3).ToList();

                // TLD title term: take single
                var tld_title_term = parents.Where(p => p.url_title_topic).FirstOrDefault();

                ret_topics = topics.Select(p2 => new UrlInfo.UrlParent() {
                   term_name = p2.term.name,
                           S = p2.S ?? 0,
                    is_topic = p2.term.IS_TOPIC,
                    dbg_info = $"{p2.term} *TL={p2.mmtopic_level} avg_TSS_leaf={p2.avg_TSS_leaf} (min_d={p2.min_d_paths_to_root_url_terms} max_d={p2.max_d_paths_to_root_url_terms} perc_ptr_topics={(p2.perc_ptr_topics * 100).ToString("0.00")}%) --> S={p2.S?.ToString("0.00000")} S_norm={p2.S_norm?.ToString("0.00")} avg_S={p2.avg_S?.ToString("0.0000")}"
                }).ToList();

               ret_suggested = suggested.ToList().Select(p2 => new UrlInfo.UrlParent() {
                   term_name = p2.term.name,
                           S = p2.S ?? 0,
                    is_topic = p2.term.IS_TOPIC,
                    dbg_info = $"{p2.term} -> S={p2.S?.ToString("0.00000")}"
                }).ToList();

                ret_tld_title_term = new UrlInfo.UrlParent() {
                   term_name = tld_title_term?.term.name,
                    is_topic = false,
                           S = 1.0,
                    dbg_info = "",
                };
            }
        }
    }
}
