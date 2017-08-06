using HtmlAgilityPack;
using mm_global;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;

namespace mm_svc.Discovery
{

    public static class Search_GoogImage
    {
        private const string gs_url = "https://www.google.com.sg/search?biw=1440&bih=776&tbm=isch{1}&q={0}";

        public static int Search(
            string search_term, string file_name = null, int save_top_count = 6, int save_white_count = 2, bool clipart = false)
        {
            var saved_count = 0;
            if (Search_Goog.goog_rate_limit_hit == true)
                return 0;

            lock (Browser.lock_obj) {
                while (DateTime.Now.Subtract(Browser.last_access).TotalSeconds < Browser.min_seconds_between_requests) {
                    System.Threading.Thread.Sleep(100);
                }
            }

            var tbs = clipart ? "&tbs=itp:clipart" : "";
            var url = string.Format(gs_url, search_term, tbs);
            var wb = new WebBrowser(); // need this for reference to winforms to actually work at runtime

            var doc = new HtmlWeb().LoadFromBrowser(url);
            try {
                var imgs = doc.DocumentNode.Descendants("img").Where(p => p.Attributes["class"]?.Value == "rg_ic rg_i");
                var img_ndx = 0;
                var got_whites = 0;
                foreach (var img in imgs) {
                    var src = img.Attributes["src"]?.Value;
                    if (!string.IsNullOrEmpty(src)) {
                        var search = "data:image/jpeg;base64,";
                        if (src.StartsWith(search)) {
                            if (!string.IsNullOrEmpty(file_name)) {

                                var base64 = src.Substring(search.Length);
                                var bytes = Convert.FromBase64String(base64);
                                Image image = null;
                                try {
                                    MemoryStream ms = new MemoryStream(bytes, 0, bytes.Length);
                                    ms.Write(bytes, 0, bytes.Length);
                                    image = Image.FromStream(ms, true);
                                }
                                catch { }
                                using (image) {
                                    if (image != null) {
                                        using (Bitmap bmp = new Bitmap(image)) {
                                            var tl = bmp.GetPixel(0, 0);

                                            // save first n images
                                            if (++img_ndx <= save_top_count)
                                                saved_count += Images.AzureFile.Save(bytes, file_name + $"_M{img_ndx}.jpeg", "image/jpeg");

                                            // separate first n white backg images too too
                                            if (got_whites < save_white_count && tl.R >= 0xf0 && tl.G >= 0xf0 && tl.B >= 0xf0) {
                                                saved_count += Images.AzureFile.Save(bytes, file_name + $"_W{++got_whites}.jpeg", "image/jpeg");
                                            }
                                            if (got_whites == save_white_count && img_ndx >= save_top_count)
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                lock (Browser.lock_obj) {
                    Browser.last_access = DateTime.Now;
                }
            }
            finally {
                doc = null;
                GC.Collect();
            }
            return saved_count;
        }
    }
}
