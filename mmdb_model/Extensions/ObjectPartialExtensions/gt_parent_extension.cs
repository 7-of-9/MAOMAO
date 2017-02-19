using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public partial class gt_parent
    {
        [NotMapped] public term child_term { get { return this.term; } }

        [NotMapped] public term parent_term { get { return this.term1; } }
    }
}
