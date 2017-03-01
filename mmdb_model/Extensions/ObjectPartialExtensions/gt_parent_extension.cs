using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    [DebuggerDisplay("{ToString()}")]
    public partial class gt_parent
    {
        [NotMapped] public term child_term { get { return this.term; } }

        [NotMapped] public term parent_term { get { return this.term1; } }

        public override string ToString() {
            return $"{parent_term.name} ==> {child_term.name} // S={S.ToString("0.0000")} S_norm={S_norm.ToString("0.000")} is_topic={is_topic}";
        }
    }
}
