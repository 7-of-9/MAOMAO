using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UrlAutoFlag
    {
        public static void CalcAutoFlag(List<url_parent_term> parent_terms,
            out int warn_count,
            out double warn_degree,
            out string info)
        {
            warn_count = -1;
            warn_degree = -1000;
            info = null;
            var sb = new StringBuilder();

            var topics = parent_terms.Where(p => p.found_topic == true).OrderBy(p => p.pri).ToList();
            if (topics.Count == 0) {
                warn_degree = -999; // not processed at all
                return;
            }
            var best_topic = topics.First();
            if (best_topic.min_d_paths_to_root_url_terms == 99) {
                warn_degree = -99; // not properly processed
                return;
            }

            double avg_min_d = topics.Average(p => (double)p.min_d_paths_to_root_url_terms);
            double avg_max_d = topics.Average(p => (double)p.max_d_paths_to_root_url_terms);
            double avg_S_weighted = (topics.Sum(p => (p.S ?? 0) * (1.0 / p.pri)) / (double)topics.Count()) * 100;
            double avg_avg_S_weighted = (topics.Sum(p => (p.avg_S ?? 0) * (1.0 / p.pri)) / (double)topics.Count()) * 100;
            var url = parent_terms.First().url;

            // FLAG 1 (Percentage Topics(all terms) < 5 %)
            const double C1 = 0.05;
            var test_1 = best_topic.perc_ptr_topics < C1 ? 1 : 0;
            var degree_1 = (C1 - best_topic.perc_ptr_topics) / C1 * -1;
            sb.AppendLine($"FLAG 1 (Percentage Topics(all terms)): {degree_1.ToString("0.00")}");

            // FLAG 2 (AVG_MIN_D > 4.0)
            const double C2 = 4.0;
            var test_2 = (avg_min_d > C2) ? 1 : 0;
            var degree_2 = (avg_min_d - C2) / C2 * -1;
            sb.AppendLine($"FLAG 2 (AVG_MIN_D > 4.0): {degree_2.ToString("0.00")}");

            // FLAG 3 (AVG_MAX_D > 8.0)
            const double C3 = 8.0;
            var test_3 = (avg_max_d > C3) ? 1 : 0;
            var degree_3 = (avg_max_d - C3) / C3 * -1;
            sb.AppendLine($"FLAG 3 (AVG_MAX_D > 8.0): {degree_3.ToString("0.00")}");

            // FLAG 4 (avg_S_weighted: < 3.0)
            const double C4 = 3.0;
            var test_4 = (avg_S_weighted < C4) ? 1 : 0;
            var degree_4 = (C4 - avg_S_weighted) / avg_S_weighted * -1;
            sb.AppendLine($"FLAG 4 (avg_S_weighted: < 3.0): {degree_4.ToString("0.00")}");

            // FLAG 5 (Best Topic: min_d > 2)
            const double C5 = 2;
            var test_5 = (best_topic.min_d_paths_to_root_url_terms > 2) ? 1 : 0;
            var degree_5 = (best_topic.min_d_paths_to_root_url_terms - C5) / C5 * -1;
            sb.AppendLine($"FLAG 5 (Best Topic: min_d > 2): {degree_5.ToString("0.00")}");

            // FLAG 6 (Count Topics < 3)
            const double C6 = 3;
            var test_6 = (topics.Count < C6) ? 1 : 0;
            var degree_6 = ((C6 - topics.Count) / topics.Count);
            sb.AppendLine($"FLAG 6 (Count Topics < 3): {degree_6.ToString("0.00")}");

            // FLAG 7 (Best Topic: mmtopic_level < 3)
            const double C7 = 3;
            var test_7 = (best_topic.mmtopic_level < C7) ? 1 : 0;
            var degree_7 = ((C7 - best_topic.mmtopic_level) / best_topic.mmtopic_level) * 5 * -1; // 5x warning penalty 
            sb.AppendLine($"FLAG 7 (Best Topic: mmtopic_level < 3): {degree_7.ToString("0.00")}");

            // FLAG 8 (mapped_wiki_terms: Count < 3)
            const double C8 = 3;
            var test_8 = (url.mapped_wiki_terms < C8) ? 1 : 0;
            var degree_8 = ((C8 - url.mapped_wiki_terms) / url.mapped_wiki_terms) * -1;
            sb.AppendLine($"FLAG 8 (mapped_wiki_terms: Count < 3): {degree_8.ToString("0.00")}");

            warn_count = test_1 + test_2 + test_3 + test_4 + test_5 + test_6 + test_7 + test_8;
            warn_degree = degree_1 + degree_2 + degree_3 + degree_4 + degree_5 + degree_6 + degree_7 + degree_8;
            info = sb.ToString();
        }
    }
}
