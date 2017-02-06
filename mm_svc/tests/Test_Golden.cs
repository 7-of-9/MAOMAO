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
        [TestMethod]
        public void CalculatePathsToRoot_Test1()
        {
            // todo... rerun/tune these after full import is done...
            
            //GoldenPaths.CalculatePathsToRoot(5078100); // superheroes
            //GoldenPaths.CalculatePathsToRoot(5249821); // batman
            //GoldenPaths.CalculatePathsToRoot(5209410); // american feminists
            GoldenPaths.CalculatePathsToRoot(5871074); // hypertrophy
            //GoldenPaths.CalculatePathsToRoot(8080633); // french defence
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
