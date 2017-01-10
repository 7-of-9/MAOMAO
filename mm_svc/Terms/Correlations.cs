using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Terms
{
    public class correlation
    {
        public string main_term;

        public string corr_term;
        public List<term_matrix> corr_matrix = new List<term_matrix>();

        public List<term> corr_terms { get { return corr_matrix.Select(p => p.related_term).Distinct().ToList(); } }

        public bool is_golden_child { get { return corr_terms.Any(p => p.golden_parents.Any()); } }

        public IEnumerable<golden_term> golden_parents { get { return corr_terms.SelectMany(p => p.golden_parents); } }//.Select(p => p.parent_term).Distinct(); } }

        //public bool is_mm_cat(int mmcat) { return corr_terms.All(p => p.mmcat == mmcat); }
        //public bool is_golden_1 { get { return is_mm_cat(1); } }
        //public bool is_golden_2 { get { return is_mm_cat(2); } }
        //public bool has_mm_cat() { return corr_terms.All(p => p.mmcat != null); }

        public long sum_XX = -1;
        public double max_corr = -1;

        public override string ToString() {
            return $"{main_term} x {corr_term}: corr_matrix[{corr_matrix.Count}] sum_XX={sum_XX} max_corr={max_corr}";
        }
    }

    public class corr_result
    {
        public string main_term;
        public List<correlation> correlations = new List<correlation>();
    }

    public static class Correlations
    {
        //public static mm02Entities db = null;

        public class corr_input {
            public string main_term;
            public string corr_term_eq;
        }

        public static List<corr_result> Get3(List<corr_input> inputs)
        {
            Stopwatch sw = new Stopwatch(); sw.Start();
            //if (db == null) db = mm02Entities.Create();
            using (var db = mm02Entities.Create())
            {
                var results = new List<corr_result>();
                var main_terms = string.Join(", ", inputs.Select(p => p.main_term.ToLower()));
                var main_terms_list = inputs.Select(p => p.main_term.ToLower());
                //var cor_term_eq_list = inputs.Select(p => p.corr_term_eq.ToLower());

                // look up relations (both sides), with exclusions
                var a = db.term_matrix
                    .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                    //.Include("term.golden_term").Include("term.golden_term1")
                    .Include("term1").Include("term1.term_type").Include("term1.cal_entity_type")
                    //.Include("term1.golden_term").Include("term1.golden_term1")
                    .Where(p => main_terms_list.Contains(p.term.name.ToLower()) 
                            && !g.EXCLUDE_TERM_IDs.Contains(p.term_b_id));
                var b = db.term_matrix
                    .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                    //.Include("term.golden_term").Include("term.golden_term1")
                    .Include("term1").Include("term1.term_type").Include("term1.cal_entity_type")
                    //.Include("term1.golden_term").Include("term1.golden_term1")
                    .Where(p => main_terms_list.Contains(p.term1.name.ToLower()) 
                            && !g.EXCLUDE_TERM_IDs.Contains(p.term_a_id));
                var c = a.Union(b)
                         .OrderByDescending(p => p.occurs_together_count);
                //Debug.WriteLine(c.ToString());  
                var data = c.ToListNoLock();
                Debug.WriteLine($"> Get3('{main_terms}'): {sw.ElapsedMilliseconds} ms for data [{data.Count} row(s)]");

                int dbg1 = 0;
                foreach (var mat in data)
                {
                    var max_term_occurs_count = Math.Max(mat.term.occurs_count, mat.term1.occurs_count);

                    // get main & related terms from matrix
                    term related_term;
                    string main_term;
                    if (main_terms_list.Contains(mat.term.name.ToLower()))
                       { related_term = mat.term1; main_term = mat.term.name; }
                    else if (main_terms_list.Contains(mat.term1.name.ToLower()))
                       { related_term = mat.term; main_term = mat.term1.name; }
                    else continue; //?
                    dbg1++;

                            //term related_term;
                            //if (related_term_matrix.term.name.ToLower() != main_term.ToLower())
                            //    related_term = related_term_matrix.term;
                            //else if (related_term_matrix.term1.name.ToLower() != main_term.ToLower())
                            //    related_term = related_term_matrix.term1;
                            //else continue; // exclude self by id

                    mat.related_term = related_term;

                    // optional: related term exclusion, if supplied
                    var corr_term_eq = inputs.Single(p => p.main_term.ToLower() == main_term.ToLower()).corr_term_eq;
                    if (!string.IsNullOrEmpty(corr_term_eq))
                        if (related_term.name.ToLower() != corr_term_eq.ToLower())
                            continue;

                    // add/update correlations output
                    //Debug.WriteLine($"{main_term}: tm.id={mat.id}");
                    corr_result res = results.SingleOrDefault(p => p.main_term.ToLower() == main_term.ToLower());
                    if (res == null) { 
                        res = new corr_result() { main_term = main_term };
                        results.Add(res);
                    }

                    correlation corr = res.correlations.SingleOrDefault(p => p.main_term.ToLower() == main_term.ToLower() && p.corr_term.ToLower() == related_term.name.ToLower());
                    if (corr == null) {
                        corr = new correlation() { main_term = main_term, corr_term = related_term.name };
                        res.correlations.Add(corr);
                    }

                    if (!corr.corr_matrix.Any(p => p.id == mat.id)) // only add term_matrix once, by id
                        corr.corr_matrix.Add(mat);

                    mat.corr = (double)mat.occurs_together_count / (double)max_term_occurs_count; // calc corr.
                }
                Debug.WriteLine($"> Get3('{main_terms}'): dbg1={dbg1}]");

                // remove self
                foreach (var result in results) {
                    result.correlations.RemoveAll(p => p.corr_term == p.main_term);

                    // calc max correlation & sum of appears_together_count
                    foreach (var x in result.correlations) {
                        x.sum_XX = x.corr_matrix.Sum(p => p.occurs_together_count);
                        x.max_corr = x.corr_matrix.Max(p => p.corr); // probably should be a weighted average

                        //Debug.WriteLine($"main_term={x.main_term} corr_term={x.corr_term} sum_XX={x.sum_XX} max_corr={x.max_corr.ToString("0.0000")}");
                        //foreach (var tm in x.corr_matrix) {
                        //    Debug.WriteLine($"\tTM: id={tm.id.ToString().PadLeft(10)} " + 
                        //                    $"{tm.term.name.PadLeft(20)}[{tm.term.id.ToString().PadLeft(6)}] #{tm.term.occurs_count.ToString().PadLeft(4)}" +
                        //                    $"  X  " + 
                        //                    $"{tm.term1.name.PadLeft(20)}[{tm.term1.id.ToString().PadLeft(6)}] #{tm.term1.occurs_count.ToString().PadLeft(4)}   " +
                        //                    $"->   XX={tm.occurs_together_count.ToString().PadLeft(4)}  " +
                        //                    $"corr={tm.corr.ToString("0.0000")} ==> {tm.related_term.name}[{tm.related_term.id}]");
                        //}
                    }

                    result.correlations = result.correlations.OrderByDescending(p => p.max_corr).ToList();
                }

                Debug.WriteLine($">>> Get3('{main_terms}'): {sw.ElapsedMilliseconds} ms");
                return results;
            }
        }

        public static List<correlation> Get2(string main_term, string corr_term_eq = null, int? max_appears_together_count = null)
        {
            Stopwatch sw = new Stopwatch(); sw.Start();
            //if (db == null) db = mm02Entities.Create();

            using (var db = mm02Entities.Create())
            {
                var correlated = new List<correlation>();

                // look up relations (both sides), with exclusions
                var a = db.term_matrix//.AsNoTracking()
                    .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                    .Include("term.golden_term.term").Include("term.golden_term.term1")
                    .Include("term.golden_term1.term").Include("term.golden_term1.term1")
                    .Include("term1").Include("term1.term_type").Include("term1.cal_entity_type")
                    .Include("term1.golden_term.term").Include("term1.golden_term.term1")
                    .Include("term1.golden_term1.term").Include("term1.golden_term1.term1")
                    .Where(p => p.term.name.ToLower() == main_term.ToLower() && !g.EXCLUDE_TERM_IDs.Contains(p.term_b_id));

                var b = db.term_matrix//.AsNoTracking()
                    .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                    .Include("term.golden_term.term").Include("term.golden_term.term1")
                    .Include("term.golden_term1.term").Include("term.golden_term1.term1")
                    .Include("term1").Include("term1.term_type").Include("term1.cal_entity_type")
                    .Include("term1.golden_term.term").Include("term1.golden_term.term1")
                    .Include("term1.golden_term1.term").Include("term1.golden_term1.term1")
                    .Where(p => p.term1.name.ToLower() == main_term.ToLower() && !g.EXCLUDE_TERM_IDs.Contains(p.term_a_id));

                // cap results by max_appears_together_count_normalized
                if (max_appears_together_count != null) {
                    //long max_a = db.term_matrix.Where(p => p.term.name.ToLower() == main_term.ToLower() && p.term1.name.ToLower() != main_term.ToLower()).Max(p => p.occurs_together_count);
                    //long max_b = db.term_matrix.Where(p => p.term1.name.ToLower() == main_term.ToLower() && p.term.name.ToLower() != main_term.ToLower()).Max(p => p.occurs_together_count);
                    //long max = (long)(Math.Max((double)max_a, (double)max_b) * max_appears_together_count_normalized);
                    int max = (int)max_appears_together_count;
                    a = a.Where(p => p.occurs_together_count >= max);
                    b = b.Where(p => p.occurs_together_count >= max);
                }
                var c = a.Union(b).OrderByDescending(p => p.occurs_together_count);
                Debug.WriteLine(c.ToString());
                var data = c.ToListNoLock();
                Debug.WriteLine($"> Get2('{main_term}'): {sw.ElapsedMilliseconds} ms for data [{data.Count} row(s)]");

                int dbg1 = 0;
                foreach (var related_term_matrix in data) {
                    var max_term_occurs_count = Math.Max(related_term_matrix.term.occurs_count, related_term_matrix.term1.occurs_count);

                    term related_term;
                    if (related_term_matrix.term.name.ToLower() != main_term.ToLower())
                        related_term = related_term_matrix.term;
                    else if (related_term_matrix.term1.name.ToLower() != main_term.ToLower())
                        related_term = related_term_matrix.term1;
                    else continue; // exclude self by id
                    dbg1++;

                    related_term_matrix.related_term = related_term;

                    if (!string.IsNullOrEmpty(corr_term_eq))
                        if (related_term.name.ToLower() != corr_term_eq.ToLower())//.IndexOf(corr_term_like.ToLower()) == -1)
                            continue;

                    correlation corr = correlated.SingleOrDefault(p => p.corr_term.ToLower() == related_term.name.ToLower());
                    //Debug.WriteLine($"dbg1={dbg1} correlated.Count={correlated.Count}...");
                    if (corr == null) { 
                        corr = new correlation() { main_term = main_term, corr_term = related_term.name };
                        correlated.Add(corr);
                        //Debug.WriteLine($"added new correlation: {corr.ToString()}");
                    }

                    if (!corr.corr_matrix.Any(p => p.id == related_term_matrix.id))
                        corr.corr_matrix.Add(related_term_matrix);

                    related_term_matrix.corr = (double)related_term_matrix.occurs_together_count / (double)max_term_occurs_count; // calc corr.
                }
                Debug.WriteLine($"> Get2('{main_term}'): dbg1={dbg1}]");

                // remove self
                correlated.RemoveAll(p => p.corr_term == p.main_term);

                // calc max correlation & sum of appears_together_count
                foreach (var x in correlated) {
                    x.sum_XX = x.corr_matrix.Sum(p => p.occurs_together_count);
                    x.max_corr = x.corr_matrix.Max(p => p.corr); // probably should be a weighted average
                }

                correlated = correlated.OrderByDescending(p => p.max_corr).ToList();
                Debug.WriteLine($">>> Get2('{main_term}'): {sw.ElapsedMilliseconds} ms");
                return correlated;
            }
        }
    }
}
