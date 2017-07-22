using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Homepage
    {
        [TestMethod]
        public void Homepage_Test0()
        {
            var ret = UserHomepage.Get(15);
        }
    }
}
