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
        public static string GetTermFilename_Jpeg(term t) {
            return $"t_{t.id}_{t.name.Replace(" ", "")}";
        }

        public static string GetSiteFilename_Jpeg(awis_site s) {
            return $"s_{s.id}_{s.TLD.Replace(".", "-")}";
        }
    }
}
