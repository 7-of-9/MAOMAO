using HtmlAgilityPack;
using mm_global;
using System;
using System.Collections.Concurrent;
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

namespace mm_svc.SmartFinder
{

    public static class Search_GoogImage
    {
        private const string gs_url = "http://www.google.com.sg/search?biw=1440&bih=776&tbm=isch{1}&q={0}&oq={0}";

        internal static object lock_obj = "42";
        internal static DateTime last_access = DateTime.MinValue;
        // us-proxies (L1 SOCKS 5 providers) recommends no more than 15 goog requests per *hour*
        // for uninterrupted service!!! that's one every four minutes...
        //internal static double min_secs_interval = 4 * 60; // 4 minutes: ran overnight no 503s
        internal static double min_secs_interval = 1 * 60; // 1 minutes: testing - short run: seems ok
        //internal static double min_secs_interval = 1 * 15; // 0.25 minutes: testing: failed quickly

        internal static int backoff_secs_base = 15;
        internal static int backoff_secs = backoff_secs_base;
        internal static int success_count = 0;
        internal static int fail_count = 0;

        internal static int total_searches = 0;

        public static List<string> Search(
            out bool none_found,
            string search_term, Images.AzureImageFileType type, string filename = null,
            int save_top_count = 6, int save_white_count = 2, bool clipart = false
            )
        {
            none_found = false;
            var saved = new List<string>();

            //lock (Search_GoogImage.lock_obj) {
            //    bool ready = false;
            //    while (!ready) {
            //        var interval = DateTime.Now.Subtract(Search_GoogImage.last_access);
            //        g.LogLine($"lock acquired - {interval.TotalSeconds.ToString("0.00")} secs since last access: [{search_term}]");
            //        if (interval.TotalSeconds < Search_GoogImage.min_secs_interval) {
            //            g.LogLine($"waiting 1s... [{search_term}]");
            //            System.Threading.Thread.Sleep(1000);
            //        }
            //        else {
            //            Search_GoogImage.last_access = DateTime.Now;
            //            ready = true;
            //        }
            //    }
            //}
            //g.LogLine($"lock exited [{search_term}]");

            var tbs = clipart ? "&tbs=itp:clipart" : "&tbs=itp:photo";
            var url = string.Format(gs_url, search_term, tbs);

            var wb = new WebBrowser(); // need this for reference to winforms to actually work at runtime in debugger
            wb.Dispose();

            HtmlAgilityPack.HtmlDocument doc = null;
            HtmlWeb html_web = new HtmlWeb();
            try {
                //g.LogLine($"GOOG Image Search -- REQUESTED DOWNLOAD: {url}...");

                bool ready = false;
                while (!ready) {
                    var interval = DateTime.Now.Subtract(Search_GoogImage.last_access);
                    //g.LogLine($"[{search_term}] - {interval.TotalSeconds.ToString("0.00")} secs since last access");
                    if (interval.TotalSeconds < Search_GoogImage.min_secs_interval) {
                        //g.LogLine($"[{search_term}] - waiting 1s...");
                        System.Threading.Thread.Sleep(1000);
                    }
                    else {
                        Search_GoogImage.last_access = DateTime.Now;
                        ready = true;
                    }
                }

                //lock (Search_GoogImage.lock_obj) {
                    g.LogGreen($">>> IMAGE SEARCH #{total_searches} [{search_term}] - fetching...");
                    doc = html_web.LoadFromBrowser(url);
                    g.LogLine($"[{search_term}] - fetched.");
                    Search_GoogImage.last_access = DateTime.Now;
                //}

                if (doc?.DocumentNode?.InnerText.Contains("Our systems have detected unusual traffic") == true) {
                    fail_count++;
                    backoff_secs *= fail_count;
                    g.LogError($"ERR: GOOG detected unusual traffic; will sleep for {backoff_secs}...");
                    Thread.Sleep(backoff_secs * 1000);
                    goto done;
                }
                total_searches++;

                if (doc?.DocumentNode?.InnerText.Contains("Navigation canceled") == true) {
                    g.LogError($"ERR: Got IE 'Navigation canceled' -- aborting.");
                    goto done;
                }

                success_count++;
                fail_count = Math.Max(0, --fail_count);
                backoff_secs = backoff_secs_base;
            }
            catch(Exception ex) {
                //g.LogException(ex);
                g.LogAllExceptionsAndStack(ex);
                goto done;
            }

            var imgs = doc.DocumentNode.Descendants("img").Where(p => p.Attributes["class"]?.Value == "rg_ic rg_i");
            try {
                //g.LogLine($"imgs.Count={imgs.Count()}"); //*
                var img_ndx = 0;
                var got_whites = 0;
                if (imgs.Count() == 0) {
                    g.LogWarn($"GOT NO IMAGES: url={url}");
                    g.LogWarn($"html={doc.DocumentNode.InnerHtml}");
                    g.LogWarn($"text={doc.DocumentNode.InnerText}");
                    none_found = true;
                    imgs = null;
                    goto done;
                }
                g.LogLine($"[{search_term}] - got {imgs.Count()} images");
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
                                catch (Exception ex) {
                                    g.LogException(ex); // $"[{search_term}] - got {imgs} images");
                                }
                                using (image) {
                                    if (image != null) {
                                        using (Bitmap bmp = new Bitmap(image)) {
                                            var tl = bmp.GetPixel(0, 0);

                                            // always save as jpeg
                                            var ext = ".jpeg"; // jpeg ? ".jpeg" : ".png";
                                            var content_type = "image/jpeg"; // jpeg ? "image/jpeg" : "image/png";
                                            var jpeg_bytes = ImageToBytes_Jpeg(image);

                                            // save first n images
                                            if (++img_ndx <= save_top_count) {
                                                var full_filename = filename + $"_M{img_ndx}{ext}";
                                                g.LogLine($"[{search_term}] - dispatching Azure save {full_filename}...");
                                                Task.Run(() => Images.AzureImageFile.Save(jpeg_bytes, type, full_filename, content_type));
                                                saved.Add(full_filename);
                                            }

                                            // separate first n white backg images too too
                                            if (got_whites < save_white_count && tl.R >= 0xf0 && tl.G >= 0xf0 && tl.B >= 0xf0) {
                                                var full_filename = filename + $"_W{++got_whites}{ext}";
                                                g.LogLine($"[{search_term}] - dispatching Azure save {full_filename}...");
                                                Task.Run(() => Images.AzureImageFile.Save(jpeg_bytes, type, full_filename, content_type));
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

            }
            finally {
                imgs = null;
                doc = null;
                GC.Collect();
            }

        done:
            doc = null;
            html_web = null;
            GC.Collect();
            return saved;
        }

        private static byte[] ImageToBytes_Jpeg(Image img) {
            using (var stream = new MemoryStream()) {
                img.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
                return stream.ToArray();
            }
        }
    }
}
