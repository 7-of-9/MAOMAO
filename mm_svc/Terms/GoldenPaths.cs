using mm_global.Extensions;
using mm_svc.InternalNlp;
using mm_svc.InternalNlp.Utils;
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
        public static List<List<TermPath>> GetOrProcessPathsToRoot(long term_id)
        {
            using (var db = mm02Entities.Create()) {
                var term = db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p => p.id == term_id);
                var root_paths = GoldenPaths.GetStoredPathsToRoot(term);
                if (root_paths.Count == 0) {
                    GoldenPaths.ProcessAndRecordPathsToRoot(term_id);
                    term = db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p => p.id == term_id);
                    root_paths = GoldenPaths.GetStoredPathsToRoot(term);
                }
                return root_paths;
            }
        }

        public class TermPath {
            public term t;
            public short gl; // golden_level -- (explicitly set during ProcessPathsToRoot, i.e. term can be at multiple/different levels; depends on which path it features in)
        }

        //
        // Parses stored paths to root
        //
        public static List<List<TermPath>> GetStoredPathsToRoot(term term) // expects populated gt_path (paths_to_root == gt_path_to_root1)
        {
            var stemmer = new Porter2_English();
            term.stemmed = stemmer.stem(term.name);

            var all_paths = term.paths_to_root.ToList();
            var paths = new List<List<TermPath>>();
            var path_nos = all_paths.Select(p => p.path_no).Distinct();
            foreach (var path_no in path_nos) {
                var path = all_paths.Where(p => p.path_no == path_no);
                var gl = (short)path.Count();
                var term_paths = new List<TermPath>() { new TermPath() { t = term, gl = gl-- } };
                foreach (var seq_term in path.OrderBy(p => p.seq).Select(p => p.term)) {
                    seq_term.stemmed = stemmer.stem(seq_term.name);
                    term_paths.Add(new TermPath() { t = seq_term,  gl = gl-- });
                }
                paths.Add(term_paths);
            }
            return paths;
        }

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
        public static bool ProcessAndRecordPathsToRoot(long term_id)
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
