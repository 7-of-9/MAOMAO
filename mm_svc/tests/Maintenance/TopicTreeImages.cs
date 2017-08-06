using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Discovery;
using mm_svc.Images;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Maintenance
{
    [TestClass]
    public class TopicTreeImages
    {
        [TestMethod]
        public void MM_Images_FetchForTopicTree()
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;
            var tree = TopicTree.GetTopicTree();
            tree.ForEach(p => ProcessImages(p));
        }

        private void ProcessImages(TopicTree.TopicTermLink link)
        {
            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(link.topic_id);
                var filename = ImageNames.GetTermFilename(term);
                var master_jpeg = filename + "_M1.jpeg";
                var master_png = filename + "_M1.png";
                if (!AzureFile.Exists(master_jpeg) && !AzureFile.Exists(master_png)) {
                    Search_GoogImage.Search(term.name, filename);
                }
            }
            link.children.ForEach(p => ProcessImages(p));
        }
    }
}
