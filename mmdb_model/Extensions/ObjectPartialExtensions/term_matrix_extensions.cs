using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{ 
    [DebuggerDisplay("{term.name} x {term1.name} XX={occurs_together_count}")]
    public partial class term_matrix
    {
        [NotMapped] public term main_term { get; set; }

        [NotMapped] public term related_term { get; set; }

        //[NotMapped] public double corr { get; set; }

        [NotMapped] public double corr_for_related { get; set; }
        [NotMapped] public double corr_for_main { get; set; }

        public override string ToString() {
            return $"{this.main_term.name}x{this.related_term.name} XX={this.occurs_together_count} corr_for_main={this.corr_for_main.ToString("0.000000")} corr_for_related={this.corr_for_related.ToString("0.000000")}";
        }
    }
}
