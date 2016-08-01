using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.InternalNlp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Porter2_English
    {
        [TestMethod]
        public void Porter2_English_Test1()
        {
            Porter2_English stemmer = new Porter2_English();
            var result = stemmer.stem("optimizations");
            var result2 = stemmer.stem("optimizations result in better code");
            var result3 = stemmer.stem("Got News Series 36 Episode 5 hosted Jack Dee Joining Ian Hislop Miranda Hart & Paul 's absence Frank");
            var result4 = stemmer.stem("Series");
            var result5 = stemmer.stem("Episode");
            var result6 = stemmer.stem("hosted");
        }
    }
}
