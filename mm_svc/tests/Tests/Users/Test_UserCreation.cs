using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_UserCreation
    {
        [TestMethod]
        public void NewUser_TestUser0()
        {
            var test_user = mm_svc.UserRegister.CreateNewTestUser();
        }
    }
}
