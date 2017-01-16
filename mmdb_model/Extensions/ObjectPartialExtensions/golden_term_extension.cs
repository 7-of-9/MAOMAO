using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    [DebuggerDisplay("{parent_term.name}=>{child_term.name}")]
    public partial class golden_term
    {
        [NotMapped]
        public term child_term { get { return this.term; } }

        [NotMapped]
        public term parent_term { get { return this.term1; } }

        [NotMapped]
        public string parent_desc { get { return this.parent_term.name + "@L" + this.mmcat_level;  } }
    }
}
