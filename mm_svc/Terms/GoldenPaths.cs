using mmdb_model;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Terms
{
    public static class GoldenPaths
    {
        //
        // Parses stored paths to root to List<List<term>>
        //
        public static List<List<term>> ParseStoredPathsToRoot(term term) // expects populated gt_path (paths_to_root == gt_path_to_root1)
        {
            var path_data = term.paths_to_root.ToList();
            var paths = new List<List<term>>();
            var path_nos = path_data.Select(p => p.path_no).Distinct();
            foreach(var path_no in path_nos) {
                var path = new List<term>() { term };
                foreach (var seq_term in path_data.Where(p => p.path_no == path_no).OrderBy(p => p.seq).Select(p => p.term)) {
                    path.Add(seq_term);
                }
                paths.Add(path);
            }
            return paths;
        }

        //
        // Process paths to root - finds one or more suggested parent category hierarchies (parent chains) for the supplied leaf term paths to root.
        //
        // (1) looking for maximum (n=2) parent cats in a given parent chain.
        // 
        // (1.1) using NS_weighted_norm over threshold as trigger for parent category candidate.
        //
        // (2) can be multiple parent chains, e.g. (1) Superheroes // ... Science fiction #NS=9 
        //                                         (2) Superheroes // ... Heroes #NS=9
        //
        // (3) exclusions -- hard code for now? e.g. People #NS=11 -- stop looking up root path if we hit an excluded term
        // 
        //

        private static List<string> ProcessPathsToRoot_ExcludePathsWith_Exact = new List<string>() { "People", "Years", };
        private static List<string> ProcessPathsToRoot_ExcludePathsWith_Contains = new List<string>() { "People by", " people", };// " by ",  };
        public static void ProcessPathsToRoot(List<List<term>> root_paths)
        {
            // expects: all paths to root to be for the same leaf term!
            var distinct_leaf_terms = root_paths.Select(p => p.First().id);
            if (distinct_leaf_terms.Distinct().Count() > 1) throw new ApplicationException("more than one leaf term in root_paths");

            // remove any paths containing any exclusion terms (different to what ProcessRootPath does - it removes only individual terms from paths)
            root_paths = root_paths.Where(p => !p.Any(p2 => ProcessPathsToRoot_ExcludePathsWith_Exact.Contains(p2.name))
                                            && !p.Any(p2 => ProcessPathsToRoot_ExcludePathsWith_Contains.Any(p3 => p2.name.Contains(p3)))
                                            ).ToList();

            // removes excluded terms & calculate normalized NS# values for each term in each path
            foreach (var root_path in root_paths)
                ProcessRootPath(root_path);

            if (root_paths.Count == 0) { return; } 

            // dedupe resulting root paths
            var a = root_paths.GroupBy(c => String.Join(",", c.Select(p => p.id)));
            var b = a.Select(c => c.First().ToList()).ToList();
            root_paths = b;

            // for each distinct level in the multiple paths to root, see which root path has high NS_norms
            var max_levels = Math.Min(root_paths.Max(p => p.Count), 3); // don't look beyond level n
            for (var level = 1; level < max_levels; level++) {
                var high_ns_norm_paths = new List<List<term>>();
                foreach (var path in root_paths) {
                    if (path.Count <= level) continue;
                    if (path[level].NS_norm > 0.3) { high_ns_norm_paths.Add(path); }
                }

                // dbg
                //Trace.WriteLine($"L={level} High NS_norm (>0.3) Paths: ");
                //foreach(var high_ns_norm_path in high_ns_norm_paths.OrderByDescending(p => p.Skip(level).First().NS_norm)) 
                //    Trace.WriteLine(high_ns_norm_path[0].name + "\t ... " + string.Join(" / ", high_ns_norm_path.Skip(level).Select(p => p.name + " (NS_norm=" + p.NS_norm.ToString("0.00") + " NSLW=" + p.NSLW.ToString("0.0") + " #NS=" + p.wiki_nscount + ")")));

                //// try 1 
                //{
                //    // take all paths with high NS normalized term at this level;
                //    // group & count all such high NS norm terms;
                //    var terms_grouped = new Dictionary<term, double>(); // term, count (and then score)
                //    foreach (var high_ns_norm_path in high_ns_norm_paths) {
                //        var term = high_ns_norm_path.Skip(level).First();
                //        if (terms_grouped.Keys.Any(p => p.id == term.id))
                //            terms_grouped[terms_grouped.Keys.Single(p => p.id == term.id)]++;
                //        else
                //            terms_grouped.Add(term, 1);
                //    }
                //    // score each such term by function of count and #NS absolute
                //    var terms = terms_grouped.Keys.ToList();
                //    foreach (var key in terms)
                //        /*score*/
                //        terms_grouped[key] = Math.Pow((double)terms_grouped[key]/*count*/, (1.0 / 2.5)) * (double)key.wiki_nscount;

                //    var ordered_terms = terms_grouped.ToList();
                //    ordered_terms.Sort((p1, p2) => p2.Value.CompareTo(p1.Value));
                //    //Debug.Write(ordered_terms.Count());
                //}
            }

            // try 2 -- across all levels; take sum of NSLW for each term - rank by
            // close! for nasdaq anyway -- maybe use this when lots of paths?
            {
                //
                // TODO: decide on 1 or 2; maybe function of root_paths count?
                //       see if any more exclusion terms would be useful...
                // move to wowmao for this.
                //
                GroupByTerm_Sum_NSLW(root_paths, 1);  
                GroupByTerm_Sum_NSLW(root_paths, 2);
                GroupByTerm_Sum_NSLW(root_paths, 4);
            }
        }

        private static List<KeyValuePair<term, double>> GroupByTerm_Sum_NSLW(List<List<term>> root_paths, int levels_to_use)
        {
            var terms_grouped = new Dictionary<term, double>(); // term, sum(NSLW)
            foreach (var path in root_paths) {
                // for mega-terms (e.g. "sept 11" ~ 100 paths) restricting to 1 level works slightly better than 2...
                // balley: paths = 17  2 levels works well
                // gundam: paths = 50 ! -- 2 levels works well - 1 works bit better
                foreach (var term in path.Skip(1).Take(levels_to_use)) { // cap levels_to_use deep -- increasingly irrelevant as we go deeper
                    if (terms_grouped.Keys.Any(p => p.id == term.id))
                        terms_grouped[terms_grouped.Keys.Single(p => p.id == term.id)] += term.NSLW;
                    else
                        terms_grouped.Add(term, term.NSLW);
                }
            }
            var ordered_terms = terms_grouped.ToList();
            ordered_terms.Sort((p1, p2) => p2.Value.CompareTo(p1.Value));

            Trace.WriteLine($"{root_paths.First().First().name} root_paths.Count={root_paths.Count} - levels_to_use={levels_to_use}");
            ordered_terms.ForEach(p => Trace.WriteLine($"\t{p.Key} S={p.Value}"));

            return ordered_terms;
        }

        private static List<string> ProcessRootPath_ExclusionTerms_Exact = new List<string>() { "People", };
        private static List<string> ProcessRootPath_ExclusionTerms_Contains = new List<string>() { "People by", " people", };
        public static bool ProcessRootPath(List<term> root_path)
        {
            const int MIN_WIKI_NSCOUNT = 4;
            var leaf_term = root_path[0];

            if (root_path.Any(p => p.wiki_nscount == null)) return false;

            // remove terms under min. NS#
            root_path.RemoveAll(p => p.wiki_nscount < MIN_WIKI_NSCOUNT && p.id != leaf_term.id);

            // remove excluded terms
            root_path.RemoveAll(p => ProcessRootPath_ExclusionTerms_Exact.Contains(p.name));
            root_path.RemoveAll(p => ProcessRootPath_ExclusionTerms_Contains.Any(p2 => p.name.Contains(p2)));

            // for each path (may or may not be the same leaf term in supplied paths)
            //    for each node: calc NS# normalized relative to other NS# in the path
            //    for each node: calc NS# x (1/level) ("NS_weighted") (& NS_weighted_norm)

            for (int i = 1; i < root_path.Count; i++) {
                var term = root_path[i];
                term.NS_norm = (double)term.wiki_nscount / root_path.Max(p => (double)p.wiki_nscount);
                term.NSLW = (double)term.wiki_nscount * (1.0 / (i*2));
            }
            root_path.ForEach(p => p.NSLW_norm = p.NSLW / root_path.Max(p2 => p2.NSLW));

            var child_term = root_path[0];
            var sum_NSLW = root_path.Sum(p => p.NSLW);
            Trace.WriteLine(sum_NSLW.ToString("0.0") + " " + leaf_term.name + " // " +
                string.Join(" / ", root_path.Skip(1).Select(p => p.name + " (NS_norm=" + p.NS_norm.ToString("0.00") + " NSLW=" + p.NSLW.ToString("0.0") + " #NS=" + p.wiki_nscount + ")")
                ));

            return true;
        }

   //... Dictionary<term, PathTermCountInfo> //public class PathTermCountInfo { public int similar_count; public double score; public List<int> distances_from_leaf = new List<int>(); }
        //var ret = new Dictionary<term, PathTermCountInfo>();
        //foreach(var path in root_paths.Except(root_paths.Where(p => p.Any(p2 => p2.name == "Living people")))) {
        //    int distance_from_leaf = 0;
        //    foreach(var term in path.Skip(1).Take(path.Count - 2)) // skip leaf and root terms (both are common to all paths)
        //    {
        //        distance_from_leaf++;
        //        var dict_term = ret.Keys.Where(p => p.id == term.id).SingleOrDefault();
        //        if (dict_term == null)
        //        {
        //            ret.Add(term, new PathTermCountInfo() { similar_count = 1, score = 0 });
        //            ret[term].distances_from_leaf.Add(distance_from_leaf);
        //        }
        //        else
        //        {
        //            ret[dict_term].similar_count++;
        //            ret[dict_term].distances_from_leaf.Add(distance_from_leaf);

        //            // weight the score mod for this common term: inversely proportional to distance from the leaf,
        //            // i.e. closer the common term is to the root, the less score it gets
        //            double score_mod = (dict_term.wiki_nscount ?? 0) / (Math.Pow((double)distance_from_leaf, 4));
        //            ret[dict_term].score += score_mod;
        //        }
        //    }
        //}
        //return ret.OrderByDescending(p => p.Value.score).ToDictionary((key) => key.Key, (value) => value.Value);

        //
        // Calculates paths to root and returns as List<List<term>>
        //
        public static List<List<term>> CalculatePathsToRoot(long child_term_id)
        {
            var root_paths = new ConcurrentBag<List<term>>();
            using (var db = mm02Entities.Create())
            {
                var child_term = db.terms.Find(child_term_id);

                var sw = new Stopwatch(); sw.Start();
                RecurseParents(root_paths, new List<term>() { }, child_term_id, child_term_id);
                Debug.WriteLine($"DONE: {sw.Elapsed.TotalSeconds} sec(s).");

                //var root_paths_list = new List<List<term>>();
                //foreach (var root_path in root_paths)
                //    root_paths_list.Add(root_path.ToList());

                root_paths.ToList().ForEach(p => Debug.WriteLine(child_term.name + " // " + string.Join(" / ", p.Select(p2 => p2.name + " #NS=" + p2.wiki_nscount))));
                return root_paths.ToList();
            }
        }

        private static void RecurseParents(
            ConcurrentBag<List<term>> root_paths, List<term> path,
            long term_id,
            long orig_term_id, int? parent_mmcat_level = null, int? orig_mmcat_level = null)
        {
            Debug.WriteLine($"path ==> {string.Join(" / ", path.Select(p => p.name + " #NS=" + p.wiki_nscount.ToString()))}");
            
            var links = GetParents(term_id, null);
            if (links.Count == 0)
            {
                root_paths.Add(path);
                Debug.WriteLine($">> ADDED ROOT PATH: {string.Join(" / ", path.Select(p => p.name))}  -  child_term_id={ term_id}");
            }
            if (parent_mmcat_level == null)
                parent_mmcat_level = orig_mmcat_level = links.Max(p => p.mmcat_level);

            // mmcat_level is a bit fuzzy (depends somewhat on ingestion order of wiki_walker)
            // so, if there are no links <= parent_mmcat_level, look for links
            var max_mmcat_level = parent_mmcat_level;
again:
            if (links.Where(p => p.mmcat_level <= max_mmcat_level).Count() == 0)
                if (++max_mmcat_level < orig_mmcat_level + 3) // arbitrary, just stop somewhere
                    goto again;

            Parallel.ForEach(
                links.Where(p => p.mmcat_level <= max_mmcat_level                    // link is higher than parent (closer to root)
                           //|| (p.parent_term.wiki_nscount > 5 && path.Count < 3)   // and significant node
                               )
                , new ParallelOptions() { MaxDegreeOfParallelism = Debugger.IsAttached ? 1 : 8 }, link =>
            {
                if (path.Select(p => p.id).Contains(link.parent_term_id) || link.parent_term_id == orig_term_id)
                    return;

                // add to path
                var new_path = new List<term>(path);
                new_path.Add(link.parent_term);

                // put some limit on recurrsion depth: if there's an existing path to root that matches this test path up to 
                // a cut-off depth, then abandon this recursion (test/pathological case: 5140670, // September 11 attacks)
                const int path_match_abort = 3;
                var this_path_ids = string.Join(",", new_path.Take(path_match_abort).Select(p2 => p2.id));
                if (root_paths.Any(p => string.Join(",", p.Take(path_match_abort).Select(p2 => p2.id)) == this_path_ids)) {
                    Debug.WriteLine($"aborting - (already got path to root, matching to {path_match_abort} levels: path ==> {string.Join(" / ", path.Select(p => p.name + " #NS=" + p.wiki_nscount.ToString()))}");
                    return;
                }

                // recurse
                RecurseParents(root_paths, new_path, link.parent_term_id, orig_term_id,
                        parent_mmcat_level: link.mmcat_level - 1
                        , orig_mmcat_level: orig_mmcat_level
                );
            });
        }

        private static List<golden_term> GetParents(long child_term_id, int? max_mmcat_level = null)
        {
            using (var db = mm02Entities.Create())
            {
                //Debug.WriteLine($"getting gt parents for {child_term_id}...");

                return db.golden_term.AsNoTracking()
                         .Include("term")
                         .Include("term1")
                         .Where(p => p.child_term_id == child_term_id)//&& p.mmcat_level <= (max_mmcat_level ?? 99))
                         .ToListNoLock();
            }
        }


        //
        // If not already done, calculates and stores paths to root for supplied term
        //
        public static bool RecordPathsToRoot(long term_id)
        {
            using (var db = mm02Entities.Create()) {
                // if already stored, nop
                if (db.gt_path_to_root.Any(p => p.term_id == term_id))
                    return false;

                // calculate (expensive)
                var paths = Terms.GoldenPaths.CalculatePathsToRoot(term_id);
                
                // remove
                db.gt_path_to_root.RemoveRange(db.gt_path_to_root.Where(p => p.term_id == term_id));

                // add
                int path_no = 1;
                var db_paths = new List<gt_path_to_root>();
                foreach (var path in paths) {
                    int seq = 1;
                    foreach (var path_step in path) {
                        var db_path = new gt_path_to_root() {
                            term_id = term_id,
                            path_no = path_no,
                            seq = seq,
                            seq_term_id = path_step.id,
                        };
                        db_paths.Add(db_path);
                        seq++;
                    }
                    path_no++;
                }
                db.gt_path_to_root.AddRange(db_paths);
                db.SaveChangesTraceValidationErrors();
                return true;
            }
        }

        // TODO (for fast dynamic categorization, of url-set)
        //public static void FetchPathsToRoot(long term_id)
        //{
        //    using (var db = mm02Entities.Create())
        //    {
        //        var db_paths = db.gt_path_to_root.AsNoTracking().Where(p => p.term_id == term_id).OrderBy(p => p.path_no).ThenBy(p => p.seq).ToListNoLock();
        //        var path_nos = db_paths.Select(p => p.path_no).Distinct();
        //        return db_paths;
        //        foreach (var path_no in path_nos)
        //        {
        //            //...
        //        }
        //    }
        //}

        
    }
}
