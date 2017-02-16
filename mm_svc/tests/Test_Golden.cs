using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Golden
    {
        // tests processing algo, per notes in CalculatePathsToRoot_Test1
        [TestMethod]
        public void ProcessPathsToRoot_Test2()
        {
            var test_terms_ids = new List<long>() {
                5988770, // rosario dawson
                5997771, // bernie sanders
                5078100, // Superheroes
                5209410, // American feminists
                5871074, // Hypertrophy 
                6334777, // Wesley So
                5249821, // Batman
                8080633, // french defence
                5131916, // Tom and Jerry
            };

            using (var db = mm02Entities.Create()) {
                foreach (var term_id in test_terms_ids) {

                    // fetch stored paths to root (raw)
                    var term = db.terms.AsNoTracking().Include("gt_path_to_root1").Include("gt_path_to_root1.term").Single(p => p.id == term_id);
                    var root_paths = GoldenPaths.ParseStoredPathsToRoot(term);
                    if (root_paths.Count == 0) {
                        GoldenPaths.RecordPathsToRoot(term_id);
                    }
                 
                    // we end up with multiple parent cat chains (each from one path to root)
                    // we must decide which to use! e.g.
                    //French Defence // Chess openings #NS=5 / ... / Chess #NS=12 / ... / Games #NS=8 / Main topic classifications #NS=2
                    //French Defence // Chess openings #NS=5 / ... / Game theory #NS=9 / ... / Mathematics #NS=13 / Main topic classifications #NS=2

                    /*
                     * TODO: need more samples -- but something like -- count recurrances of each high ns_norm at each L
                     * here, "chess" (by virtue of "chess titles") and "games" are predominant - so implied: wesley so / chess / games
L=1 High NS_norm (>0.3) Paths: 
	 ... Cavite (NS_norm=0.58 NSLW=3.5 #NS=7) / Geocodes (NS_norm=0.25 NSLW=0.8 #NS=3) / Geography (NS_norm=1.00 NSLW=2.0 #NS=12)
	 ... Chess titles (NS_norm=0.44 NSLW=2.0 #NS=4) / Sports (NS_norm=1.00 NSLW=2.3 #NS=9) / Games (NS_norm=0.89 NSLW=1.3 #NS=8)
	 ... Cavite (NS_norm=0.54 NSLW=3.5 #NS=7) / 1610s (NS_norm=0.31 NSLW=1.0 #NS=4) / Decades (NS_norm=0.23 NSLW=0.5 #NS=3) / Chronology (NS_norm=0.62 NSLW=1.0 #NS=8) / History (NS_norm=1.00 NSLW=1.3 #NS=13)
	 ... Chess titles (NS_norm=0.33 NSLW=2.0 #NS=4) / Chess (NS_norm=1.00 NSLW=3.0 #NS=12) / Games (NS_norm=0.67 NSLW=1.3 #NS=8)
L=2 High NS_norm (>0.3) Paths: 
	 ... Sports (NS_norm=1.00 NSLW=2.3 #NS=9) / Games (NS_norm=0.89 NSLW=1.3 #NS=8)
	 ... 1610s (NS_norm=0.31 NSLW=1.0 #NS=4) / Decades (NS_norm=0.23 NSLW=0.5 #NS=3) / Chronology (NS_norm=0.62 NSLW=1.0 #NS=8) / History (NS_norm=1.00 NSLW=1.3 #NS=13)
	 ... Chess (NS_norm=1.00 NSLW=3.0 #NS=12) / Games (NS_norm=0.67 NSLW=1.3 #NS=8)
	 ... Chess (NS_norm=1.00 NSLW=3.0 #NS=12) / Games (NS_norm=0.67 NSLW=1.3 #NS=8)
L=3 High NS_norm (>0.3) Paths: 
	 ... Geography (NS_norm=1.00 NSLW=2.0 #NS=12)
	 ... Games (NS_norm=0.89 NSLW=1.3 #NS=8)
	 ... Games (NS_norm=0.67 NSLW=1.3 #NS=8)
	 ... Games (NS_norm=0.67 NSLW=1.3 #NS=8)
L=4 High NS_norm (>0.3) Paths: 
	 ... Chronology (NS_norm=0.62 NSLW=1.0 #NS=8) / History (NS_norm=1.00 NSLW=1.3 #NS=13)
     */

                    // process paths
                    GoldenPaths.ProcessPathsToRoot(root_paths);

                    // Wesley So -- reasonable data at level 2 > 0.8 NS_norm
                }
            }
        }

        [TestMethod]
        public void CalculatePathsToRoot_Test1()
        {

            //
            // -- precalc tree: for each calais term raw, used pre-calc'd tree to record "likely parent cat" -- maybe sometimes NO likely parent cat. keep in mind.
            // this might not work all the time; but it might work most of the time.
            // (naive groupig of raw calais terms tested -- and just doesn't cut it; for URLs where no parent cat term is returned, *it can never work*)
            //
            // recalc all term trees first -- then test post-processing of term trees (as below)
            // post-processing to result in 1-2 parent cats for each root term -- to be saved, and calc'd only for new root terms
            //


            // works -- just pick close high NS# parent (note: count of tree term names is not sufficient at all)
            //GoldenPaths.CalculatePathsToRoot(6334777);
            // Wesley So // Chess grandmasters #NS=2 / Chess titles #NS=4 / Chess #NS=12 / Competitive games #NS=2 / Games #NS=8 / Main topic classifications #NS=2
            //                                                                      ^^^


            // not perfect -- best naive match is "films", but maybe closer parent "animated films" could inherit some boost? -- 2 level cat might get these two...
            //GoldenPaths.CalculatePathsToRoot(5131916); // Tom and Jerry // Animated film series #NS=2 / Animated films #NS=3 / Films by type #NS=2 / Films #NS=11 / Works by medium #NS=2 / Creative works #NS=3 / Arts #NS=7 / Main topic classifications #NS=2
            //                                                                                                   ^^^                                   ^^^


            // multiple potential parents -- ** different trees **
            // (should hard-code some trivial exclusions, e.g. Superheroes // ... People #NS=11)
            //GoldenPaths.CalculatePathsToRoot(5078100); // Superheroes // Superheroes - Heroes by role #NS=2 / Heroes #NS=9 / Mythological characters #NS=2 / People #NS=11 / Main topic classifications #NS=2
            //                                                                                                           ^^^                                  
            //                                           // Superheroes // Science fiction characters #NS=2 / Science fiction #NS=9 / Science and culture #NS=2 / Science in society #NS=4 / Society #NS=8 / Main topic classifications #NS=2
            //                                                                                                                  ^^^       


            // works - but several exclusions needed...
            // (should exclude Batman // ...  Fictional characters #NS=6 ... People #NS=11)
            //                 Batman // ... Area studies #NS=6 / Humanities #NS=7 / Culture #NS=11 ...)
            //                 Batman // ... American culture #NS=4 / American studies #NS=4 / Area studies #NS=6 / Humanities #NS=7 / Culture #NS=11 / Society #NS=8 / Main topic classifications #NS=2
            //GoldenPaths.CalculatePathsToRoot(5249821);  // Batman - American superheroes #NS=1 / Superheroes by type #NS=2 / Superheroes #NS=6 / Fictional characters by superhuman feature or ability #NS=2 / Fictional characters #NS=6 / People #NS=11 / Main topic classifications #NS=2
            //                                                                                                                              ^^^                                  


            // maybe trigger NS# threshold needs to be a % of max. NS# -- after exclusions, i.e.  excluding People #NS=11  et al
            // some items should not be trivially excluded, e.g. ... History #NS=13 - need high weighting for proximity, 
            // so that Feminism in the United States #NS=4 ... outweighs ... History #NS=13 higher up.
            //GoldenPaths.CalculatePathsToRoot(5209410);  // American feminists - Feminists by nationality #NS=2 / Feminists #NS=3 / People by political orientation #NS=2 / People #NS=11 / Main topic classifications #NS=2
            //                                                                                                               ^^^                                  
            //                                               Feminism in the United States #NS=4 / Women in history #NS=2 / History by topic #NS=2 / History #NS=13 / Main topic classifications #NS=2
            //                                                                               ^^^                                  


            // works well -- actually gives a nice hierarchy of parent cats (Physical exercise / Sports)
            //  but  picks out some unsuitable (very close, very high #NS) items
            // SO INSTEAD OF HARD-CODING EXCLUSIONS, maintain an admin tool ability to manually mark terms as excluded from parent cat eligibility, e.g: Muscular system #NS=8
            // Hypertrophy // Muscular system #NS=8 / Musculoskeletal system #NS=4 / Dance science #NS=3 / Dance #NS=10 / Physical exercise #NS=6 / Sports #NS=9 / Games #NS=8 / Main topic classifications #NS=2
            //
            //GoldenPaths.CalculatePathsToRoot(5871074); // Hypertrophy // Physical exercise #NS=6 / Sports #NS=9 / Games #NS=8 / Main topic classifications #NS=2
            //                                                                                 ^^^           ^^^
            //
            //                                           // Hypertrophy // Muscular system #NS=8 / Musculoskeletal system #NS=4 / Dance science #NS=3 / Dance #NS=10 / Physical exercise #NS=6 / Sports #NS=9 / Games #NS=8 / Main topic classifications #NS=2
            //                                                        NEEDS MANUAL EXCLUSION! ^^
            // note: once an excluded term is hit in the tree, we should exclude its parents - in this e.g. Dance #NS=10 by virtue of Muscular system #NS=8


            // good, but challengning -- how to exclude Mathematics #NS=13 but include Games #NS=8 ??
            // maybe must take maximum path Chess openings #NS=5 / Chess #NS=12
            // over alternate path          Chess openings #NS=5 / Game theory #NS=9
            // AND cap maximum reach to +2 levels from root...
            //GoldenPaths.CalculatePathsToRoot(8080633);
            //French Defence // Chess openings #NS=5 / Chess theory #NS=4 / Chess #NS=12 / Competitive games #NS=2 / Games #NS=8 / Main topic classifications #NS=2
            //French Defence // Chess openings #NS=5 / Chess theory #NS=4 / Game theory #NS=9 / Fields of mathematics #NS=3 / Mathematics #NS=13 / Main topic classifications #NS=2

        }

        //[TestMethod]
        //public void ProcessSuggested_Test1()
        //{
        //    using (var db = mm02Entities.Create())
        //    {
        //        Correlations.cache_disable = true;

        //        // test country exclusion for golden-suggest processing
        //        var count1 = GoldenSuggestions.ProcessSuggested(db.terms.Where(p => p.name == "America").ToListNoLock(), db.urls.First().id);
        //        var count2 = GoldenSuggestions.ProcessSuggested(db.terms.Where(p => p.name == "Tom and Jerry").ToListNoLock(), db.urls.First().id);
        //    }
        //}

        //[TestMethod]
        //public void ProcessSuggested_Test2()
        //{
        //    using (var db = mm02Entities.Create())
        //    {
        //        Correlations.cache_disable = true;

        //        // test max gold level for golden-suggest processing
        //        var count1 = GoldenSuggestions.ProcessSuggested(db.terms.Where(p => p.name == "white house").ToListNoLock(), db.urls.First().id);
        //    }
        //}
    }
}
