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

namespace wowmao.Controls
{
    public partial class WikiGoldenTree : TreeView
    {
        public event EventHandler<SearchGoldenTermEventArgs> OnSearchGoldenTerm = delegate { };
        public class SearchGoldenTermEventArgs : EventArgs { public long golden_term_id { get; set; } }

        public event EventHandler<OnSearchGoogleEventArgs> OnSearchGoogle = delegate { };
        public class OnSearchGoogleEventArgs : EventArgs { public string search_term { get; set; } }
        private class NodeTag { public term term; public golden_term golden_term; }

        public WikiGoldenTree()
        {
            InitializeComponent();
            this.ContextMenuStrip = this.contextMenuStrip1;
            this.AfterExpand += WikiGoldenTree_AfterExpand;
            this.AfterSelect += WikiGoldenTree_AfterSelect;
        }

   
        public void BuildTree(long root_term_id)
        {
            this.BeginUpdate();
            this.Nodes.Clear();

            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {

                var root_term = db.terms.Find(root_term_id);
                var root_node = NodeFromTerm(root_term);
                this.Nodes.Add(root_node);
           
                //root_node.Expand();
            }
            this.EndUpdate();
            //this.ExpandAll();
        }


        private void WikiGoldenTree_AfterSelect(object sender, TreeViewEventArgs e)
        {
            this.Cursor = Cursors.WaitCursor;
            this.BeginUpdate();
            var node_tag = e.Node.Tag as NodeTag;
            var db = mm02Entities.Create();
            { //using (var db = mm02Entities.Create()) {
                var all_gts = db.golden_term
                           .Include("term.golden_term").Include("term.golden_term1")
                           .Include("term1.golden_term").Include("term1.golden_term1")
                           .Where(p => p.parent_term_id == node_tag.term.id)
                           .OrderBy(p => p.mmcat_level).ThenBy(p => p.term.name).ThenBy(p => p.term1.name)
                           .ToListNoLock();
                foreach (var gt in all_gts)
                {
                    var child_node = NodeFromTerm(gt.child_term);
                    e.Node.Nodes.Add(child_node);
                }
            }
            this.EndUpdate();
            e.Node.Expand();
            this.Cursor = Cursors.Default;
        }

        private void WikiGoldenTree_AfterExpand(object sender, TreeViewEventArgs e)
        {
           
        }

        private TreeNode NodeFromTerm(term t, golden_term parent_gt = null)
        {
            var node = new TreeNode($"{t.ToString()}");
            if (parent_gt != null && parent_gt.autosuggested_at_utc != null)
                node.Text += $" (autogold @{parent_gt.autosuggested_at_utc?.ToString("dd MMM yyyy HH:mm")}";
            node.Tag = new NodeTag() { term = t, golden_term = parent_gt };
            return node;
        }
    }
}
