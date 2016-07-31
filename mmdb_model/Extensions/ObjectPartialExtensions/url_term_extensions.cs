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
        public void InitExtensionFields()
        {
            appearance_count = 0;
            candidate_reason = "";
            topic_specifc_score = 0;
            words_common_to_title = new List<string>();
            words_common_to_desc = new List<string>();
            words_common_to_title_stemmed = new List<string>();
            words_common_to_desc_stemmed = new List<string>();
        }

        [NotMapped]
        public double S // type-agnostic representation of the relevance/score/importance
        {
            get {
                if (this.term.term_type_id == (int)g.TT.CALAIS_ENTITY) return (double)this.cal_entity_relevance * 10;
                else if (this.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) return ((3 - (int)this.cal_socialtag_importance) * 3) + 1;
                else return this.cal_topic_score??0 * 10;
            }
        }

        [NotMapped]
        public int appearance_count { get; set; }

        [NotMapped]
        public string candidate_reason { get; set; }

        [NotMapped]
        public int topic_specifc_score { get; set; }

        [NotMapped]
        public List<string> words_common_to_title { get; set; }

        [NotMapped]
        public List<string> words_common_to_desc { get; set; }


        [NotMapped]
        public List<string> words_common_to_title_stemmed { get; set; }

        [NotMapped]
        public List<string> words_common_to_desc_stemmed { get; set; }
    }
}
