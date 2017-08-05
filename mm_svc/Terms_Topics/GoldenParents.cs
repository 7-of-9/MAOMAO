using mm_global;
using mm_global.Extensions;
using mm_svc.InternalNlp.Utils;
using mmdb_model;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.GoldenPaths;

namespace mm_svc.Terms
{
    public static class GoldenParents
    {
        private static ConcurrentDictionary<long, List<gt_parent>> stored_parents_cache = new ConcurrentDictionary<long, List<gt_parent>>();
        public static bool use_stored_parents_cache = false;

        public static List<gt_parent> GetStoredParents(long term_id)
        {
            if (use_stored_parents_cache && stored_parents_cache.ContainsKey(term_id))
                return stored_parents_cache[term_id];

            using (var db = mm02Entities.Create()) {
                var ret =  db.gt_parent.AsNoTracking().Include("term").Include("term1")
                             .Where(p => p.child_term_id == term_id).OrderByDescending(p => p.S_norm).ToListNoLock()
                             .DistinctBy(p => p.parent_term_id.ToString() + p.is_topic) // could have concurrent writes to gt_parent table
                             .ToList();

                if (use_stored_parents_cache)
                    stored_parents_cache.AddOrUpdate(term_id, ret, (key, oldValue) => ret);

                return ret;
            }
        }

        //
        // If not already done, records results of ProcessPathsToRoot() in gt_parent table
        //
        public static List<gt_parent> GetOrProcessParents_SuggestedAndTopics(long term_id, bool reprocess = false)
        {
            using (var db = mm02Entities.Create()) {
                // if already stored, nop
                if (db.gt_parent.Any(p => p.child_term_id == term_id) && reprocess == false)
                    return GetStoredParents(term_id);

                // get term & root paths
                var term = db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p => p.id == term_id);
                var paths = GoldenPaths.GetOrProcessPathsToRoot(term.id); //GoldenPaths.GetStoredPathsToRoot(term);

                // static - pick out editorially defined topics from paths to root
                var suggested_topics = GoldenTopics.GetTopics(paths);

                // dynamic - parent suggestion (namespace, level weighted, group/count ranking)
                var suggested_dynamic = CalcDynamicSuggestedParents(paths);

                // remove -- have seen deadlocks here when running parallel
                //g.RetryMaxOrThrow(() => {
                //    db.gt_parent.RemoveRange(db.gt_parent.Where(p => p.child_term_id == term_id));
                //    return db.SaveChangesTraceValidationErrors();
                //}, 1, 3);
                db.Database.ExecuteSqlCommand("DELETE FROM [gt_parent] WHERE [child_term_id]={0}", term_id);

                // add
                var gt_parents = new List<gt_parent>();

                if (suggested_dynamic != null)
                    suggested_dynamic.ForEach(p => gt_parents.Add(new gt_parent() { child_term_id = term_id, parent_term_id = p.t.id, S_norm = p.S_norm, S = p.S }));

                if (suggested_topics != null)
                    suggested_topics.ForEach(p => gt_parents.Add(new gt_parent() { child_term_id = term_id, parent_term_id = p.t.id, S_norm = p.S_norm, S = p.S, is_topic = true }));

                //db.gt_parent.AddRange(gt_parents);
                //db.SaveChangesTraceValidationErrors();
                mmdb_model.Extensions.BulkCopy.BulkInsert(db.Database.Connection as SqlConnection, "gt_parent", gt_parents);

                //g.LogLine($"term_id={term_id} term={term.name} suggested_dynamic={string.Join(",", suggested_dynamic.Select(p => p.t.name))}");
                //g.LogLine($"term_id={term_id} term={term.name} suggested_topics={string.Join(",", suggested_topics.Select(p => p.t.name))}");
                return GetStoredParents(term_id);
            }
        }

