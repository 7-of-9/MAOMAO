using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc;

namespace tests
{
    [TestClass]
    public class Test_SiteInfo
    {
        [TestMethod]
        public void GetSiteAllowable()
        {
            bool returned_from_db;

            var awis_site = mm_svc.SiteInfo.GetOrQueryAwis("plarium.com", out returned_from_db);
            //var awis_site = mm_svc.SiteInfo.GetOrQueryAwis("docs.google.com", out returned_from_db);
            bool allowable = mm_svc.SiteInfo.IsSiteAllowable(awis_site);
        }

        [TestMethod]
        public void GetSiteInfo()
        {
            bool  returned_from_db;    

            mm_svc.SiteInfo.GetOrQueryAwis("www.hungry-girl.com", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("login.microsoftonline.com", out returned_from_db);


            mm_svc.SiteInfo.GetOrQueryAwis("http://lichess.org", out  returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("http://chess.com", out returned_from_db);


            mm_svc.SiteInfo.GetOrQueryAwis("http://www.dbs.com.sg/", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("https://internet-banking.dbs.com.sg/IB/Welcome", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("http://xnxx.com", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("http://www.xnxx.com", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("https://www.google.co.uk", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("https://google.co.uk", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("https://google.com", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("https://www.google.com", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("http://www.pinterest.com", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("http://pinterest.com", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("http://stackoverflow.com", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("https://www.stackoverflow.com", out returned_from_db);

            mm_svc.SiteInfo.GetOrQueryAwis("https://www.sc.com/sg/", out returned_from_db);
            mm_svc.SiteInfo.GetOrQueryAwis("https://ibank.standardchartered.com.sg/nfs/login.htm", out returned_from_db);
        }
    }
}
