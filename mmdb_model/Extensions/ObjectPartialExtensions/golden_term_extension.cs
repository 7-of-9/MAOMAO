using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    [DebuggerDisplay("{parent_term.name} ==> {child_term.name}")]
    public partial class golden_term
    {
        [NotMapped] public term child_term { get { return this.term; } }

        [NotMapped] public term parent_term { get { return this.term1; } }

        [NotMapped] public string parent_desc { get { return this.parent_term.name + "@L" + this.mmcat_level;  } }



        [NotMapped] public ICollection<golden_term> child_golden_terms { get { return child_term.golden_term1; } }

        [NotMapped] public ICollection<golden_term> parent_golden_terms { get { return child_term.golden_term; } }

        [NotMapped] public bool is_leaf_golden_term { get { return child_golden_terms.Count == 0; } }
        [NotMapped] public int is_child_of_count { get { return parent_golden_terms.Count; } }



        public override string ToString()
        {
            return $"(GT[{this.id}]) --> {child_term?.name}[{child_term_id}](tt={child_term?.term_type_id} #NS={child_term?.wiki_nscount}) GL={mmcat_level} ({parent_golden_terms?.Count}/{child_golden_terms?.Count})";
        }
    }
}
