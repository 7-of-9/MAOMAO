using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using mmdb_model;

namespace wowmao
{
    public partial class TermList : ListView
    {
        ColumnHeader columnHeader9 = new System.Windows.Forms.ColumnHeader() { Text = "dir-gold" }; 
        ColumnHeader columnHeader8 =new System.Windows.Forms.ColumnHeader() { Text = "corr-L2" };
        ColumnHeader columnHeader12 =new System.Windows.Forms.ColumnHeader() { Text = "*TSS" };
        ColumnHeader columnHeader27 =new System.Windows.Forms.ColumnHeader() { Text = "*TSS_norm" };
        ColumnHeader columnHeader4 =new System.Windows.Forms.ColumnHeader() { Text = "name" };
        ColumnHeader columnHeader5 =new System.Windows.Forms.ColumnHeader() { Text = "term-type" };
        ColumnHeader columnHeader6 =new System.Windows.Forms.ColumnHeader() { Text = "ent-type" };
        ColumnHeader columnHeader7 =new System.Windows.Forms.ColumnHeader() { Text = "term_occurs_#" };
        ColumnHeader columnHeader22 =new System.Windows.Forms.ColumnHeader() { Text = "term_corr" };
        ColumnHeader columnHeader21 =new System.Windows.Forms.ColumnHeader() { Text = "S" };
        ColumnHeader columnHeader25 =new System.Windows.Forms.ColumnHeader() { Text = "S2" };
        ColumnHeader columnHeader26 =new System.Windows.Forms.ColumnHeader() { Text = "s" };
        ColumnHeader columnHeader14 =new System.Windows.Forms.ColumnHeader() { Text = "appears_count" };
        ColumnHeader columnHeader13 =new System.Windows.Forms.ColumnHeader() { Text = "reasons" };
        //ColumnHeader columnHeader15 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_title" };
        //ColumnHeader columnHeader18 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_desc" };
        ColumnHeader columnHeader19 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_title(S)" };
        ColumnHeader columnHeader20 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_desc(S)" };

        public TermList()
        {
            InitializeComponent();

            this.Columns.AddRange(new ColumnHeader[] {
                  columnHeader9,
                  columnHeader8,
                  columnHeader12,
                  columnHeader27,
                  columnHeader4,
                  columnHeader5,
                  columnHeader6,
                  columnHeader7,
                  columnHeader22,
                  columnHeader21,
                  columnHeader26,
                  columnHeader25,
                  columnHeader14,
                  columnHeader13,
                  //columnHeader15,
                  //columnHeader18,
                  columnHeader19,
                  columnHeader20});

            this.FullRowSelect = true;
            this.HideSelection = false;
            this.View = View.Details;
        }

        internal class lvwUrlTermTag {
            public url_term ut;
            public List<term> correlated_goldens;
        }

        internal ListViewItem NewLvi(url_term ut, List<term> l2_terms)
        {
            var lvi = new ListViewItem(new string[] {
                ut.term.is_gold ? ($"{ut.term.gold_desc}") : "",
                l2_terms == null ? "-" : l2_terms.Count.ToString(),
                ut.tss.ToString("0"),
                ut.tss_norm.ToString("0.00"),
                ut.term.name + " [" + ut.term.id + "] #" + ut.term.occurs_count,
                ut.term.term_type.type,
                ut.term.cal_entity_type != null ? ut.term.cal_entity_type.name : "-",
                ut.term.occurs_count.ToString(),
                ut.term.corr_for_main?.ToString("0.000"),
                ut.S.ToString(),
                ut.s.ToString("0.00"),
                ut.S2.ToString("0.00"),
                ut.appearance_count.ToString(),
                ut.candidate_reason,
                //ut.words_common_to_title != null ? string.Join("/", ut.words_common_to_title.Select(p => p + "/")) : "",
                //ut.words_common_to_desc != null ? string.Join("/", ut.words_common_to_desc.Select(p => p + "/")) : "",
                ut.words_X_title_stemmed != null ? string.Join("/", ut.words_X_title_stemmed.Select(p => p + "/")) : "",
                ut.words_X_desc_stemmed != null ? string.Join("/", ut.words_X_desc_stemmed.Select(p => p + "/")) : "",
            });
            lvi.Tag = new lvwUrlTermTag() { ut = ut, correlated_goldens = l2_terms };
            return lvi;
        }
    }
}
