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
            ShareCreator.CreateShare(user_id: 271, target_user_id: null, url_id: null, disc_url_id: 1276035);
        }

        [TestMethod]
        public void AcceptShare_Test0()
        {
            var ok = ShareAcceptor.AcceptShare(5, "QIZYJS4K");
        }

        [TestMethod]
        public void GetSingleUrlShare_Test0()
        {
            var data = mm_svc.UserHomepage.GetSingleShareUrl(user_id: 281, share_code: "baec26f9");
        }
    }
}
