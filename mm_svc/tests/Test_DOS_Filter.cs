using Microsoft.VisualStudio.TestTools.UnitTesting;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_DOS_Filter
    {
        [TestMethod]
        public void Test_DOS_0()
        {
            var client = new RestClient("http://mmapi00.azurewebsites.net");

            for (int i = 0; i < 100; i++) {
                var request = new RestRequest("/api/allowable", Method.GET);
                request.AddParameter("tld", "www.lamoto.co.uk");
                IRestResponse response = client.Execute(request);
                var content = response.Content; // raw content as string
                Debug.WriteLine(content.ToString());
            }
        }
    }
}
