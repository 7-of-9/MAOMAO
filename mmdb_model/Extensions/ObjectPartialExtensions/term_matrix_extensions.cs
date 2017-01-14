using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{ 
    public partial class term_matrix
    {
        [NotMapped] public term main_term { get; set; }
        [NotMapped] public term related_term { get; set; }

        //[NotMapped] public double corr { get; set; }

        [NotMapped] public double corr_for_related { get; set; }
        [NotMapped] public double corr_for_main { get; set; }
    }
}
