using mm_global;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public partial class term
    {
        // correlation between this term and adjacent term
        [NotMapped] public double? corr_for_main { get; set; }
        
        [NotMapped] public double? corr_for_related { get; set; }

        [NotMapped]
        public url_term parent_url_term { get; set; }

        public string gold_desc { get { return this.is_gold ? $" (*GL={this.gold_level})" : ""; } }

        [NotMapped] public ICollection<golden_term> parent_in_golden_terms { get { return this.golden_term1; } } //was: golden_children

        [NotMapped] public ICollection<golden_term> child_in_golden_terms { get { return this.golden_term; } } //was: golden_parents

        [NotMapped] public bool is_gold { get {
            return child_in_golden_terms.Count > 0 || this.parent_in_golden_terms.Count > 0;
        } }

        [NotMapped] public int gold_level { get {
            // NOTE -- this can't work now that term can have >1 golden parent! (wiki)
            //if (child_in_golden_terms.Count > 0)
            //    return child_in_golden_terms.Single(p => p.child_term_id == this.id).mmcat_level; 
            //else
            //    return 0;
            // FIXME ...
            return -1;
        }}

        [NotMapped] public ICollection<gt_path_to_root> paths_to_root {  get { return this.gt_path_to_root1; } }

        [NotMapped] public double existing_gold_min_tss_norm { get {
            if (this.gold_level == 1) return 0.3;
            if (this.gold_level == 2) return 0.6;
            return 0.9;
        }}

        [NotMapped] public term suggested_gold_parent { get; set; }

        [NotMapped] public bool is_countrylike { get {
            return this.cal_entity_type_id == (int)g.ET.Country || this.cal_entity_type_id == (int)g.ET.Continent || this.cal_entity_type_id == (int)g.ET.ProvinceOrState;
        }}

        //[NotMapped] public bool reused_classification;

        public override string ToString() {
            var ret = $"{this.name} {gold_desc} ... [{this.id}] #{this.occurs_count}";
            if (corr_for_main != null)
                ret += $"corr_for_main={this.corr_for_main?.ToString("0.0000")}";
            if (corr_for_related != null)
                ret += $"corr_for_related={this.corr_for_related?.ToString("0.0000")}";
            ret += $" ({((g.TT)this.term_type_id).ToString()})";
            return ret;
        }
    }
}
