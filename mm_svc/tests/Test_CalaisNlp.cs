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
    }
}
