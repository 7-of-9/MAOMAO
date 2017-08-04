using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Discovery
{
    public static class ImportUrls
    {
        public static void GetMeta(List<ImportUrlInfo> urls)
        {
            Parallel.ForEach(urls, (url_info) => {
                var doc = Browser.Fetch(url_info.url);
                if (doc != null)
                    return;

                var metas = doc.DocumentNode.SelectNodes("//meta/@content");
                var links = doc.DocumentNode.SelectNodes("//link/@content");
                var title = doc.DocumentNode.Descendants("title").FirstOrDefault();

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

                //page_meta["ip_thumbnail_url"] = $('link[itemprop="thumbnailUrl"]').attr('href') || ""; // todo

                var image_url = og_image ?? tw_image ?? thumbnail ?? image_src ?? sha_iamge ?? tw_image0 ?? tw_image1 ?? tw_image2 ?? tw_image3;

                // title
                var meta_title = title?.InnerText;

                // populate
                url_info.image_url = image_url;
                url_info.meta_title = meta_title.Replace("\n", " ").Replace("\r", " ").Replace("\t", " ");
                Debug.WriteLine($" >> {url_info.url} --> title: [{url_info.meta_title}] img: [{url_info.image_url}]");

            });
        }
    }
}
