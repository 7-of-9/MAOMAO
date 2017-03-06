using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    /// <summary>
    /// NLP-agnostic pair of adjacent terms, i.e. terms that appear in the same NLP resulset.
    /// occurs_acount on the term_matrix table holds absolute counts of the number of times that the pair has appeared in an NLP resultset.
    /// </summary>
    public  class TermPair
    {
        public long id_a = 0, id_b = 0;

        /// <summary>
        /// Gets unique term pairs for supplied list of terms.
        /// </summary>
        /// <param name="term_ids"></param>
        /// <returns>List of unqiue term pairs</returns>
        public static List<TermPair> GetUniqueTermPairs(List<long> term_ids)
        {
            var pairs = new List<TermPair>();
            foreach (long id_a in term_ids) {
                foreach (long id_b in term_ids) {
                    if (id_a == id_b) continue;
                    if (pairs.Any(p => (p.id_a == id_a && p.id_b == id_b) || (p.id_a == id_b && p.id_b == id_a))) continue;
                    pairs.Add(new TermPair() { id_a = id_a, id_b = id_b });
                }
            }
            return pairs;
        }

        /// <summary>
        /// Updated term-pair appearance matrix for the supplied list of term pairs.
        /// </summary>
        /// <param name="nlp_info"></param>
        /// <returns>count of new term pairs inserted.</returns>
        public static int MaintainAppearanceMatrix(List<TermPair> pairs)
        {
            var new_pairs = 0;
            using (var db = mm02Entities.Create())
            {
                foreach (var pair in pairs)
                {
                    if (pair == null || pair.id_a == 0 || pair.id_b == 0) throw new ApplicationException("bad pair");

                    // lookup term pair
                    var db_pair = db.term_matrix.Where(p => p.term_a_id == pair.id_a && p.term_b_id == pair.id_b).FirstOrDefaultNoLock();

                    if (db_pair == null) // if not found, look for inverse (equivalent) pair
                        db_pair = db.term_matrix.Where(p => p.term_a_id == pair.id_b && p.term_b_id == pair.id_a).FirstOrDefaultNoLock();

                    // update term-pair appearance count in term matrix table
                    if (db_pair == null)
                    {
                        var db_term_pair = new term_matrix();
                        db_term_pair.term_a_id = pair.id_a;
                        db_term_pair.term_b_id = pair.id_b;
                        db_term_pair.occurs_together_count = 1;
                        db.term_matrix.Add(db_term_pair);
                        new_pairs++;
                        //g.LogLine($"writing new term_pair a.id={pair.id_a}, b.id={pair.id_b} ...");
                    }
                    else
                    {
                        //g.LogLine($"++occurs_count for known term_pair a.id={pair.id_a}, b.id={pair.id_b} ...");
                        db_pair.occurs_together_count++;
                    }
                }
                db.SaveChangesTraceValidationErrors();
            }
            return new_pairs;
        }
    }
}
