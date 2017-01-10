using mmdb_model;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using mm_global;
using mm_svc.Terms;
using System.Diagnostics;

namespace wowmao
{
    public partial class frmMain : Form
    {
        public frmMain()
        {
            InitializeComponent();
            InitTvw();
        }

        void InitTvw()
        {
            using (var db = mm02Entities.Create())
            {
                tvw.BeginUpdate();
                var root = db.terms.Find(g.MAOMAO_ROOT_TERM_ID);
                AddTerm(root, tvw.Nodes);
                tvw.EndUpdate();
            }
        }

        TreeNode AddTerm(term t, TreeNodeCollection add_to)
        {
            var tn = new TreeNode($"{t.name} (id={t.id}) #{t.occurs_count} corr={(t.corr??0).ToString("0.00")} XX={t.XX}");
            add_to.Add(tn);
            tn.Tag = t;
            return tn;
        }

        private void tvw_AfterSelect(object sender, TreeViewEventArgs e)
        {
            var tn = e.Node;
            if (tn.Nodes.Count == 0)
            {
                var parent_term = tn.Tag as term;
                var correlated_terms = Correlations.Get(parent_term.name);
                foreach (var term in correlated_terms)
                {
                    AddTerm(term, tn.Nodes);
                }
                tn.Expand();
            }
        }
    }
}
