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

        [NotMapped]
        public string topic_desc { get { return (this.is_topic ?? false) ? "*T*" : ""; } }

        [NotMapped]
        public bool IS_TOPIC { get { return this.is_topic ?? false; } set { this.is_topic = value; } }

        public string gold_desc { get { return this.is_gold ? "(*GT)" : ""; } }

        [NotMapped] public ICollection<golden_term> parent_in_golden_terms { get { return this.golden_term1; } } //was: golden_children

        [NotMapped] public ICollection<golden_term> child_in_golden_terms { get { return this.golden_term; } } //was: golden_parents

        [NotMapped] public bool is_gold { get {
            return child_in_golden_terms.Count > 0 || this.parent_in_golden_terms.Count > 0;
        } }

        // REPLACED: w/ TermPath class -- remove (explicitly set during ProcessPathsToRoot, i.e. term can be at multiple/different levels; depends on which path it features in)
        //[NotMapped] public int gold_level { get; set; }

        [NotMapped] public ICollection<gt_path_to_root> paths_to_root {  get { return this.gt_path_to_root1; } }

        //[NotMapped] public double existing_gold_min_tss_norm { get {
        //    if (this.gold_level == 1) return 0.3;
        //    if (this.gold_level == 2) return 0.6;
        //    return 0.9;
        //}}

        [NotMapped] public term suggested_gold_parent { get; set; }

        [NotMapped] public bool is_countrylike { get {
            return this.cal_entity_type_id == (int)g.ET.Country || this.cal_entity_type_id == (int)g.ET.Continent || this.cal_entity_type_id == (int)g.ET.ProvinceOrState;
        }}

        //[NotMapped] public bool reused_classification;

        [NotMapped] public double NS_norm;
        [NotMapped] public double NSLW;  // wiki_nscount_levelweighted;
        [NotMapped] public double NSLW_norm; // wiki_nscount_levelweighted_normalized

        [NotMapped] public string stemmed;

        public override string ToString() {
            var ret = (this.is_topic_root ? "(T-ROOT) " : "") +
                      $"{this.name} ... [{this.id}] #{this.occurs_count} #NS={this.wiki_nscount}";

            if (corr_for_main != null)
                ret += $"corr_for_main={this.corr_for_main?.ToString("0.0000")}";
            if (corr_for_related != null)
                ret += $"corr_for_related={this.corr_for_related?.ToString("0.0000")}";
            ret += $" ({((g.TT)this.term_type_id).ToString()})";
            return ret;
        }
    }
}
