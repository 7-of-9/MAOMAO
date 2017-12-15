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
            var ret = UserHomepage.Get(user_id: 281, page_num: 0, per_page: 50, get_own: false, get_friends: true);
            var flattened = ret.received.SelectMany(p => p.shares_received);

            var share_id = ret.urls_received[0].from_share_id;
            var test = flattened.Single(p => p.share_id == share_id); // no pointer to parent share orginator
            var test2 = ret.received.Where(p => p.shares_received.Any(p2 => p2.share_id == share_id));
        }
    }
}
