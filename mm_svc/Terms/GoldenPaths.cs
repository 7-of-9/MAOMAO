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
        public static List<List<term>> ParseStoredPathsToRoot(term term) // expects populated gt_path
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
        // Counts distinct occurances of path terms, across multiple paths
        //
        public class PathTermCountInfo { public int similar_count; public double score; public List<int> distances_from_leaf = new List<int>(); }
        public static Dictionary<term, PathTermCountInfo> GetPathTermCounts(List<List<term>> root_paths)
        {
            var ret = new Dictionary<term, PathTermCountInfo>();
            foreach(var path in root_paths.Except(root_paths.Where(p => p.Any(p2 => p2.name == "Living people")))) {
                int distance_from_leaf = 0;
                foreach(var term in path.Skip(1).Take(path.Count - 2)) // skip leaf and root terms (both are common to all paths)
                {
                    distance_from_leaf++;
                    var dict_term = ret.Keys.Where(p => p.id == term.id).SingleOrDefault();
                    if (dict_term == null)
                    {
                        ret.Add(term, new PathTermCountInfo() { similar_count = 1, score = 0 });
                        ret[term].distances_from_leaf.Add(distance_from_leaf);
                    }
                    else
                    {
                        ret[dict_term].similar_count++;
                        ret[dict_term].distances_from_leaf.Add(distance_from_leaf);

                        // weight the score mod for this common term: inversely proportional to distance from the leaf,
                        // i.e. closer the common term is to the root, the less score it gets
                        double score_mod = (dict_term.wiki_nscount ?? 0) / (Math.Pow((double)distance_from_leaf, 4));
                        ret[dict_term].score += score_mod;
                    }
                }
            }
            return ret.OrderByDescending(p => p.Value.score).ToDictionary((key) => key.Key, (value) => value.Value);
        }

        //
        // Calculates paths to root and returns as List<List<term>>
        //
        public static List<List<term>> CalculatePathsToRoot(long child_term_id)
        {
            var root_paths = new List<List<term>>();
            using (var db = mm02Entities.Create())
            {
                var child_term = db.terms.Find(child_term_id);

                var sw = new Stopwatch(); sw.Start();
                RecurseParents(root_paths, new List<term>() { }, child_term_id, child_term_id);
                Debug.WriteLine($"DONE: {sw.Elapsed.TotalSeconds} sec(s).");

                //var root_paths_list = new List<List<term>>();
                //foreach (var root_path in root_paths)
                //    root_paths_list.Add(root_path.ToList());

                root_paths.ForEach(p => Debug.WriteLine(child_term.name + " // " + string.Join(" / ", p.Select(p2 => p2.name + " #NS=" + p2.wiki_nscount))));
                return root_paths;
            }
        }

        private static void RecurseParents(
            List<List<term>> root_paths, List<term> path,
            long term_id,
            long orig_term_id, int? parent_mmcat_level = null, int? orig_mmcat_level = null)
        {
            Debug.WriteLine($"path ==> {string.Join(" / ", path.Select(p => p.name + " #NS=" + p.wiki_nscount.ToString()))}");
            
            var links = GetParents(term_id, null);// orig_mmcat_level);
            if (links.Count == 0)
            {
                root_paths.Add(path);
                //Debug.WriteLine($">> ADDED ROOT PATH: {string.Join(" / ", path.Select(p => p.name))}  -  child_term_id={ term_id}");
            }
            if (parent_mmcat_level == null)
                parent_mmcat_level = orig_mmcat_level = links.Max(p => p.mmcat_level);

            Parallel.ForEach(
                links.Where(p => p.mmcat_level <= parent_mmcat_level                // link is higher than parent (closer to root)
                            //|| (p.parent_term.wiki_nscount > 5 && path.Count < 3) // or significant node, within 3 hops from start of path
                               )
                //ordered.Take(this_n)
                , new ParallelOptions() { MaxDegreeOfParallelism = 1 }, link =>
            {
                if (path.Select(p => p.id).Contains(link.parent_term_id) || link.parent_term_id == orig_term_id)
                    return;

                // "feminism by country" -- not useful?
                //if (link.parent_term.name.Contains(" by "))
                //    return;

                //// "fictional orphans" -- not useful?
                //if (link.parent_term.name.ToLower().Contains("fictional"))
                //    return;

                // add to path
                var new_path = new List<term>(path);
                new_path.Add(link.parent_term);

                // recurse
                RecurseParents(root_paths, new_path, link.parent_term_id, orig_term_id,
                    //link.mmcat_level <= parent_mmcat_level ?
                        link.mmcat_level - 1
                    // : orig_mmcat_level
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
