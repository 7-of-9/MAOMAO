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
        public void Correlations_Test1()
        {
            // GET3 == GET2
            var get2_angus = mm_svc.Terms.Correlations.GetTermCorrelations("angus deayton", "richard curtis");
            var get2_paul = mm_svc.Terms.Correlations.GetTermCorrelations("paul merton", "ian hislop");
            var get2_magnus = mm_svc.Terms.Correlations.GetTermCorrelations("magnus carlsen", "chess");

            var get3 = mm_svc.Terms.Correlations.Get3(new List<corr_input>() {
                    new corr_input() { main_term = "angus deayton", corr_term_eq = "richard curtis" },
                    new corr_input() { main_term = "paul merton", corr_term_eq = "ian hislop" },
                    new corr_input() { main_term = "magnus carlsen", corr_term_eq = "chess" },
            });
            var get3_angus = get3.Where(p => p.main_term.ToLower() == "angus deayton").First();
            var get3_paul = get3.Where(p => p.main_term.ToLower() == "paul merton").First();
            var get3_magnus = get3.Where(p => p.main_term.ToLower() == "magnus carlsen").First();

            var missing3_angus = get2_angus.Where(p => !get3_angus.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));
            var missing3_paul = get2_paul.Where(p => !get3_paul.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));
            var missing3_magnus = get2_magnus.Where(p => !get3_magnus.correlations.Select(q => q.corr_term.ToLower()).Contains(p.corr_term.ToLower()));


            //var ret2 = mm_svc.Terms.Correlations.Get("angus deayton");
            //var hignfy = ret2.Where(p => p.name.ToLower() == "have i got news for you");

            //ret2 = mm_svc.Terms.Correlations.Get("magnus carlsen");
            //var chess = ret2.Where(p => p.name.ToLower() == "chess");

            //ret2 = mm_svc.Terms.Correlations.Get("chess");
            //var magnus = ret2.Where(p => p.name.ToLower() == "magnus carlsen");
        }
    }
}
