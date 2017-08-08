using mm_svc.Discovery;
using mm_svc.Images;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Maintenance
{
    public static class ImagesTerms
    {
        public static void Maintain(int n_this = 1, int n_of = 1)
        {
            var tree = TopicTree.GetTopicTree();
            tree.ForEach(p => ProcessImages(p));
        }

        private static void ProcessImages(TopicTree.TopicTermLink link)
        {
            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(link.topic_id);
                var filename = ImageNames.GetTermFilename(term);
                var master_jpeg = filename + "_M1.jpeg";
                var master_png = filename + "_M1.png";
                if (!AzureImageFile.Exists(AzureImageFileType.TermPicture, master_jpeg) && !AzureImageFile.Exists(AzureImageFileType.TermPicture, master_png)) {
                    bool none_found;
                    Search_GoogImage.Search(out none_found, term.name, AzureImageFileType.TermPicture, filename);
                }
            }
            link.children.ForEach(p => ProcessImages(p));
        }
    }
}
