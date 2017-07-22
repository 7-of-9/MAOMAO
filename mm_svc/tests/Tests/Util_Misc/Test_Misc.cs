using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Misc
    {
        [TestMethod]
        public void Test_Hashing_MD5()
        {
            var hash1 = mm_svc.Util.Hashing.MD5("111847798352203734986");
            var hash2 = mm_svc.Util.Hashing.MD5("111772942267561603307");
        }
    }
}