        //
        // Process paths to root - finds one or more suggested parent/related topics for the supplied leaf term paths to root.
        //
        private static List<string> ProcessPathsToRoot_ExcludePathsWith_Exact = new List<string>() {
            //"People",
            "Years", };
        private static List<string> ProcessPathsToRoot_ExcludePathsWith_Contains = new List<string>() {
            //"People by", " people"
        };
        public static List<TermGroup> CalcDynamicSuggestedParents(List<List<TermPath>> root_paths)
        {
            if (root_paths == null || root_paths.Count == 0) return null;

            // expects: all paths to root to be for the same leaf term!
            var distinct_leaf_terms = root_paths.Select(p => p.FirstOrDefault()?.t.id).Where(p => p != null);
            if (distinct_leaf_terms.Distinct().Count() > 1) throw new ApplicationException("more than one leaf term in root_paths");

            // dbg
            //root_paths.ForEach(p => Debug.WriteLine("(GL=" + p[0].gl + ") " + p[0].t.name + "\t ... " + string.Join(" / ", p.Skip(1).Select(p2 => "(GL=" + p2.gl + ") " + p2.t.name + " (NS_norm=" + p2.t.NS_norm.ToString("0.00") + " NSLW=" + p2.t.NSLW.ToString("0.0") + " #NS=" + p2.t.wiki_nscount + ")"))));

            // remove any paths containing any exclusion terms (different to what ProcessRootPath does - it removes only individual terms from paths)
            root_paths = root_paths.Where(p => !p.Any(p2 => ProcessPathsToRoot_ExcludePathsWith_Exact.Contains(p2.t.name))
                                            && !p.Any(p2 => ProcessPathsToRoot_ExcludePathsWith_Contains.Any(p3 => p2.t.name.Contains(p3)))
                                            ).ToList();

            // removes excluded terms & calculate normalized NS# values for each term in each path
            foreach (var root_path in root_paths)
                ProcessRootPath(root_path);

            if (root_paths.Count == 0) { return null; }

            // dedupe resulting root paths
            var a = root_paths.GroupBy(c => String.Join(",", c.Select(p => p.t.id)));
            var b = a.Select(c => c.First().ToList()).ToList();
            root_paths = b;

            // remove empty paths
            root_paths = root_paths.Where(p => p.Count > 0).ToList();
            if (root_paths.Count == 0)
                return null;

            // ** try 2 (dynamic) -- across all levels; take sum of NSLW for each term - rank by NS level weighted count
            var ret = GroupRankByTerm_Sum_NSLW(root_paths, 4)
                    .DistinctBy(p => p.t.name)          // dedupe ns14/0 
                    .Where(p => p.t.name != "Contents") // noise
                    .ToList();

            return ret.Where(p => p != null && p.t != null 
                            //&& !p.t.IS_TOPIC          // value in letting this algo also work on defined topics - can filter them out after as desired
                             ).ToList();
        }

