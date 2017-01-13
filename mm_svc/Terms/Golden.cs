using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mm_svc.Terms
{
    public static class Golden
    {
        public static bool IsGolden(string term_name) {
            using (var db = mm02Entities.Create()) {
                return db.golden_term.Any(p => p.term.name == term_name);
            }
        }
    }
}
