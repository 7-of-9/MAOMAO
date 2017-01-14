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

        [NotMapped]
        public url_term parent_url_term { get; set; }

        // # of times this term and adjacent term have appeared together
        //[NotMapped]
        //public long? XX { get; set; }

        // parent term
        //[NotMapped]
        //public term parent_term { get { return this.term2; } }

        [NotMapped] public ICollection<golden_term> golden_children { get { return this.golden_term1; } }

        [NotMapped] public ICollection<golden_term> golden_parents { get { return this.golden_term; } }

        [NotMapped] public bool is_golden { get { return this.golden_parents.Count > 0; } }

        [NotMapped] public int gold_level { get {
            if (golden_parents.Count > 0)
                return golden_parents.Single(p => p.child_term_id == this.id).mmcat_level;
            else
                return 0;
        }}

        [NotMapped] public double existing_gold_min_tss_norm { get {
            if (this.gold_level == 1) return 0.3;
            if (this.gold_level == 2) return 0.6;
            return 0.9;
        }}

        public override string ToString() {
            return $"{this.name} ... [{this.id}] #{this.occurs_count} corr={this.corr} ({((g.TT)this.term_type_id).ToString()})";
        }
    }
}
