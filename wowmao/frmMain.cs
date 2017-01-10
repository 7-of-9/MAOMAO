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
            InitTvwRootNodes();
        }

        void InitTvwRootNodes()
        {
            // root list is dumb list ordered by appears_count
            using (var db = mm02Entities.Create())
            {
                tvw.BeginUpdate();
                var candidate_masters = db.terms
                    //.Where(p => p.id != g.MAOMAO_ROOT_TERM_ID)
                    .OrderByDescending(p => p.occurs_count).Take(1000).ToListNoLock();
                foreach(var root in candidate_masters) {
                    tvw.Nodes.Add(TreeNodeFromTerm(root));
                }
                tvw.EndUpdate();
            }
        }

        TreeNode TreeNodeFromTerm(term t)
        {
            var tn = new TreeNode($"> {t.name} (#{t.occurs_count})");
            tn.Tag = t;
            return tn;
        }

        TreeNode TreeNodeFromCorrelation(correlation c)
        {
            var tn = new TreeNode($"max_corr={c.max_corr.ToString("0.0000")} {c.corr_term} XX={c.sum_XX}");
            foreach (var term in c.corr_terms) {
                var tn2 = TreeNodeFromTerm(term);
                tn.Nodes.Add(tn2);
            }
            tn.Tag = c;
            return tn;
        }

        private void tvw_AfterSelect(object sender, TreeViewEventArgs e)
        {
            var tn = tvw.SelectedNode;
            if (tn == null) return;
            if (tn.Nodes.Count == 0) {
                var parent_term = tn.Tag as term;
                var correlations = Correlations.Get2(parent_term.name, corr_term_eq: null, max_appears_together_count_normalized: 0.2);
                foreach (var correlation in correlations)
                {
                    tn.Nodes.Add(TreeNodeFromCorrelation(correlation));
                }
                tn.Expand();
            }
        }

     
        private void addRootTermToolStripMenuItem_Click(object sender, EventArgs e)
        {
        }

        private void tvw_BeforeExpand(object sender, TreeViewCancelEventArgs e)
        {
        }

        private void tvw_BeforeCheck(object sender, TreeViewCancelEventArgs e)
        {
            if (e.Node.Tag is term)
            {
                var term = e.Node.Tag as term;
                MessageBox.Show($"TODO (1): set mmcat (golden) based on level={e.Node.Level} for {term.name}");
            }
            else if (e.Node.Tag is correlation)
            {
                var corr = e.Node.Tag as correlation;
                MessageBox.Show($"TODO (2): set mmcat (golden) based on level={e.Node.Level} for {corr.corr_term}");
            }
        }

        private void tvw_AfterCheck(object sender, TreeViewEventArgs e)
        {
        }

        private void tvw_MouseClick(object sender, MouseEventArgs e)
        {
        
        }

        private void tvw_Click(object sender, EventArgs e)
        {
           
        }

        private void tvw_MouseUp(object sender, MouseEventArgs e)
        {
         
        }
    }
}
