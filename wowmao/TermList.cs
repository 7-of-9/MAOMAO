using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace wowmao
{
    public partial class TermList : ListView
    {
        ColumnHeader columnHeader9 = new System.Windows.Forms.ColumnHeader() { Text = "dir-gold" }; 
        ColumnHeader columnHeader8 =new System.Windows.Forms.ColumnHeader() { Text = "corr-gold" };
        ColumnHeader columnHeader12 =new System.Windows.Forms.ColumnHeader() { Text = "*TSS" };
        ColumnHeader columnHeader4 =new System.Windows.Forms.ColumnHeader() { Text = "name" };
        ColumnHeader columnHeader5 =new System.Windows.Forms.ColumnHeader() { Text = "term-type" };
        ColumnHeader columnHeader6 =new System.Windows.Forms.ColumnHeader() { Text = "ent-type" };
        ColumnHeader columnHeader7 =new System.Windows.Forms.ColumnHeader() { Text = "term_occurs_#" };
        ColumnHeader columnHeader21 =new System.Windows.Forms.ColumnHeader() { Text = "S" };
        ColumnHeader columnHeader14 =new System.Windows.Forms.ColumnHeader() { Text = "appears_count" };
        ColumnHeader columnHeader13 =new System.Windows.Forms.ColumnHeader() { Text = "reasons" };
        ColumnHeader columnHeader15 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_title" };
        ColumnHeader columnHeader18 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_desc" };
        ColumnHeader columnHeader19 =new System.Windows.Forms.ColumnHeader() { Text = "wordswords_X_title_stemmed" };
        ColumnHeader columnHeader20 =new System.Windows.Forms.ColumnHeader() { Text = "words_X_desc_stemmed" };

        public TermList()
        {
            InitializeComponent();

            this.Columns.AddRange(new ColumnHeader[] {
                  columnHeader9,
                  columnHeader8,
                  columnHeader12,
                  columnHeader4,
                  columnHeader5,
                  columnHeader6,
                  columnHeader7,
                  columnHeader21,
                  columnHeader14,
                  columnHeader13,
                  columnHeader15,
                  columnHeader18,
                  columnHeader19,
                  columnHeader20});

            this.FullRowSelect = true;
            this.HideSelection = false;
            this.View = View.Details;
        }
    }
}
