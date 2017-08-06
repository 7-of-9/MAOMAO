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
        private const string gs_url = "https://www.google.com.sg/search?biw=1440&bih=776&tbm=isch&q={0}";

        public static List<string> Search(string search_term, string file_name = null)
        {
            if (Search_Goog.goog_rate_limit_hit == true)
                return null;

            //g.LogInfo($">>> GOOG IMAGE SEARCH: {search_term}");
            //HtmlDocument doc = null;
            //try {
            //    doc = Browser.Fetch(string.Format(gs_url, search_term));
            //}
            //catch (ApplicationException aex) {
            //    if (aex.Message == "RATE LIMIT HIT") {
            //        Search_Goog.goog_rate_limit_hit = true;
            //        return null;
            //    }
            //} 
            //if (doc == null)
            //    return null;

            var url = string.Format(gs_url, search_term);
            var wb = new WebBrowser(); // need this for reference to winforms to actually work at runtime
            //wb.Navigate(url);
            //Thread.Sleep(1000);

            var doc = new HtmlWeb().LoadFromBrowser(url);
         
            //var aa = doc.DocumentNode.Descendants("a").Where(p => p.Attributes["jsname"]?.Value == "hSRGPd");// && p.Attributes["href"]?.Value?.StartsWith("/imgres?") == true);
            //foreach (var a in aa) {
                //var href = a.Attributes["href"]?.Value;
                //if (!string.IsNullOrEmpty(href)) {
                //    var search = "imgurl=";
                //    var ndx_start = href.IndexOf(search);
                //    if (ndx_start != -1) {
                //        var ndx_end = href.IndexOf("&amp;imgrefurl");
                //        if (ndx_end != -1) {
                //            var img_url = href.Substring(ndx_start + search.Length, ndx_end - ndx_start - search.Length);
                //            img_url = HttpUtility.UrlDecode(img_url); // access denied when downloading this!
                //        }
                //    }
                //}
            //}

            var imgs = doc.DocumentNode.Descendants("img").Where(p => p.Attributes["class"]?.Value == "rg_ic rg_i");
            var img_ndx = 0;
            //var got_black = false;
            var got_white = false;
            foreach (var img in imgs) {
                img_ndx++;
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

                                        if (img_ndx == 1) // always save first image
                                            Images.AzureFile.Save(bytes, file_name + ".jpeg", "image/jpeg");

                                        else { // save first black and first white backg images also
                                            //if (!got_black && tl.R == 0 && tl.G == 0 && tl.B == 0) {
                                            //    Images.AzureFile.Save(bytes, file_name + "_B.jpeg", "image/jpeg");
                                            //    got_black = true;
                                            //}
                                            if (!got_white && tl.R == 0xff && tl.G == 0xff && tl.B == 0xff) {
                                                Images.AzureFile.Save(bytes, file_name + "_W.jpeg", "image/jpeg");
                                                got_white = true;
                                            }
                                            if (got_white)// && got_black)
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (!got_white) {
                throw new ApplicationException($"failed to get white image for {search_term}");
            }
            return null;
        }
    }
}
