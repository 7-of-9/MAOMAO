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
        private const string gs_url = "https://www.google.com.sg/search?biw=1440&bih=776&tbm=isch{1}&q={0}&oq={0}";

        public static List<string> Search(
            out bool none_found,
            string search_term, Images.AzureImageFileType type, string filename = null,
            int save_top_count = 6, int save_white_count = 2, bool clipart = false
            )
        {
            none_found = false;
            var saved = new List<string>();
            if (Search_Goog.goog_rate_limit_hit == true)
                return saved;

            lock (Browser.lock_obj) {
                while (DateTime.Now.Subtract(Browser.last_access).TotalSeconds < Browser.min_seconds_between_requests) {
                    System.Threading.Thread.Sleep(100);
                }
            }

            var tbs = clipart ? "&tbs=itp:clipart" : "&tbs=itp:photo";
            var url = string.Format(gs_url, search_term, tbs);
            var wb = new WebBrowser(); // need this for reference to winforms to actually work at runtime

            HtmlAgilityPack.HtmlDocument doc = null;
            try {
                g.LogLine($"GOOG Image Search -- DOWNLOADING: {url}...");
                doc = new HtmlWeb().LoadFromBrowser(url);
            }
            catch(Exception ex) {
                g.LogException(ex);
                g.LogAllExceptionsAndStack(ex);
                return saved;
            }

            try {
                var imgs = doc.DocumentNode.Descendants("img").Where(p => p.Attributes["class"]?.Value == "rg_ic rg_i");
                //g.LogLine($"imgs.Count={imgs.Count()}"); //*
                var img_ndx = 0;
                var got_whites = 0;
                if (imgs.Count() == 0) {
                    g.LogWarn($"GOT NO IMAGES: url={url}");
                    none_found = true;
                    return saved;
                }
                foreach (var img in imgs) {
                    var src = img.Attributes["src"]?.Value;
                    if (!string.IsNullOrEmpty(src)) {
                        //g.LogLine($"src={src}"); //*
                        var jpeg_header = "data:image/jpeg;base64,";
                        var png_header = "data:image/png;base64,";
                        var jpeg = src.StartsWith(jpeg_header);
                        var png = src.StartsWith(png_header);
                        if (jpeg || png) {
                            if (!string.IsNullOrEmpty(filename)) {

                                var header = jpeg ? jpeg_header : png_header;
                                var base64 = src.Substring(header.Length);
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
                                            var ext = jpeg ? ".jpeg" : ".png";
                                            var content_type = jpeg ? "image/jpeg" : "image/png";

                                            // save first n images
                                            if (++img_ndx <= save_top_count) {
                                                var full_filename = filename + $"_M{img_ndx}{ext}";
                                                Images.AzureImageFile.Save(bytes, type, full_filename, content_type);
                                                saved.Add(full_filename);
                                            }

                                            // separate first n white backg images too too
                                            if (got_whites < save_white_count && tl.R >= 0xf0 && tl.G >= 0xf0 && tl.B >= 0xf0) {
                                                var full_filename = filename + $"_W{++got_whites}{ext}";
                                                Images.AzureImageFile.Save(bytes, type, full_filename, content_type);
                                                saved.Add(full_filename);
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
            return saved;
        }
    }
}
