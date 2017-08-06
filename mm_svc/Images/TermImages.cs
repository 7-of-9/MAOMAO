using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Images
{
    public static class TermImages
    {
        public static string GetFilenameJpeg(term t) {
            return $"t_{t.id}_{t.name.Replace(" ", "")}";
        }
    }
}
