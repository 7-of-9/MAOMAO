using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Discovery
{
    [TestClass]
    public class Test_Discovery
    {
        [TestMethod]
        public void UserDiscovery_Test0()
        {
            mm_svc.Discovery.UserDiscovery.Get(20);
        }
    }
}
