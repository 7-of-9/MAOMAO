using mm_global;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public partial class term
    {
        // correlation between this term and adjacent term
        [NotMapped]
        public double? corr { get; set; }

        // # of times this term and adjacent term have appeared together
        [NotMapped]
        public long? XX { get; set; }
    }
}
