using mm_global;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UrlClassifier
    {
        public static List<user_url_classification> ClassifyUrl(long url_id, long user_id, out int new_classifications, out int reused_classifications)
        {
            new_classifications = 0;
            reused_classifications = 0;
            using (var db = mm02Entities.Create())
            {
                var url = db.urls.Find(url_id);
                var user = db.users.Find(user_id);

                // create user_url, if not already
                var user_url_id = mm_svc.User.UserHistory.TrackUrl(url.url1, user.id);

                // remove previous user_url classification(s)
                db.user_url_classification.RemoveRange(db.user_url_classification.Where(p => p.user_url_id == user_url_id));
                db.SaveChangesTraceValidationErrors();

                // user's previous classifications
                var previous_term_ids = db.user_url_classification.Where(p => p.user_id == user_id).Select(p => p.term_id).ToListNoLock();

                // all terms -- for suppled URL
                var url_terms = db.url_term.AsNoTracking().Include("term").Where(p => p.url_id == url_id).ToListNoLock();

                // strip wiki terms - for now
                var terms = url_terms.Where(p => p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14);

                // any terms matching previous?
                var url_terms_previously_classified = terms.Where(p => previous_term_ids.Contains(p.term_id));

                // * classify *
                const int N_MAX = 3;
                List<term> classifications = new List<term>();
                if (previous_term_ids.Count == 0)
                {
                    // no previous classifications, take top n all url_terms over threshold
                    classifications = GetOrderedTermsOverThreshold(terms).Take(N_MAX).ToList();

                    new_classifications = classifications.Count;
                    reused_classifications = 0;
                }
                else
                {
                    // previous classifications; take top n common terms over threshold
                    var previous_terms_over_threshold = GetOrderedTermsOverThreshold(url_terms_previously_classified).Take(N_MAX).ToList();

                    // weight by previous classification count?
                    //...

                    classifications = previous_terms_over_threshold;
                    reused_classifications = classifications.Count;

                    // if not enough (or none) previously classified, terms - enrich with terms from url classification
                    var additional_needed = classifications.Count - N_MAX;
                    if (additional_needed > 0)
                    {
                        classifications = classifications.Concat(GetOrderedTermsOverThreshold(terms).Take(additional_needed)).ToList();
                        new_classifications = classifications.Count - reused_classifications;
                    }
                }

                // record
                short pri = 0;
                var user_url_classifications = new List<user_url_classification>();
                foreach (var term in classifications) {
                    var user_url_classification = new user_url_classification() {
                        term_id = term.id,
                        user_id = user_id,
                        user_url_id = user_url_id,
                        pri = ++pri
                    };
                    user_url_classifications.Add(user_url_classification);
                }
                db.user_url_classification.AddRange(user_url_classifications);
                db.SaveChangesTraceValidationErrors();

                return user_url_classifications;
            }
        }

        private static List<term> GetOrderedTermsOverThreshold(IEnumerable<url_term> terms)
        {
            List<term> classifications;
            var high_tss_norm = terms.Where(p => p.tss_norm > 0.4).OrderByDescending(p => p.tss_norm);
            var high_S_no_tss = terms.Where(p => p.tss_norm == null && p.S >= 8).OrderByDescending(p => p.S);
            classifications = high_tss_norm.Select(p => p.term)
                      .Concat(high_S_no_tss.Select(p => p.term)).ToList();

            return classifications;
        }
    }
}
