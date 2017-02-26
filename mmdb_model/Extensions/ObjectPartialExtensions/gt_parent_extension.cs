using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    [DebuggerDisplay("{parent_term.name} ==> {child_term.name} // S={S} S_norm={S_norm} is_topic={is_topic}")]
    public partial class gt_parent
    {
        [NotMapped] public term child_term { get { return this.term; } }

        [NotMapped] public term parent_term { get { return this.term1; } }
    }
}
