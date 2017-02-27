using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    [DebuggerDisplay("{parent_term.name} ==> {child_term.name} MIN_D={min_distance} MAX_D={max_distance}")]
    public partial class topic_link
    {
        [NotMapped]
        public term child_term { get { return this.term; } }

        [NotMapped]
        public term parent_term { get { return this.term1; } }
    }
}
