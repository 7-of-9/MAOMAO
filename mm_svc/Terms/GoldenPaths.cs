using mm_global;
using mm_global.Extensions;
using mm_svc.InternalNlp;
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

namespace mm_svc.Terms
{
    public static class GoldenPaths
    {
        // pretty important for reasonable performance on calc'ing paths to root!
        public static ConcurrentDictionary<long, List<GtLight>> golden_term_cache = new ConcurrentDictionary<long, List<GtLight>>();
        public static event EventHandler OnCacheAdd = delegate { };

        public class GtLight { public short mmcat_level; public long parent_term_id; }

        public static List<List<TermPath>> GetOrProcessPathsToRoot(long term_id)
        {
            using (var db = mm02Entities.Create()) {
                var term = db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p => p.id == term_id);
                var root_paths = GoldenPaths.GetStoredPathsToRoot_ForTerm(term);
                if (root_paths.Count == 0) {
                    GoldenPaths.ProcessAndRecordPathsToRoot(term_id);
                    term = g.RetryMaxOrThrow(() => db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p2 => p2.id == term_id));
                    root_paths = GoldenPaths.GetStoredPathsToRoot_ForTerm(term);
                }
                return root_paths;
            }
        }

        [DebuggerDisplay("{t.name} GL={gl}")]
        public class TermPath {
            public term t;
            public int gl; // golden_level -- (explicitly set during ProcessPathsToRoot, i.e. term can be at multiple/different levels; depends on which path it features in)
            public int gl_inv; // inverse golden_level
            public double gl_norm; // golden_level: normalized value wrt. one specific path to root
        }

        //
        // Parses stored paths to root that contain the supplied term anywhere in the path (apart from leaf term)
        //
        public static List<List<TermPath>> GetStoredPathsToRoot_ContainingTerm(long term_id, int sample_size = 100)
        {
            var stemmer = new Porter2_English();
            var paths = new ConcurrentBag<List<TermPath>>();
            using (var db = mm02Entities.Create()) {
                var term_ids_and_paths_qry = db.gt_path_to_root.AsNoTracking()
                                               .Where(p => p.seq_term_id == term_id)
                                               .Select(p => new { leaf_term_id = p.term_id, path_no = p.path_no })
                                               .Distinct()
                                               .OrderBy(p => Guid.NewGuid())
                                               .Take(sample_size);
                Debug.WriteLine(term_ids_and_paths_qry.ToString());
                var sample_paths = term_ids_and_paths_qry.ToListNoLock();

                Parallel.ForEach(sample_paths, new ParallelOptions() { MaxDegreeOfParallelism = 16 }, path_info => {
                    using (var db2 = mm02Entities.Create()) {
                        var leaf_term = db2.terms.Find(path_info.leaf_term_id);
                        var path_qry = db2.gt_path_to_root.Where(p => p.term_id == path_info.leaf_term_id && p.path_no == path_info.path_no).OrderBy(p => p.seq);
                        //Debug.WriteLine(path_qry.ToString());
                        var path = path_qry.ToListNoLock();
                        var term_paths = GetTermPathList(leaf_term, stemmer, path);
                        paths.Add(term_paths);
                    }
                });
            }
            return paths.ToList();
        }

        //
        // Parses stored paths to root for supplied term - i.e. paths to root for the supplied leaf term
        //
        public static List<List<TermPath>> GetStoredPathsToRoot_ForTerm(term term) // expects populated gt_path (paths_to_root == gt_path_to_root1)
        {
            var stemmer = new Porter2_English();
            term.stemmed = stemmer.stem(term.name);

            var all_paths = term.paths_to_root.ToList();
            var paths = new List<List<TermPath>>();
            var path_nos = all_paths.Select(p => p.path_no).Distinct();
            foreach (var path_no in path_nos) {

                // gt_path_to_root -> List<TermPath>
                var path = all_paths.Where(p => p.path_no == path_no);
                var term_paths = GetTermPathList(term, stemmer, path);
                paths.Add(term_paths);
            }
            return paths.OrderByDescending(p => string.Join(",", p.Select(p2 => p2.t.name))).ToList();
        }

        private static List<TermPath> GetTermPathList(term term, Porter2_English stemmer, IEnumerable<gt_path_to_root> path)
        {
            var gl = path.Count();
            var term_paths = new List<TermPath>() { new TermPath() { t = term, gl = gl-- } };
            foreach (var seq_term in path.OrderBy(p => p.seq).Select(p => p.term)) {
                seq_term.stemmed = stemmer.stem(seq_term.name);
                term_paths.Add(new TermPath() { t = seq_term, gl = gl-- });
            }

            // golden_level normalized wrt. path to root
            term_paths.ForEach(p => p.gl_norm = (double)p.gl / term_paths.Count);
            term_paths.ForEach(p => p.gl_inv = term_paths.Count - p.gl);
            return term_paths;
        }

        //
        // Calculates paths to root and returns as List<List<term>>
        //
        public class RecurseParentOptions {
            public int PATH_MATCH_ABORT = 3;
            public bool RUN_PARALLEL = true;
            public bool INCLUDE_SIGNIFICANT_NODES = false;
            public int SIG_NODE_MIN_NSCOUNT = 5;
            public int SIG_NODE_MAX_PATH_COUNT = 3;
        }
        public static RecurseParentOptions opts = new RecurseParentOptions();
        public static List<List<term>> CalculatePathsToRoot(long child_term_id)
        {
            var root_paths = new ConcurrentBag<List<long>>();
            using (var db = mm02Entities.Create())
            {
                var child_term = db.terms.Find(child_term_id);

                //
                // todo -- could rerun RecurseParents with ++PATH_MATCH_ABORT, to produce more paths, if the root_paths Count < some threshold?
                //
                // todo -- could make root_paths a list of list of <long:term_id> instead of term, and remove .Include(term) from GetParents()
                //          (re. memory consumption of golden_term_cache)
                //

                var sw = new Stopwatch(); sw.Start();
                RecurseParents(root_paths, new List<long>() { }, child_term_id, child_term_id);
                //if (child_term_id == 5067658)
                //    Debugger.Break();

                var paths = root_paths.ToList();
                paths.ForEach(p => Debug.WriteLine("ROOT PATH ==> " + child_term.name + " // " + string.Join(" / ", p.Select(p2 => p2))));

                Trace.WriteLine($"DONE: {sw.Elapsed.TotalSeconds} sec(s) - root_paths.Count={root_paths.Count}");
                Trace.WriteLine($"golden_term_cache.Count = {golden_term_cache.Count}");
                Trace.WriteLine($"opts.PATH_MATCH_ABORT={opts.PATH_MATCH_ABORT}");
                Trace.WriteLine($"opts.INCLUDE_SIGNIFICANT_NODES={opts.INCLUDE_SIGNIFICANT_NODES}");
                Trace.WriteLine($"opts.SIG_NODE_MIN_NSCOUNT={opts.SIG_NODE_MIN_NSCOUNT}");
                Trace.WriteLine($"opts.SIG_NODE_MAX_PATH_COUNT={opts.SIG_NODE_MAX_PATH_COUNT}");

                // need to return terms, not longs
                var distinct_term_ids = paths.SelectMany(p => p.Select(p2 => p2).Distinct()).Distinct().ToList().OrderBy(p => p).ToList();
                var terms = db.terms.AsNoTracking().Where(p => distinct_term_ids.Contains(p.id)).ToListNoLock();
                var ret = new List<List<term>>();
                foreach (var path in paths) {
                    var path_list = new List<term>();
                    path.ForEach(p => path_list.Add(terms.First(p2 => p2.id == p)));
                    ret.Add(path_list);
                }

                // also -- consider custom lightweight struct for golden_term cache

                return ret;
                // then walk all again, monitor memory consumption
            }
        }

        private static void RecurseParents(
            ConcurrentBag<List<long>> root_paths, List<long> path,
            long term_id,
            long orig_term_id, int? parent_mmcat_level = null, int? orig_mmcat_level = null)
        {
            //Trace.WriteLine($"calc'ing path ==> {string.Join(" / ", path.Select(p => p.name + " #NS=" + p.wiki_nscount.ToString()))}...");
            
            var links = GetParents(term_id, null);
            if (links.Count == 0) {
                root_paths.Add(path);
                Trace.WriteLine($">>> ADDED ROOT PATH: {string.Join(" / ", path.Select(p => p))}  -  child_term_id={term_id}");
            }
            if (parent_mmcat_level == null)
                parent_mmcat_level = orig_mmcat_level = links.Max(p => p.mmcat_level);

            // mmcat_level is a bit fuzzy (depends somewhat on ingestion order of wiki_walker)
            // so, if there are no links <= parent_mmcat_level, look for links
            var max_mmcat_level = parent_mmcat_level;
            if (links.Count > 0 && links.Max(p => p.mmcat_level) > max_mmcat_level)
                max_mmcat_level = links.Max(p => p.mmcat_level);
//again:
//            if (links.Where(p => p.mmcat_level <= max_mmcat_level).Count() == 0)
//                if (++max_mmcat_level < orig_mmcat_level + 10) // arbitrary, just stop somewhere
//                    goto again;

            Parallel.ForEach(
                links.Where(p => p.mmcat_level <= max_mmcat_level                    // link is higher than parent (closer to root)
                           
                            //|| (opts.INCLUDE_SIGNIFICANT_NODES &&                  // or link is "significant node"
                            //                                                       // update: simple wowmao shows this doesn't seem to be working or making much difference
                            //    p.parent_term.wiki_nscount > opts.SIG_NODE_MIN_NSCOUNT &&
                            //    path.Count < opts.SIG_NODE_MAX_PATH_COUNT)
                ), 

            // running parallel results in non-deterministic output! i guess because of sensitivity on previously processed paths...
            new ParallelOptions() { MaxDegreeOfParallelism =
                Debugger.IsAttached ? (opts.RUN_PARALLEL ? 128 : 1)
                                    : (opts.RUN_PARALLEL ? 128 : 1)
            }, link =>
            {

                if (path.Select(p => p).Contains(link.parent_term_id) || link.parent_term_id == orig_term_id)
                    return;

                // add to path
                var new_path = new List<long>(path);
                new_path.Add(link.parent_term_id);

                // put some limit on recurrsion depth: if there's an existing path to root that matches this test path up to 
                // a cut-off depth, then abandon this recursion (test/pathological case: 5140670, // September 11 attacks)
                var this_path_ids = string.Join(",", new_path.Take(opts.PATH_MATCH_ABORT).Select(p2 => p2));
                if (root_paths.Any(p => string.Join(",", p.Take(opts.PATH_MATCH_ABORT).Select(p2 => p2)) == this_path_ids)) {
                    //Trace.WriteLine($"aborting - (already got path to root, matching to {path_match_abort} levels: path ==> {string.Join(" / ", path.Select(p => p.name + " #NS=" + p.wiki_nscount.ToString()))}");
                    return;
                }

                // recurse
                RecurseParents(root_paths, new_path, link.parent_term_id, orig_term_id,
                        parent_mmcat_level: link.mmcat_level - 1
                        , orig_mmcat_level: orig_mmcat_level
                );
            });
        }

        private static List<GtLight> GetParents(long child_term_id, int? max_mmcat_level = null)
        {
            if (golden_term_cache != null && golden_term_cache.ContainsKey(child_term_id))
                return golden_term_cache[child_term_id];

            using (var db = mm02Entities.Create()) {

                var gts = //g.RetryMaxOrThrow(() =>
                              db.golden_term.AsNoTracking()
                             //.Include("term")
                             //.Include("term1")
                             .Where(p => p.child_term_id == child_term_id)//&& p.mmcat_level <= (max_mmcat_level ?? 99))
                             .OrderBy(p => p.id)
                             .ToListNoLock()
                           //, 1, 3)
                             ;

                var ret = gts.Select(p => new GtLight { mmcat_level = (short)p.mmcat_level, parent_term_id = p.parent_term_id }).ToList();

                if (golden_term_cache != null) {
                    golden_term_cache.TryAdd(child_term_id, ret);
                    OnCacheAdd?.Invoke(typeof(GoldenPaths), EventArgs.Empty);
                }

                return ret;
            }
        }

        //
        // If not already done, calculates and stores paths to root for supplied term
        //
        public static bool ProcessAndRecordPathsToRoot(long term_id, bool reprocess = false)
        {
            using (var db = mm02Entities.Create()) {
                // if already stored, nop
                if (!reprocess && g.RetryMaxOrThrow(() => db.gt_path_to_root.Any(p => p.term_id == term_id)))
                    return false;

                // calculate (expensive)
                var paths = Terms.GoldenPaths.CalculatePathsToRoot(term_id);
                if (paths.Count == 0)
                    return false;

                // remove
                //g.RetryMaxOrThrow(() => db.gt_path_to_root.RemoveRange(db.gt_path_to_root.Where(p => p.term_id == term_id)), 1, 3);
                //db.SaveChangesTraceValidationErrors();
                db.Database.ExecuteSqlCommand("DELETE FROM [gt_path_to_root] WHERE [term_id]={0}", term_id);

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

                //db.Configuration.AutoDetectChangesEnabled = false;
                //db.Configuration.ValidateOnSaveEnabled = false;
                //db.gt_path_to_root.AddRange(db_paths);
                //db.SaveChangesTraceValidationErrors();

                mmdb_model.Extensions.BulkCopy.BulkInsert(db.Database.Connection as SqlConnection, "gt_path_to_root", db_paths);

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
