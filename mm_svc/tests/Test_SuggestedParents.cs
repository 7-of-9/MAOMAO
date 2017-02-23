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
    public class Test_SuggestedParents
    {
        // tests processing algo, per notes in CalculatePathsToRoot_Test1
        [TestMethod]
        public void GetSuggestedParents_Test1()
        {
            // observations: (1) parents seem to be a bit BETTER for NS14 types: maybe should exclude NS0 from SuggestedParent for URL?
            //

            var test_terms_ids = new List<long>() {
                7088192, // "boris (band)" -- duplicates by name, ns14/0

                5667534, // "cross platform software"

                6016816, // React (media franchise)
                7151070, // React (JavaScript library)

                11220299, // Amorphous carbon -- https://en.wikipedia.org/wiki/Portal:Nanotechnology term
                12332349, // Ajax -- disambiguation term

                7514235, // Reactive programming

                5101699, // EDM
                5140670, // September 11 **
                8080633, // french defence

                5011841, // cats

                5552478, // NASDAQ **
                7479589, // Pixar *

                5250600, // Gundam
                5078100, // Superheroes
                5871074, // Hypertrophy 
                6334777, // Wesley So
                5747890,  //  Ballet
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
            };

            using (var db = mm02Entities.Create()) {
                foreach (var term_id in test_terms_ids) {
                    // fetch stored paths to root (raw)
                    var root_paths = GoldenPaths.GetOrProcessPathsToRoot(term_id);

                    //
                    // NEXT: (1) TODO -- retest ProcessPathsToRoot() now that walker has fewer exclusions;
                    //            (a) ProcessPathsToRoot will need exclusions, e.g. "Redirects_to_disambiguation_pages" ***
                    //
                    //              > actually, not necesssary if calais->wiki matcher actively *excludes* any disambiguation terms?
                    //                i.e. if any term.name like '{calais_name} (%' > then use one or all disambiguation wiki terms
                    //                     else, use exact matching wiki term.name = '{calais_name}'
                    //
                    //              >>> (1.1) frmMain -- UrlProcessor -- should match disambiguation wiki terms, e.g. Calais "Ajax" -> Wiki "Ajax (Programming)"
                    //
                    //            (b) pages now linking to (e.g.) "nanotechnology_portal", need special handling, i.e. strip " portal" from parents
                    //              DISREGARD for now -- can't see it in first test case for whatever reason; revisit if it interferes with higher level processing
                    //
                    //       (2) frmMain -- UrlCategorizer: looking for commonality of suggested parent/related across URL wiki terms (use stemming?)
                    //
                    var r = GoldenParents.CalcSuggestedParents(root_paths);
                }
            }
        }
    }
}
