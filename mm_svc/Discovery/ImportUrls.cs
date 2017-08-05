using mm_global;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace mm_svc.Discovery
{
    public static class ImportUrls
    {
        public static void GetMeta(List<ImportUrlInfo> urls)
        {
            Parallel.ForEach(urls, (url_info) => {
                var doc = Browser.Fetch(url_info.url, rate_limit: false);
                if (doc == null) {
                    g.LogWarn($"got no HAP obj for [{url_info.url}]");
                    return;
                }

                var metas = doc.DocumentNode.SelectNodes("//meta/@content") ?? doc.DocumentNode.Descendants("meta");
                var links = doc.DocumentNode.SelectNodes("//link/@content") ?? doc.DocumentNode.Descendants("link");
                var title = doc.DocumentNode.SelectSingleNode("//title");

                //if (url_info.url == "https://www.meetup.com/Boardgames-Singapore/messages/boards/thread/50319968")
                //    Debugger.Break();

                // get images
                var og_image = metas?.Where(p => p.Attributes["property"]?.Value == "og:image").FirstOrDefault()?.Attributes["content"]?.Value;

                var tw_image = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image").FirstOrDefault() ??
                                metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image").FirstOrDefault())?.Attributes["content"]?.Value;

                var tw_image0 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image0").FirstOrDefault() ??
                                 metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image0").FirstOrDefault())?.Attributes["content"]?.Value;

                var tw_image1 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image1").FirstOrDefault() ??
                                 metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image1").FirstOrDefault())?.Attributes["content"]?.Value;

                var tw_image2 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image2").FirstOrDefault() ??
                                 metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image2").FirstOrDefault())?.Attributes["content"]?.Value;

                var tw_image3 = (metas?.Where(p => p.Attributes["name"]?.Value == "twitter:image3").FirstOrDefault() ??
                                 metas?.Where(p => p.Attributes["property"]?.Value == "twitter:image3").FirstOrDefault())?.Attributes["content"]?.Value;

                var sha_iamge = (metas?.Where(p => p.Attributes["name"]?.Value == "shareaholic:image").FirstOrDefault())?.Attributes["content"]?.Value;

                var thumbnail = (metas?.Where(p => p.Attributes["name"]?.Value == "thumbnail").FirstOrDefault())?.Attributes["content"]?.Value;

                var image_src = (links?.Where(p => p.Attributes["rel"]?.Value == "image_src").FirstOrDefault())?.Attributes["content"]?.Value;

                var apple_touch_icon_180 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "180x180").FirstOrDefault())?.Attributes["href"]?.Value;
                var apple_touch_icon_152 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "152x152").FirstOrDefault())?.Attributes["href"]?.Value;
                var apple_touch_icon_144 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "144x144").FirstOrDefault())?.Attributes["href"]?.Value;
                var apple_touch_icon_120 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "120x120").FirstOrDefault())?.Attributes["href"]?.Value;
                var apple_touch_icon_114 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true && p.Attributes["sizes"]?.Value == "114x114").FirstOrDefault())?.Attributes["href"]?.Value;
                var apple_touch_icon_other = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-") == true).FirstOrDefault())?.Attributes["href"]?.Value;
                //var apple_touch_icon_76 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "76x76").FirstOrDefault())?.Attributes["href"]?.Value;
                //var apple_touch_icon_72 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "72x72").FirstOrDefault())?.Attributes["href"]?.Value;
                //var apple_touch_icon_60 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "60x60").FirstOrDefault())?.Attributes["href"]?.Value;
                //var apple_touch_icon_57 = (links?.Where(p => p.Attributes["rel"]?.Value.StartsWith("apple-touch-icon") == true && p.Attributes["sizes"]?.Value == "57x57").FirstOrDefault())?.Attributes["href"]?.Value;

                var link_rel_icon_192 = (links?.Where(p => p.Attributes["rel"]?.Value == "icon" && p.Attributes["sizes"]?.Value == "192x192").FirstOrDefault())?.Attributes["href"]?.Value;
                var link_rel_icon_96 = (links?.Where(p => p.Attributes["rel"]?.Value == "icon" && p.Attributes["sizes"]?.Value == "96x96").FirstOrDefault())?.Attributes["href"]?.Value;

                var link_rel_shortcut_icon_196 = (links?.Where(p => p.Attributes["rel"]?.Value == "shortcut icon" && p.Attributes["sizes"]?.Value == "196x196").FirstOrDefault())?.Attributes["href"]?.Value;
                var link_rel_shortcut_icon_128 = (links?.Where(p => p.Attributes["rel"]?.Value == "shortcut icon" && p.Attributes["sizes"]?.Value == "128x128").FirstOrDefault())?.Attributes["href"]?.Value;


                //page_meta["ip_thumbnail_url"] = $('link[itemprop="thumbnailUrl"]').attr('href') || ""; // todo

                var image_url = og_image ?? tw_image ?? thumbnail ?? image_src ?? sha_iamge ?? tw_image0 ?? tw_image1 ?? tw_image2 ?? tw_image3
                             ?? link_rel_shortcut_icon_196 ?? apple_touch_icon_180 ?? link_rel_icon_192
                             ?? apple_touch_icon_152 ?? apple_touch_icon_144 ?? link_rel_shortcut_icon_128 ?? apple_touch_icon_120 ?? apple_touch_icon_114 ?? link_rel_icon_96
                             ?? apple_touch_icon_other
                             ;
                // title
                var meta_title = title?.InnerText;

                // populate
                if (!string.IsNullOrEmpty(image_url) && !image_url.StartsWith("/"))
                    url_info.image_url = HttpUtility.HtmlDecode(image_url);
                if (!string.IsNullOrEmpty(meta_title))
                    url_info.meta_title = meta_title.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ");
                else
                    url_info.meta_title = url_info.title;
                url_info.meta_title = HttpUtility.HtmlDecode(url_info.meta_title);
                Debug.WriteLine($" >> {url_info.url} --> title: [{url_info.meta_title}] img: [{url_info.image_url}]");

            });
        }
    }
}
