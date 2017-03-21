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
    public class Test_UrlRecorder
    {
        [TestMethod]
        public void RecordUrl_Test0()
        {
            long? url_id;
            var tld_title0 = UrlRecorder.RecordUrl("blah", "blah", out url_id);

            var tld_title2 = UrlRecorder.RecordUrl("www.blahblah.com.xyz", "test text", out url_id);
            var tld_title1 = UrlRecorder.RecordUrl("www.youtube.com", "test text", out url_id);
        }
    }
}
