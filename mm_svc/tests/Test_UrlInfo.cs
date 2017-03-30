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
    public class Test_UrlInfo
    {
        [TestMethod]
        public void GetTopicsAndSuggestions_Test0()
        {
            var topics = new List<UrlInfo.UrlParent>();
            var suggestions = new List<UrlInfo.UrlParent>();
            long? tld_topic_id;
            UrlInfo.UrlParent url_title_term = null;
            UrlInfo.GetFilteredTopicsAndSuggestions(7807, out topics, out suggestions, out url_title_term, out tld_topic_id);
        }
    }
}
