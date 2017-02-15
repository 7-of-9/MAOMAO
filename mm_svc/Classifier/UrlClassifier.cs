using mm_global;
using mm_global.Extensions;
using mmdb_model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc
{
    public static class UrlClassifier
    {
        public static List<user_url_classification> ClassifyUrl(
            long url_id, long user_id, out int new_classifications, out int reused_classifications, 
            int call_level)
        {
            new_classifications = 0;
            reused_classifications = 0;
            List<term> classifications_for_url = new List<term>();
            List<term> classifications_for_prior = new List<term>();

            using (var db = mm02Entities.Create())
            {
                var url = db.urls.Find(url_id);
                var user = db.users.Find(user_id);
                string pretty_meta_all = JsonConvert.SerializeObject(url.meta_all, Formatting.Indented);

                //Trace.WriteLine(pretty_meta_all);

                // create user_url, if not already
                var user_url_id = mm_svc.User.UserHistory.TrackUrl(url.url1, user.id);
                Trace.WriteLine($"{new string('\t', call_level)}>>> url_id={url_id} user_url_id={user_url_id} [{url.meta_title}] ({url.url1})");

                // remove previous user_url classification(s)
                db.user_url_classification.RemoveRange(db.user_url_classification.Where(p => p.user_url_id == user_url_id));
                db.SaveChangesTraceValidationErrors();

                // user's previous classifications
                var previous_term_ids = db.user_url_classification.Where(p => p.user_id == user_id).Select(p => p.term_id).ToListNoLock();

                // all terms -- for suppled URL
                var url_terms = GetOrderedTermsOverThreshold(db.url_term.AsNoTracking().Include("term").Where(p => p.url_id == url_id).ToListNoLock());

                // any terms matching previous?
                var url_terms_in_previously_classified = url_terms.Where(p => previous_term_ids.Contains(p.term_id));

                // * classify *
                const int N_MAX = 3;

                classifications_for_url = url_terms.Take(N_MAX).Select(p => p.term).ToList();
                new_classifications = classifications_for_url.Count;
                if (previous_term_ids.Count == 0)
                {
                    // trivial -- first use case: no previous classifications, take top n all url_terms over threshold
                    reused_classifications = 0;
                }
                else
                {
                    //
                    // subsequent -- take set of previous terms *common to* this URL, union with terms in this URL
                    //               order by aggregate count of terms
                    //               take top (1) item *by aggregate count*, at position 1 (or special, zero?)
                    //               take remainder of URL terms up to N_MAX from URL terms
                    //               this is surely good -- records to n by aggreate count (negative ordinals?)
                    //               and retains top n by simple URL classification (positive ordinals?)
                    //
                    //               apply same negative ordinals to ALL common URLS...? [reclassification]
                    //

                    // count common prior classified terms
                    var common_term_counts = new Dictionary<term, int>(); // term_id, count
                    foreach (var url_term in url_terms_in_previously_classified)
                    {
                        common_term_counts.Add(url_term.term, previous_term_ids.Count(p => p == url_term.term.id) + 1); // +1 for url_term
                    }
                    var ordered_common_terms = common_term_counts.ToList();
                    ordered_common_terms.Sort((p1, p2) => p2.Value.CompareTo(p1.Value));

                    // take top N_MAX common prior classified terms
                    classifications_for_prior.AddRange(ordered_common_terms.Take(N_MAX).Select(p => p.Key).ToList());
                    reused_classifications = classifications_for_prior.Count;
                }

                // record - URL classifications (no regard to prior classifications: positive ordinals)
                short pri = 0;
                var user_url_classifications_for_url_only = new List<user_url_classification>();
                foreach (var term in classifications_for_url) {
                    var user_url_classification = new user_url_classification() {
                        term_id = term.id,
                        //term = term,
                        user_id = user_id,
                        user_url_id = user_url_id,
                        pri = ++pri,
                        reused = false
                    };
                    user_url_classifications_for_url_only.Add(user_url_classification);
                }
                db.user_url_classification.AddRange(user_url_classifications_for_url_only);

                // record -- URL classifications (prior matching classifications, ordered by classification count, negative ordinals)
                pri = 0;
                var user_url_classifications_prior_classifications = new List<user_url_classification>();
                foreach (var term in classifications_for_prior) {
                    var user_url_classification = new user_url_classification() {
                        term_id = term.id,
                        //term = term,
                        user_id = user_id,
                        user_url_id = user_url_id,
                        pri = --pri,
                        reused = true,
                    };
                    user_url_classifications_prior_classifications.Add(user_url_classification);
                }
                db.user_url_classification.AddRange(user_url_classifications_prior_classifications);

                db.SaveChangesTraceValidationErrors();

                // log
                var url_all_classifications = user_url_classifications_for_url_only.Union(user_url_classifications_prior_classifications).ToList();
                foreach (var classification in url_all_classifications) {
                    var url_term = db.url_term.Include("term").Where(p => p.term_id == classification.term_id && p.url_id == url.id).Single();
                    Trace.WriteLine($"{new string('\t', call_level+1)}pri={classification.pri} {url_term.term.name} tss_norm={url_term.tss_norm} S={url_term.S_CALC} reused={classification.reused}");
                }

                // rewrite common user_url_classification negative ordinals  [reclassification of common prior classified]
                if (call_level == 1)
                {
                    var url_all_classification_term_ids = url_all_classifications.Select(p => p.term_id).Distinct();

                    // for each prior common term, lookup URLs that share the term classification
                    // call this fn. on each URL (except this, and without this recursion) -- this recomputes the common terms for the common URLs
                    foreach (var term in classifications_for_prior)
                    {
                        var prior_common_user_url_ids = db.user_url_classification
                                                          .Where(p => p.user_id == user_id && url_all_classification_term_ids.Contains(p.term_id))
                                                          .Select(p => p.user_url.urlId)
                                                          .Distinct().ToListNoLock();

                        foreach (var prior_common_user_url_id in prior_common_user_url_ids)
                        {
                            int l2_new_classifications = 0;
                            int l2_reused_classifications = 0;
                            UrlClassifier.ClassifyUrl(prior_common_user_url_id, user_id, out l2_new_classifications, out l2_reused_classifications, call_level: call_level + 1);
                        }
                    }
                }

                return url_all_classifications;
            }
        }

        private static IEnumerable<url_term> GetOrderedTermsOverThreshold(IEnumerable<url_term> url_terms)
        {
            List<url_term> classifications;
            var calais_url_terms = url_terms.Where(p => p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14);
            var high_tss_norm = calais_url_terms.Where(p => p.tss_norm > 0.4).OrderByDescending(p => p.tss_norm);
            var high_S_no_tss = calais_url_terms.Where(p => (p.tss_norm == null || p.tss_norm == 0) && p.S_CALC >= 8).OrderByDescending(p => p.S_CALC);
            classifications = high_tss_norm
                      .Concat(high_S_no_tss).ToList();

            return classifications;
        }
    }
}
