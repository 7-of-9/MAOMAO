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

        // parent term
        //[NotMapped]
        //public term parent_term { get { return this.term2; } }

        [NotMapped]
        public ICollection<golden_term> golden_children { get { return this.golden_term1; } }

        [NotMapped]
        public ICollection<golden_term> golden_parents { get { return this.golden_term; } }

        [NotMapped]
        public int golden_mmcat_level { get {
            if (golden_parents.Count > 0)
                return golden_parents.Single(p => p.child_term_id == this.id).mmcat_level;
            else
                return 0;
        } }
    }
}
