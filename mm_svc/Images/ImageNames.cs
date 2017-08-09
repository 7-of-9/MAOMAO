using mm_svc.Util.Utils;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Images
{
    public static class ImageNames
    {
        public static string GetTerm_MasterImage_FullUrl(term t) {
            return $"{AzureImageFile.terms_imageRootPath}/{GetTermFilename(t)}_M1.jpeg";
        }
        public static string GetTermFilename(term t) {
            return $"t_{t.id}_{t.name.Replace(" ", "")}";
        }
     
        public static string GetSiteFilename(awis_site s) {
            var trimmed_tld = TldTitle.GetPartialTldNameWithSuffix(s.TLD);
            return $"s_{s.id}_{trimmed_tld.Replace(".", "-")}";
        }
    }
}
