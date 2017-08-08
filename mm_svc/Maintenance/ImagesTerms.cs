using mm_global;
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
            var tree = TopicTree.GetTopicTree(n_this, n_of);

            tree.ForEach(p => {
                // intra-process sharing of work
                if (Math.Abs(p.topic_name.GetHashCode()) % n_of == n_this - 1) {

                    g.LogLine($">> {n_this} OF {n_of}: taking: {p.topic_name}");

                    ProcessImages(p);
                }
            });

            g.LogLine("all done.");
        }

        private static void ProcessImages(TopicTree.TopicTermLink link, int n_this = 1, int n_of = 1)
        {
            // maintain image for parent term/topic
            using (var db = mm02Entities.Create()) {
                var term = db.terms.Find(link.topic_id);
                var filename = ImageNames.GetTermFilename(term);
                var master_jpeg = filename + "_M1.jpeg";
                var master_png = filename + "_M1.png";
                if (!AzureImageFile.Exists(AzureImageFileType.TermPicture, master_jpeg) && !AzureImageFile.Exists(AzureImageFileType.TermPicture, master_png)) {
                    Search_GoogImage.Search(out bool none_found, term.name, AzureImageFileType.TermPicture, filename);
                }
            }

            // recurse child topics
            link.child_topics.ForEach(p => ProcessImages(p));

            // recurse child suggestions
            link.child_suggestions.ForEach(p => ProcessImages(p));
        }
    }
}
