using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace tests
{
    [TestClass]
    public class Test_Flow
    {
        [TestMethod]
        public void TestFlow_Test0()
        {
            var test_url = "http://datagenetics.com/blog/march12011/index.html";

            // (1) record new URL
            long? url_id;
            long? tld_topic_id;
            var tld_title = UrlRecorder.RecordUrl(test_url,"test checksum", "test text", out url_id, out tld_topic_id);

            // (2) PUT NLP for new URL
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream("tests.Resources.cal_nlp2.json"))
            using (StreamReader reader = new StreamReader(stream)) {
                string json = reader.ReadToEnd();
                dynamic nlp_info = JsonConvert.DeserializeObject<dynamic>(json);

                nlp_info.url.href = test_url;

                var ret = mm_svc.CalaisNlp.ProcessNlpPacket_URL(nlp_info, reprocessing_known_url: false);
            }
        }
    }
}
