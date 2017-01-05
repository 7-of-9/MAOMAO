using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace tests
{
    [TestClass]
    public class Test_AWIS
    {
        [TestMethod]
        public void GetUrlInfo()
        {
            mm_aws.AWIS.GetTldInfo("www.lichess.org");

            mm_aws.AWIS.GetTldInfo("www.sc.com");


            mm_aws.AWIS.GetTldInfo("www.uob.com.sg");
            mm_aws.AWIS.GetTldInfo("uob.com.sg");

            mm_aws.AWIS.GetTldInfo("uob.com");
            mm_aws.AWIS.GetTldInfo("www.uob.com");


            mm_aws.AWIS.GetTldInfo("dbs.com");
            mm_aws.AWIS.GetTldInfo("dbs.com.sg"); // .SG not returning category info!

        }
    }
}
