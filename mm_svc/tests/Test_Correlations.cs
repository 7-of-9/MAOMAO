using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static mm_svc.Terms.Correlations;

namespace tests
{
    [TestClass]
    public class Test_Correlations
    {
        [TestMethod]
        public void Correlations_Test3()
        {
            mm_svc.Terms.CorrelatedGoldens.cache_disable = true;
            var data = mm_svc.Terms.CorrelatedGoldens.GetGorrelatedGoldenTerms_Ordered("Lichess");
        }
        
        [TestMethod]
        public void Correlations_Test2()
        {
            mm_svc.Terms.Correlations.cache_disable = true;
            var data = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = "chess", corr_term_eq = null });
            var terms = data.SelectMany(p => p.corr_terms).OrderByDescending(p => p.corr_for_main);
            //var data2 = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = "Lichess", corr_term_eq = "chess" });
        }

        [TestMethod]
        public void Correlations_Test1()
        {
            // GET3 == GET2
            var get2_angus = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = "angus deayton", corr_term_eq = "richard curtis" });
            var get2_paul = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = "paul merton", corr_term_eq = "ian hislop" });
            var get2_magnus = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = "magnus carlsen", corr_term_eq = "chess" });

            // get 3 = DB batch mode version of get2; abandoned for now, in favour of static cache
            //var get3 = mm_svc.Terms.Correlations.Get3(new List<corr_input>() {
            //        new corr_input() { main_term = "angus deayton", corr_term_eq = "richard curtis" },
            //        new corr_input() { main_term = "paul merton", corr_term_eq = "ian hislop" },
            //        new corr_input() { main_term = "magnus carlsen", corr_term_eq = "chess" },
            //});
            //var get3_angus = get3.Where(p => p.main_term.ToLower() == "angus deayton").First();
            //var get3_paul = get3.Where(p => p.main_term.ToLower() == "paul merton").First();
            //var get3_magnus = get3.Where(p => p.main_term.ToLower() == "magnus carlsen").First();

            //var missing3_angus = get2_angus.Where(p => !get3_angus.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));
            //var missing3_paul = get2_paul.Where(p => !get3_paul.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));
            //var missing3_magnus = get2_magnus.Where(p => !get3_magnus.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));
        }
    }
}
