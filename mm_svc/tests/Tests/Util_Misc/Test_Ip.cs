using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Util.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Util_Misc {
    [TestClass]
    public class Test_Ip {
        [TestMethod]
        public void IpLookup_Test0()
        {
            var test_ips = new List<string>() {
            "69.147.92.42", // synnvale?
            "180.254.108.93", // ID,
            "175.156.244.65", // SG
            "175.139.93.89", // MY
            "130.105.246.138", // PH
            "182.148.102.186", // CN
            "209.152.83.118", // US
            "223.39.130.39", // KR
            "80.76.167.69", // QA ?
            "120.18.137.4", // AU
            };

            foreach (var test_ip in test_ips) {
                var city = IpParser.GetCity(test_ip);
                var state = IpParser.GetState(test_ip);
                var country = IpParser.GetCountry(test_ip);
                Debug.WriteLine($"{test_ip} - city={city} state={state} country={country}");
            }
        }
    }
}
