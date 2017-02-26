using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Terms;
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
    public class Test_SuggestedParents
    {

        List<long> test_terms_ids = new List<long>() {
                5067658, // netflix
                5747890, //  Ballet 

                7479589, // Pixar -- NO ROOT PATHS CONTAINING EXPECTED "animation" ... similar root paths issue as Ballet? or maybe not;
                         // its paths are quite extensive, just not including "animation" in the abstract; that may be reasonable/correct
                         // simply following the data itself: it does have lots of results for "animation company" after all

                // pixar get PtR perf - longs, no terms: 51secs for 295 paths
                // pixar get PtR perf - terms: 57secs for 295 paths
                // pixar - terms, w/ cache -- DONE: 13.7929475 sec(s) - root_paths.Count=289

                5250600, // Gundam
                5078100, // Superheroes
                5871074, // Hypertrophy 
                6334777, // Wesley So
                5374213, // Formula One
                5115096, // StarCraft
                11418240, // Calvinism
                7479589,  // Pixar
                9790110,  // Dream Theater
                10413303, // Alternative rock
                5209410, // American feminists

                5249821, // Batman
                5131916, // Tom and Jerry
                5988770, // rosario dawson
                5997771, // bernie sanders

                7088192, // "boris (band)" -- duplicates by name, ns14/0

                5140670, // September 11 **
                5101699, // EDM

                7355885, // node.js

                8080633, // french defence
                5011841, // cats

                6016816, // React (media franchise)
                5667534, // cross platform software
                7151070, // React (JavaScript library)
                11220299, // Amorphous carbon -- https://en.wikipedia.org/wiki/Portal:Nanotechnology term
                12332349, // Ajax -- disambiguation term
                7514235, // Reactive programming

                5552478, // NASDAQ **
            };

        [TestMethod]
        public void GetTopics_Test0()
        {
            using (var db = mm02Entities.Create()) {
                foreach (var term_id in test_terms_ids) {

                    var term = db.terms.Find(term_id);

                    GoldenPaths.ProcessAndRecordPathsToRoot(term_id, reprocess: true);

                    var paths = GoldenPaths.GetOrProcessPathsToRoot(term_id);

                    var topics = GoldenTopics.GetTopics(paths);
                    topics.ForEach(p => Debug.WriteLine($"{term} -> ({p.t.name} S={p.S} S_norm={p.S_norm})"));
                }
            }
        }

        // tests processing algo, per notes in CalculatePathsToRoot_Test1
        [TestMethod]
        public void GetSuggestedParents_Test1()
        {
            // observations: (1) parents seem to be a bit BETTER for NS14 types: maybe should exclude NS0 from SuggestedParent for URL?
           
            using (var db = mm02Entities.Create()) {
                foreach (var term_id in test_terms_ids) {

                    var root_paths = GoldenPaths.GetOrProcessPathsToRoot(term_id);

                    var r = GoldenParents.CalcDynamicSuggestedParents(root_paths);
                }
            }
        }
    }
}
