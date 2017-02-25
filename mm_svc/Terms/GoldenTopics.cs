using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.GoldenPaths;

namespace mm_svc.Terms
{
    public static class GoldenTopics
    {
        [DebuggerDisplay("{t.name} S={S} S_norm={S_norm}")]
        public class TopicWeighted {
            public term t;
            public double S;
            public double S_norm;
        }

        public static List<TopicWeighted> GetTopics(List<List<TermPath>> root_paths)    
        {
            // expects: all paths to root to be for the same leaf term!
            var distinct_leaf_terms = root_paths.Select(p => p.First().t.id);
            if (distinct_leaf_terms.Distinct().Count() > 1) throw new ApplicationException("more than one leaf term in root_paths");

            // pick out topics from each path, save distance from leaf
            var topics = root_paths.SelectMany(p => p.Where(p2 => p2.t.IS_TOPIC).Select(p2 => new {
                tp = p2,
                t = p2.t,
                gl = p2.gl, // lower is closer to root
                gl_norm = p2.gl_norm,
                gl_inv = p2.gl_inv, // lower is closer to leaf
            })).ToList();

            // count by name
            var topic_name_counts = topics.GroupBy(p => p.t.name)
                                          .Select(p => new { term_name = p.Key, count = p.Count() })
                                          .OrderByDescending(p => p.count).ToList();

            // topics scored by count and golden level
            var topics_scored = topics.Select(p => new {
                tp = p.tp,
                t = p.t,
              //ns = p.t.wiki_nscount,
                gl = p.gl,
                gl_norm = p.gl_norm,
                gl_inv = p.gl_inv,
                count = topic_name_counts.Single(p2 => p2.term_name == p.t.name).count,

                S = (1 / (Math.Pow(p.gl_inv, 2))
                    * Math.Pow(p.t.wiki_nscount ?? 0, (1/3))
                    * Math.Pow(topic_name_counts.Single(p2 => p2.term_name == p.t.name).count, (1)),

            }).OrderByDescending(p => p.S).ToList();

            // flatten 
            var ret = topic_name_counts.Select(p => p.term_name).Select(p => new TopicWeighted() {
                t = topics_scored.First(p2 => p2.t.name == p).t,
                S = topics_scored.Where(p2 => p2.t.name == p).Average(p2 => p2.S)
            }).OrderByDescending(p => p.S).ToList();

            ret.ForEach(p => p.S_norm = p.S / ret.Max(p2 => p2.S));
            return ret;
        }
    }
}
