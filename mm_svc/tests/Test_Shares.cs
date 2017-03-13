using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Shares
    {
        [TestMethod]
        public void CreateShare_Test0()
        {
            ShareCreator.CreateShare(2, 5, null, null, true);
        }

        [TestMethod]
        public void AcceptShare_Test0()
        {
            var ok = ShareAcceptor.AcceptShare(5, "QIZYJS4K");
        }
    }
}
