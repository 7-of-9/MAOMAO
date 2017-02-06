using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace wiki_walker
{
    public class Walker_NamespaceCounter
    {
        public static void Go()
        {
            Trace.WriteLine("getting term IDs...");
            List<long> wiki_term_ids;
            using (var db = mm02Entities.Create())
            {
                // terms needing update
                wiki_term_ids = db.terms.Where(p => p.wiki_nscount == null
                                           && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14))
                                        .Select(p => p.id)
                                        //.Take(100)
                                        .ToListNoLock();
            }
            Trace.WriteLine($"got {wiki_term_ids.Count} term IDs.");

            Stopwatch sw = new Stopwatch(); sw.Start(); int count = 0;
            Parallel.ForEach(wiki_term_ids, new ParallelOptions() { MaxDegreeOfParallelism = 100 }, term_id =>
            {
                using (var db = mm02Entities.Create())
                {
                    var page_title = db.terms.Find(term_id).name.Replace(" ", "_");

                    // get count from wiki_page of namespaces
                    var nscount = db.Database.SqlQuery<int>("SELECT COUNT(DISTINCT page_namespace) FROM wiki_page WHERE page_title = {0}", page_title).Single();

                    // update term
                    db.Database.ExecuteSqlCommand("UPDATE term SET wiki_nscount = {0} WHERE id = {1}", nscount, term_id);
                }

                if (++count % 100 == 0) {
                    var per_sec = count / sw.Elapsed.TotalSeconds;
                    Trace.WriteLine($"count: {count} in {sw.Elapsed.TotalSeconds.ToString("0")} sec(s) = {per_sec.ToString("0.0")} per/sec");
                }
            });
        }
    }
}
