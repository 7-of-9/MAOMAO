using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Tests.Users
{
    [TestClass]
    public class Test_UserRegTopics
    {
        [TestMethod]
        public void UserRegTopics_BulkAdd_Test0()
        {
             mm_svc.UserTopics.AddUserTopics(15, new List<long> { 5011256 });
        }
    }
}
