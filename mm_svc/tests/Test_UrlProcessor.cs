using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global;
using mm_svc;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_UrlProcessor
    {
        [TestMethod]
        public void MapWikiGoldenTerms_Test1()
        {
            using (var db = mm02Entities.Create()) {
                // testing "ajax" -- dismabiguation term logic

                //foreach (var url in db.urls.Where(p => p.nlp_suitability_score > 90).OrderByDescending(p => p.id).Take(10).ToListNoLock())
                {
                    //
                    // TODO -- more on this; picking wrong React disambig --
                    // DISAMBIG - PARTIAL WORD MATCH (#8): calais_term=React ==> wiki_disambiguation_term=React (media franchise) ... [6016816] #-1 #NS=2 (WIKI_NS_0)[6016816] > (best stemmed term word match across all ambig parent & calais terms)
                    var url = db.urls.Find(8427);

                    // remove wiki terms first
                    db.url_term.RemoveRange(db.url_term.Where(p => p.url_id == url.id && (p.term.term_type_id == (int)g.TT.WIKI_NS_0 || p.term.term_type_id == (int)g.TT.WIKI_NS_14)));
                    db.SaveChangesTraceValidationErrors();

                    // map wiki terms
                    var url_terms = db.url_term.Include("term").Where(p => p.url_id == url.id).ToListNoLock();
                    var terms_added = UrlProcessor.MapWikiGoldenTerms(url_terms.Where(p => p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14).ToList(), url);
                    db.SaveChangesTraceValidationErrors();

                    if (terms_added > 0) {
                        Debug.WriteLine($"added terms for url_id={url.id}");
                    }
                }
            }
        }
    } 
}
