using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using mm_svc.Terms;
using mmdb_model;
using mm_global;

namespace wowmao
{
    public partial class GoldenTree : TreeView
    {
        public event EventHandler<SearchGoldenTermEventArgs> OnSearchGoldenTerm = delegate { };
        public class SearchGoldenTermEventArgs : EventArgs { public long golden_term_id { get; set; } }

        private class NodeTag { public term term; public golden_term golden_term; }

        public GoldenTree()
        {
            InitializeComponent();
            this.ContextMenuStrip = this.contextMenuStrip1;
        }

        public void BuildTree()
        {
            this.BeginUpdate();
            this.Nodes.Clear();
            
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                var all_gts = db.golden_term//.AsNoTracking()
                                .Include("term.golden_term").Include("term.golden_term1")
                                .Include("term1.golden_term").Include("term1.golden_term1")
                                .OrderBy(p => p.mmcat_level).ThenBy(p => p.term.name).ThenBy(p => p.term1.name)
                                .ToListNoLock();
                var root_term = db.terms.Find(g.MAOMAO_ROOT_TERM_ID);
                var root_node = NodeFromTerm(root_term);
                this.Nodes.Add(root_node);

                foreach (var gt in all_gts) {
                    InsertSearchGoldenTerm(root_node, gt);
                }
            }
            this.EndUpdate();
            this.ExpandAll();
        }

        private void InsertSearchGoldenTerm(TreeNode node, golden_term gt)
        {
            var node_term = (node.Tag as NodeTag).term;
            if (gt.parent_term_id == node_term.id) {
                var child_node = NodeFromTerm(gt.child_term, gt);
                node.Nodes.Add(child_node);
            }
            else
                foreach (var child_node in node.Nodes)
                    InsertSearchGoldenTerm(child_node as TreeNode, gt);
        }

        private TreeNode NodeFromTerm(term t, golden_term parent_gt = null) {
            var node = new TreeNode($"{t.ToString()}");
            if (parent_gt != null && parent_gt.autosuggested_at_utc != null)
                node.Text += $" (autogold @{parent_gt.autosuggested_at_utc?.ToString("dd MMM yyyy HH:mm")}";
            node.Tag = new NodeTag() { term = t, golden_term = parent_gt };
            return node;
        }

        private void contextMenuStrip1_Opening(object sender, CancelEventArgs e)
        {
        }

        private void mnuMatchingUrls_Click(object sender, EventArgs e)
        {
            if (this.SelectedNode == null) return;
            var gt = (this.SelectedNode.Tag as NodeTag).golden_term;
            OnSearchGoldenTerm?.Invoke(typeof(Correlations), new SearchGoldenTermEventArgs() { golden_term_id = gt.id });
        }

        private void mnu2_Click(object sender, EventArgs e)
        {
        }
    }
}
