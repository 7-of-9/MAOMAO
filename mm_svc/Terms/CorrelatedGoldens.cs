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
    public static class CorrelatedGoldens
    {
        public static Dictionary<string, List<term>> cache = new Dictionary<string, List<term>>();
        public static event EventHandler cache_add = delegate { };

        public static List<term> GetGorrelatedGoldenTerms_Ordered(string main_term)
        {
            if (cache.Keys.Contains(main_term))
                return cache[main_term];

            var ret = new List<term>();
            var sw = new Stopwatch(); sw.Start();
            using (var db = mm02Entities.Create()) {
                var a_ids = db.ObjectContext().ExecuteStoreQuery<long>($@"
select term_matrix.id
--term_matrix.*, (select name from term where id = term_matrix.term_b_id) 'term_b', (select name from term where id = term_matrix.term_a_id) 'term_a'
--(select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_a_id) = '{main_term.Replace("'","''")}'
and(select child_term_id from golden_term where child_term_id = term_matrix.term_b_id) is not null
order by occurs_together_count desc
                ");

                var b_ids = db.ObjectContext().ExecuteStoreQuery<long>($@"
select term_matrix.id
--term_matrix.*, (select name from term where id = term_matrix.term_a_id) 'term_a', (select name from term where id = term_matrix.term_b_id) 'term_b'
--(select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) 'golden correlation?'
from term_matrix
where (select name from term where id = term_b_id) = '{main_term.Replace("'", "''")}'
and (select child_term_id from golden_term where child_term_id = term_matrix.term_a_id) is not null
order by occurs_together_count desc
                ");

                var all_ids = a_ids.Union(b_ids).ToList();
                var data = db.term_matrix
                                        .Include("term").Include("term.term_type").Include("term.cal_entity_type")
                                        .Include("term.golden_term.term").Include("term.golden_term.term1")
                                        .Include("term.golden_term1.term").Include("term.golden_term1.term1")
                                        .Include("term1").Include("term1.term_type").Include("term1.cal_entity_type")
                                        .Include("term1.golden_term.term").Include("term1.golden_term.term1")
                                        .Include("term1.golden_term1.term").Include("term1.golden_term1.term1")
                                        .Where(p => all_ids.Contains(p.id)
                                            && p.term_a_id != g.MAOMAO_ROOT_TERM_ID
                                            && p.term_b_id != g.MAOMAO_ROOT_TERM_ID)
                                        .OrderByDescending(p => p.occurs_together_count)// important
                                        .ToListNoLock();
                Debug.WriteLine($"> GetCorrelatedGoldenTerms('{main_term}'): {sw.ElapsedMilliseconds} ms for data [{data.Count} row(s)]");

                foreach (var term_matrix in data) {
                    var max_term_occurs_count = Math.Max(term_matrix.term.occurs_count, term_matrix.term1.occurs_count);
                    term_matrix.corr = (double)term_matrix.occurs_together_count / max_term_occurs_count;

                    if (!ret.Select(p => p.id).Contains(term_matrix.term.id) && term_matrix.term.name.ToLower() != main_term.ToLower()) {
                        term_matrix.term.corr = term_matrix.corr;
                        ret.Add(term_matrix.term);
                    }
                }

                cache.Add(main_term, ret);
                cache_add?.Invoke(typeof(CorrelatedGoldens), EventArgs.Empty);
                return ret;
            }
        }

    }
}
