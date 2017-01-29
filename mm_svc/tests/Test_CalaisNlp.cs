using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Reflection;
using System.IO;
using Newtonsoft.Json;

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

                int new_wiki_terms;
                mm_svc.CalaisNlp.MaintainWikiTypeTerms(nlp_info, -1, out new_wiki_terms);

                //int new_calais_pairs, new_calais_terms, new_wiki_pairs, new_wiki_terms;
                //mm_svc.CalaisNlp.ProcessResult(nlp_info, out new_calais_terms, out new_calais_pairs, out new_wiki_terms, out new_wiki_pairs);
                //mm_svc.CalaisNlp.MaintainTerms(nlp_info);
            }
        }

        [TestMethod]
        public void RemoveHashUrl_Calais()
        {
            var ret = mm_global.Util.RemoveHashFromUrl("https://medium.com/@jico/the-fine-art-of-javascript-error-tracking-bc031f24c659#.56mhnbp1w");
        }
    }
}
