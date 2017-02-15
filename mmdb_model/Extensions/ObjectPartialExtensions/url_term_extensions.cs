using mm_global;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public partial class url_term
    {
        public override string ToString() {
            return $"{term.name} S={S_CALC} tss={tss}";
        }

        public void InitExtensionFields()
        {
            appearance_count = 0;
            candidate_reason = "";
            tss = 0;
            //words_common_to_title = new List<string>();
            //words_common_to_desc = new List<string>();
            words_X_title_stemmed = new List<string>();
            words_X_desc_stemmed = new List<string>();
        }

        // type-agnostic representation of the relevance/score/importance: base is 0-10 with multipliers for special types
        [NotMapped]
        public double S_CALC 
        {
            get {
                // for L2 url terms, this "fully inherits" the correlated parent term's S value
                // probably it should be a blend of some inheritence based on the correlation, and also 
                // a factor (below) for this term's type and sub-type
                //if (this.term.parent_url_term != null)
                //    return this.term.parent_url_term.S * 1; // Math.Pow(this.term.corr??0, 0.9);

                if (this.term.term_type_id == (int)g.TT.CALAIS_ENTITY) { 
                    var ret = (double)this.cal_entity_relevance * 10; // 0-10
                    return ret;
                }

                else if (this.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) {
                    return ((4 - (int)this.cal_socialtag_importance) * 3); // 0-10
                }

                else if (this.term.term_type_id == (int)g.TT.CALAIS_TOPIC) {
                    return this.cal_topic_score ?? 0 * 10; // 0-10
                }

                else if (this.term.term_type_id == (int)g.TT.WIKI_NS_14 || this.term.term_type_id == (int)g.TT.WIKI_NS_0) {
                    return this.wiki_S ?? 0; // 0-10
                }

                return 0;
            }
        }

        // boosted S (for special types and subtypes)
        [NotMapped]
        public double S2 { get; set; }

        // scaled S (for L2 terms: term corr/max of L2 term corr's)
        [NotMapped]
        public double s = 1;

        [NotMapped]
        public int appearance_count { get; set; }

        //[NotMapped]
        //public string candidate_reason { get; set; } //**

        //// topic-score-specific
        //[NotMapped]
        //public double tss { get; set; } //**

        //[NotMapped]
        //public double tss_norm { get; set; }  //**

        //[NotMapped] public List<string> words_common_to_title { get; set; }

        //[NotMapped] public List<string> words_common_to_desc { get; set; }

        [NotMapped]
        public List<string> words_X_title_stemmed { get; set; }

        [NotMapped]
        public List<string> words_X_desc_stemmed { get; set; }
    }
}