        // group by term, rank each term by sum of NSLW (wiki namespace count level weighted) scaled by term's original distance from leaf (closer to leaf is better / more relevant)
        [DebuggerDisplay("{t.name} S={S} S_norm={S_norm}")]
        public class TermGroup
        {
            public class StemmedWordInfo
            {
                public string stemmed;
                public int R; // # of repetitions of the stemmed word in all candidate (non-stemmed) term names
                public double R_norm;
                public override string ToString() { return $"{stemmed}:R={R}:R_n={R_norm.ToString("0.0")}"; }
            }
            public term t;
            public List<StemmedWordInfo> word_info;
            public List<int> gl_distances;
            public List<double> NSLWs;
            public double avg_gl_distance, avg_NSLW, sum_NSLW;
            public double S, S_norm;
            public double R_BOOST;
        }
        private static List<string> GroupRank_ExclusionTerms_Exact = new List<string>() { "People", "History", "Society", "Fiction", "Life", "Culture", };
        private static List<string> GroupRank_ExclusionTerms_Contains = new List<string>() { " in ", " of ", " (company)", "fictional ", " by " };
        private static List<TermGroup> GroupRankByTerm_Sum_NSLW(List<List<TermPath>> root_paths, int levels_to_use)
        {
            // group
            var terms_grouped_NSLW_sum = new Dictionary<TermPath, double>(); // term, sum(NSLW) 
            var grouped_terms = new List<TermGroup>();
            foreach (var path in root_paths) {
                foreach (var term in path.Skip(1).Take(levels_to_use)) { // cap levels_to_use deep -- increasingly irrelevant as we go deeper
                    var term_group = grouped_terms.Where(p => p.t.id == term.t.id).SingleOrDefault();
                    var gl_distance = path[0].gl - term.gl;
                    if (term_group == null)
                        grouped_terms.Add(new TermGroup() {
                            t = term.t,
                            NSLWs = new List<double>() { term.t.NSLW },
                            gl_distances = new List<int>() { gl_distance },
                            word_info = new List<TermGroup.StemmedWordInfo>(Words.TokenizeExStopwords(term.t.stemmed).Split(' ').Where(p => !string.IsNullOrEmpty(p)).Select(p => new TermGroup.StemmedWordInfo() { stemmed = p }))
                        });
                    else {
                        term_group.NSLWs.Add(term.t.NSLW);
                        term_group.gl_distances.Add(gl_distance);
                    }
                }
            }

            // rank components
            grouped_terms.ForEach(p => p.avg_gl_distance = Math.Max(p.gl_distances.Average(), 1.0));
            grouped_terms.ForEach(p => p.avg_NSLW = Math.Max(p.NSLWs.Average(), 0.0));
            grouped_terms.ForEach(p => p.sum_NSLW = p.NSLWs.Sum());

            // final exclusions
            grouped_terms = grouped_terms.Except(grouped_terms.Where(p => GroupRank_ExclusionTerms_Exact.Contains(p.t.name))).ToList();
            grouped_terms = grouped_terms.Except(grouped_terms.Where(p => GroupRank_ExclusionTerms_Contains.Any(p2 => p.t.name.ltrim().Contains(p2.ltrim())))).ToList();

            // ** RANK **
            //grouped_terms.ForEach(p => p.S = p.sum_NSLW / Math.Pow(p.avg_gl_distance, 2)); // naive - sum of NSLWs / inverse square distance
            //grouped_terms.ForEach(p => p.S = p.avg_NSLW / Math.Pow(p.avg_gl_distance, 2)); // avg NSLW (no regard repetitions) / inversely square of distance
            //grouped_terms.ForEach(p => p.S = p.avg_NSLW * Math.Sqrt(p.NSLWs.Count) / Math.Sqrt(p.avg_gl_distance)); // blend -avg NSLW * sqrt repetitions / inverse root of distance
            grouped_terms.ForEach(p => p.S = Math.Pow(p.avg_NSLW, 0.5)             // NS level-weighted
                                           * Math.Pow(p.NSLWs.Count, 0.75)         // repetitions
                                           / Math.Pow(p.avg_gl_distance, 1.1));    // inverse avg distance

            grouped_terms.ForEach(p => p.S_norm = p.S / grouped_terms.Max(p2 => p2.S));

            // cap list for better repeat analaysis -- remove long tail on mega terms
            //grouped_terms.ForEach(p => Trace.WriteLine($"\tS_norm={p.S_norm.ToString("0.00")} [{p.t.stemmed}] [{string.Join(",", p.word_info)}] // {p.t} / S={p.S.ToString("0.00")} avg_NSLW={p.avg_NSLW.ToString("0.00")} (NSLWs={string.Join(",", p.NSLWs.Select(p2 => p2.ToString("0.00")))}) avg_gl_distance={p.avg_gl_distance.ToString("0.0")} (gl_distances={string.Join(",", p.gl_distances)})"));
            const int MAX_TERMS_FOR_REPEAT_ANALYSIS = 20;
            if (grouped_terms.Count > MAX_TERMS_FOR_REPEAT_ANALYSIS) {
                //grouped_terms = grouped_terms.Where(p => p.S_norm > 0.05).ToList(); // better to remove bottom % of list, don't rely on s_norm being well distributed
                grouped_terms = grouped_terms.OrderByDescending(p => p.S_norm).Take(MAX_TERMS_FOR_REPEAT_ANALYSIS).ToList();
            }

            // BOOST (naive stemmed similarity/repetition boosts) - only if there's variance in the repeat count
            //   for each repeated stemmed word; take avg. S of terms that we see it in; boost the term by this avg. S of its repeated cousins...
            grouped_terms.ForEach(p => p.word_info.ForEach(p2 => p2.R = grouped_terms.Count(p3 => p3.t.stemmed.Contains(p2.stemmed))));
            grouped_terms.ForEach(p => p.word_info.ForEach(p2 => p2.R_norm = (double)p2.R / grouped_terms.SelectMany(p3 => p3.word_info.Select(p4 => p4.R)).Max()));
            var R_sd = grouped_terms.SelectMany(p => p.word_info.Select(p2 => (double)p2.R)).StdDev();
            var R_norm_sd = grouped_terms.SelectMany(p => p.word_info.Select(p2 => p2.R_norm)).StdDev();
            const double MIN_BOOST_R_NORM = 0.8;
            if (R_norm_sd > 0.1) {
                grouped_terms.ForEach(p => p.word_info.ForEach(p2 => {
                    if (p2.R_norm > MIN_BOOST_R_NORM) {
                        var avg_S_repeat_cousins = grouped_terms.Where(p3 => p3.t.stemmed.Contains(p2.stemmed)).Average(p3 => p3.S);
                        p.R_BOOST += Math.Sqrt(avg_S_repeat_cousins) * p2.R_norm;
                        p.S += p.R_BOOST;
                    }
                }));
            }

            // S norm - again
            grouped_terms.ForEach(p => p.S_norm = p.S / grouped_terms.Max(p2 => p2.S));

            var leaf = root_paths.First().First();
            var ordered_terms = grouped_terms.Where(p => p.S != 0).OrderByDescending(p => p.S_norm).ToList();

            // dbg
            //Trace.WriteLine($"*** R_norm_sd={R_norm_sd.ToString("0.00")} (GL={root_paths.First().First().gl}) [{leaf.t.stemmed}] // {leaf.t.name} - root_paths.Count={root_paths.Count} - levels_to_use={levels_to_use}");
            //ordered_terms.ForEach(p => Trace.WriteLine($"\t" +
            //    (p.word_info.Any(p2 => p2.R_norm > MIN_BOOST_R_NORM) ? $"** (A(R_n)={p.word_info.Average(p2 => p2.R_norm).ToString("0.00")}) R_BOOST={p.R_BOOST.ToString("0.00")} " : "                              ") +
            //    $"S_norm={p.S_norm.ToString("0.00")} [{p.t.stemmed}] [{string.Join(",", p.word_info)}] // {p.t} / S={p.S.ToString("0.00")} avg_NSLW={p.avg_NSLW.ToString("0.00")} (NSLWs={string.Join(",", p.NSLWs.Select(p2 => p2.ToString("0.00")))}) avg_gl_distance={p.avg_gl_distance.ToString("0.0")} (gl_distances={string.Join(",", p.gl_distances)})"));

            return ordered_terms;
        }

