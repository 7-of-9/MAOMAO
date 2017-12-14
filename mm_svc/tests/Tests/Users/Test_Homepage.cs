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
        public void Homepage_Test_Both_NoPagination() {
            var ret = UserHomepage.Get(user_id: 281, page_num: null, per_page: 0, get_own: true, get_friends: true);
        }

        [TestMethod]
        public void Homepage_Test_Both_Pagination() {
            var ret = UserHomepage.Get(user_id: 281, page_num: 1, per_page: 10, get_own: true, get_friends: true);
        }

        [TestMethod]
        public void Homepage_Test_One_Pagination() {
            var ret = UserHomepage.Get(user_id: 281, page_num: 0, per_page: 50, get_own: true, get_friends: false);
        }
    }
}
