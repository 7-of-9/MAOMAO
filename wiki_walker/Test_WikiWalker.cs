using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.InternalNlp;
using mm_svc.InternalNlp.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace wiki_walker.tests
{
    [TestClass]
    public class Test_WikiWalker
    {
        [TestMethod]
        public void WikiWalker_Test1()
        {
            Walker_NamespaceCounter.Go();
        }
    }
}
