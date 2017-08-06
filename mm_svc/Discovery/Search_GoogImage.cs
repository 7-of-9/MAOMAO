using HtmlAgilityPack;
using mm_global;
using System;
using System.Collections.Generic;
using System.Configuration;
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

        public static List<string> Search(string search_term)
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
            foreach (var img in imgs) {
                var src = img.Attributes["src"]?.Value;
                if (!string.IsNullOrEmpty(src)) {
                    var search = "data:image/jpeg;base64,";
                    if (src.StartsWith(search)) {
                        var base64 = src.Substring(search.Length);
                        var bytes = Convert.FromBase64String(base64);
                        using (var imageFile = new FileStream($"c:\\temp\\{search_term.Replace(" ", "_")}.jpeg", FileMode.Create)) {
                            imageFile.Write(bytes, 0, bytes.Length);
                            imageFile.Flush();

                            Images.Azure.Save(bytes, "test.jpeg", "image/jpeg");
                        }

                    }
                }
            }
            return null;
        }
    }
}
