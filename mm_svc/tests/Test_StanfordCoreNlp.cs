using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.InternalNlp;
using mm_svc.InternalNlp.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_StanfordCoreNlp
    {
        [TestMethod]
        public void StanfordCoreNlp_Test1()
        {
            //mm_svc.CoreNlp.test1();
            //mm_svc.CoreNlp.test1();
            Debug.Write(Words.TokenizeExStopwords("Feminism feminist biology biologist is this now faster, oh! i don't want commas partcularly, nor full stops FFS! c'mon!! ?!!"));

            // stemming -- for beter title/desc matching?
            StanfordCoreNlp.tokenize_pos("Our predictions for more fake feminist causes, more harping less activism.related: FEMA & FEMINIST HUMBUGS");

            StanfordCoreNlp.tokenize_pos("this is a test string. I want tokens! goddamit!");
            
            StanfordCoreNlp.tokenize_pos("is this now faster, oh! i don't want commas partcularly, nor full stops FFS! c'mon!! ?!!");
        }
    }
}
