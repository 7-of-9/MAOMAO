using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Reflection;
using System.IO;
using Newtonsoft.Json;
using mmdb_model;

namespace tests
{
    [TestClass]
    public class Test_CalaisNlp
    {
        [TestMethod]
        public void ProcessNlpInfo_Calais()
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream("tests.Resources.cal_nlp1.json"))
            using (StreamReader reader = new StreamReader(stream))
            {
                string json = reader.ReadToEnd();
                dynamic nlp_info = JsonConvert.DeserializeObject<dynamic>(json);
                //var db = mm02Entities.Create();
                //var test_url_id = db.urls.FirstOrDefaultNoLock().id;

                //int mapped_wiki_terms, unmapped_wiki_terms;
                //mm_svc.CalaisNlp.MaintainWikiTypeTerms(nlp_info, -1, out mapped_terms, out unmapped_terms);

                var ret = mm_svc.CalaisNlp.ProcessNlpPacket(nlp_info, reprocessing_known_url: true);
            }
        }

        [TestMethod]
        public void RemoveHashUrl_Calais()
        {
            var ret = mm_global.Util.RemoveHashFromUrl("https://medium.com/@jico/the-fine-art-of-javascript-error-tracking-bc031f24c659#.56mhnbp1w");
        }
    }
}
