using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global;
using mm_svc;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.GoldenPaths;

namespace tests
{
    [TestClass]
    public class Test_UrlProcessor
    {
        [TestMethod]
        public void CalcAndStoreUrlParentTerms_Dynamic_Test1()
        {
            using (var db = mm02Entities.Create()) {
                var test_url_id = 55;

                var url = db.urls.Include("url_term").Where(p => p.id == test_url_id).ToListNoLock().First();
                var wiki_url_terms = url.url_term.Where(p => p.wiki_S != null).ToList();

                var all_dynamic_parents = new List<gt_parent>();
                foreach (var wiki_term in wiki_url_terms.Where(p => p.tss_norm > 0.1)) {
                    var term_parents = GoldenParents.GetOrProcessParents_SuggestedAndTopics(wiki_term.term_id);
                    all_dynamic_parents.AddRange(term_parents.Where(p2 => p2.is_topic == false).ToList());
                }

                var data = UrlProcessor.CalcAndStoreUrlParentTerms_Dynamic(test_url_id, db, all_dynamic_parents);
            }
        }


        [TestMethod]
        public void ProcessUrl_Test1()
        {
            List<List<TermPath>> all_term_paths = null;

            // not mapping wiki terms: because no underlying tss>0 calais terms - fixed w/ 42.42 fallback -- rerun all...
            UrlProcessor.ProcessUrl(9337, out all_term_paths, reprocess_term_parents: true, reprocess_url_parents: true); 
        }

        [TestMethod]
        public void MapWikiGoldenTerms_Test1()
        {
            using (var db = mm02Entities.Create()) {

                //foreach (var url in db.urls.Where(p => p.nlp_suitability_score > 30)/*.OrderByDescending(p => p.nlp_suitability_score)*/.OrderByDescending(p => p.id).Take(10).ToListNoLock())
                {
                    //
                    // DISAMBIGS:
                    // url_id=8195 "dolls"  ==> maps to *multiple* wiki dolls tags (2 bad disambigs)
                    // url_id=8347 "the times" ==> maps to *multiple* wiki tags (3 bad disambigs)
                    // url_id=10441 "ice age"  ==> bad disambig
                    //
                    var url = db.urls.Find(10419);

                    // remove wiki terms first
                    db.url_term.RemoveRange(db.url_term.Where(p => p.url_id == url.id && (p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14)));
                    db.SaveChangesTraceValidationErrors();

                    // map wiki terms
                    var url_terms = db.url_term.Include("term").Where(p => p.url_id == url.id).ToListNoLock();
                    var terms_added = UrlProcessor.MapWikiGoldenTerms(url_terms.Where(p => p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14).ToList(), url, reprocess: true);
                    db.SaveChangesTraceValidationErrors();

                    if (terms_added > 0) {
                        Debug.WriteLine($"added terms for url_id={url.id}");
                    }
                }
            }
        }
    } 
}
