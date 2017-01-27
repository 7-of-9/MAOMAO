using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Reflection;
using System.IO;
namespace tests
{
    [TestClass]
    public class Test_CalaisNlp
    {
        [TestMethod]
        public void ProcessNlpInfo_Calais()
        {
            var assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream("tests.Resources.cal_nlp2.json"))
            using (StreamReader reader = new StreamReader(stream))
            {
                string result = reader.ReadToEnd();
                // TODO: JSON parse
                //dynamic nlp_info = Json.Decode(result);

                int new_pairs, new_terms;
                mm_svc.CalaisNlp.ProcessResult(null, out new_pairs, out new_terms);
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
