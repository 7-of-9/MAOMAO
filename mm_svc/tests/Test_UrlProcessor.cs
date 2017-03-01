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
        public void ProcessUrl_Test1()
        {
            // testing most common parent
            UrlProcessor.ProcessUrl(1973, reprocess: true);   // hignfy
        }

        [TestMethod]
        public void MapWikiGoldenTerms_Test1()
        {
            using (var db = mm02Entities.Create()) {

                //foreach (var url in db.urls.Where(p => p.nlp_suitability_score > 30)/*.OrderByDescending(p => p.nlp_suitability_score)*/.OrderByDescending(p => p.id).Take(10).ToListNoLock())
                {
                    //
                    // DISAMBIGS: url_id=8195 dolls (calais) ==> maps to *multiple* wiki dolls tags (2 bad disambigs)
                    //    (done)  --> raised threshold to 30%
                    //
                    var url = db.urls.Find(8425);

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