        private static List<string> ProcessRootPath_ExclusionTerms_Exact = new List<string>() { "People", };
        private static List<string> ProcessRootPath_ExclusionTerms_Contains = new List<string>() { "People by", " people", };
        private static bool ProcessRootPath(List<TermPath> root_path)
        {
            if (root_path == null || root_path.Count == 0) return false;

            const int MIN_WIKI_NSCOUNT_TO_INCLUDE = 3;
            const int MIN_WIKI_NSCOUNT_TO_SCORE = 3;
            var leaf_term = root_path[0];

            if (root_path.Any(p => p.t.wiki_nscount == null)) return false;

            // remove terms under min. NS#
            root_path.RemoveAll(p => p.t.wiki_nscount < MIN_WIKI_NSCOUNT_TO_INCLUDE && p.t.id != leaf_term.t.id);

            // remove excluded terms
            root_path.RemoveAll(p => ProcessRootPath_ExclusionTerms_Exact.Contains(p.t.name));
            root_path.RemoveAll(p => ProcessRootPath_ExclusionTerms_Contains.Any(p2 => p.t.name.Contains(p2)));

            // for each path (may or may not be the same leaf term in supplied paths)
            //    for each node: calc NS# normalized relative to other NS# in the path
            //    for each node: calc NS# x (1/level) ("NS_weighted") (& NS_weighted_norm)

            for (int i = 1; i < root_path.Count; i++) {
                var term = root_path[i];
                term.t.NS_norm = (double)term.t.wiki_nscount / root_path.Max(p => (double)p.t.wiki_nscount);

                // ignore under threshold
                if (term.t.wiki_nscount < MIN_WIKI_NSCOUNT_TO_SCORE)
                    term.t.NSLW = 0;
                else
                    term.t.NSLW = (double)(Math.Pow(term.t.wiki_nscount ?? 0, 1.0) * (1.0 / (i * 2)));
            }

            //  normalize
            if (root_path.Count > 0) {
                var max_NSLW = root_path.Max(p => p.t.NSLW);
                root_path.ForEach(p => p.t.NSLW_norm = p.t.NSLW / max_NSLW);
            }

            //var child_term = root_path[0];
            //var sum_NSLW = root_path.Sum(p => p.t.NSLW);
            //Trace.WriteLine(sum_NSLW.ToString("0.0") + " (GL=" + leaf_term.gl + ") " + leaf_term.t.name + " // " +
            //    string.Join(" / ", root_path.Skip(1).Select(p => "(GL=" + p.gl + ") " + p.t.name + " (NS_norm=" + p.t.NS_norm.ToString("0.00") + " NSLW=" + p.t.NSLW.ToString("0.0") + " #NS=" + p.t.wiki_nscount + ")")
            //    ));

            return true;
        }
    }
}
