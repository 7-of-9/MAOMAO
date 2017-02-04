using mmdb_model;
using System;
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
            foreach(var path_no in path_nos)
            {
                var path = new List<term>() { term };
                foreach (var seq_term in path_data.Where(p => p.path_no == path_no).OrderBy(p => p.seq).Select(p => p.term))
                {
                    path.Add(seq_term);
                }
                paths.Add(path);
            }
            return paths;
        }

        //
        // Calculates paths to rootm returns as List<List<term>>
        //
        public static List<List<term>> CalculatePathsToRoot(long child_term_id)
        {
            var root_paths = new List<List<term>>();
            using (var db = mm02Entities.Create())
            {
                var child_term = db.terms.Find(child_term_id);
                RecurseParents(root_paths, new List<term>() { }, child_term_id, child_term_id);
                root_paths.ForEach(p => Debug.WriteLine(child_term.name + " // " + string.Join(" / ", p.Select(p2 => p2.name))));
            }
            return root_paths;
        }

        public static void RecordPathsToRoot(long term_id)
        {
            var paths = Terms.GoldenPaths.CalculatePathsToRoot(term_id);
            using (var db = mm02Entities.Create())
            {
                // remove
                db.gt_path_to_root.RemoveRange(db.gt_path_to_root.Where(p => p.term_id == term_id));

                // add
                int path_no = 1;
                var db_paths = new List<gt_path_to_root>();
                foreach (var path in paths)
                {
                    int seq = 1;
                    foreach (var path_step in path)
                    {
                        var db_path = new gt_path_to_root()
                        {
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

        private static void RecurseParents(List<List<term>> root_paths, List<term> path, long term_id, long orig_term_id)
        {
            //Debug.WriteLine($"path: {string.Join(" / ", path.Select(p => p.name))}  -  child_term_id={ term_id}");
            var links = GetParents(term_id);
            if (links.Count == 0)
                root_paths.Add(path);

            foreach (var link in links.OrderBy(p => p.mmcat_level)) // orderby - important! we want fastest paths first
            {
                if (path.Select(p => p.id).Contains(link.parent_term_id) || link.parent_term_id == orig_term_id)
                    continue;

                // skip if this path is already known to terminate in the root
                var root_path_names = root_paths.Select(p => string.Join(" / ", p.Take(path.Count - 1).Select(p2 => p2.name))).ToList();
                var this_path_name = string.Join(" / ", path.Select(p => p.name));
                if (!string.IsNullOrEmpty(this_path_name) && root_path_names.Any(p => !string.IsNullOrEmpty(p) && this_path_name.StartsWith(p)))
                    continue;

                // recurse: add to path
                var new_path = new List<term>(path);
                new_path.Add(link.parent_term);
                RecurseParents(root_paths, new_path, link.parent_term_id, orig_term_id);
            }
        }

        private static List<golden_term> GetParents(long child_term_id)
        {
            using (var db = mm02Entities.Create())
            {
                return db.golden_term.Include("term").Include("term1")
                         .Where(p => p.child_term_id == child_term_id).ToListNoLock();
            }
        }

    }
}
