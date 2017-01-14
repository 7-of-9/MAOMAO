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
using mm_svc.Terms;
using System.Diagnostics;
using mm_global;
using static mm_svc.Terms.Correlations;

namespace wowmao
{
    public partial class TermTree : TreeView
    {
        public int XX_max_L1 = 1;
        public int XX_max_GT_L1 = 1;

        public TermTree()
        {
            InitializeComponent();
            this.AfterSelect += TermTree_AfterSelect;
            this.ContextMenuStrip = this.contextMenuStrip1;
            this.AllowDrop = true;
            this.ItemDrag += TermTree_ItemDrag;
            this.DragEnter += TermTree_DragEnter;
            this.DragDrop += TermTree_DragDrop;
            this.DragOver += TermTree_DragOver;
        }

        private void TermTree_ItemDrag(object sender, ItemDragEventArgs e)
        {
            // can only drag golden children
            var draggedNode = (TreeNode)e.Item as TreeNode;
            var corr = draggedNode.Tag as correlation;
            if (corr == null || !corr.is_golden_child)
                return;// DoDragDrop(e.Item, DragDropEffects.None);
            else
                DoDragDrop(e.Item, DragDropEffects.Move | DragDropEffects.None);
        }

        private void TermTree_DragEnter(object sender, DragEventArgs e)
        {
        }

        private void TermTree_DragOver(object sender, DragEventArgs e)
        {
            // can only drop onto golden children
            var targetPoint = this.PointToClient(new Point(e.X, e.Y));
            var targetNode = this.GetNodeAt(targetPoint);
            var corr = targetNode.Tag as correlation;
            if (corr == null || !corr.is_golden_child)
                e.Effect = DragDropEffects.None;
            else
                e.Effect = DragDropEffects.Move;
        }

        private void TermTree_DragDrop(object sender, DragEventArgs e)
        {
            var targetPoint = this.PointToClient(new Point(e.X, e.Y));
            var targetNode = this.GetNodeAt(targetPoint);
            var draggedNode = (TreeNode)e.Data.GetData(typeof(TreeNode));
            if (!draggedNode.Equals(targetNode) && targetNode != null) {
                draggedNode.Remove();
                targetNode.Nodes.Add(draggedNode);
                targetNode.Expand();
            }
        }
     
        private void TermTree_AfterSelect(object sender, TreeViewEventArgs e) {
            var tn = this.SelectedNode;
            if (tn == null) return;
            Debug.WriteLine($"tn.Level={tn.Level}");
            if (tn.Tag is correlation) {
                if (!tn.IsExpanded)
                    tn.Expand();
            }
            else if (tn.Nodes.Count == 0 && tn.Tag is term) {
                if (tn.Tag is term) {
                    this.Cursor = Cursors.WaitCursor;
                    var parent_term = tn.Tag as term;
                    var correlations = Correlations.GetTermCorrelations(new corr_input { main_term = parent_term.name, corr_term_eq = null, max_appears_together_count = tn.Level == 0 ? XX_max_L1 : XX_max_GT_L1 });
                    List<correlation> filtered;

                    // exclude golden children whose parent is not this correlation
                    filtered = correlations.Where(p => p.is_golden_child == false
                                                    //|| p.golden_parents.Any(p2 => p2.parent_term.id == parent_term.id)
                                                    ).ToList();

                    // order golden to top
                    filtered = filtered.OrderByDescending(p => p.is_golden_child).ToList();

                    // exclude golden 1 correlations for children of golden 1 nodes
                    //if (AnyParentHasMmCat(1, tn))
                    //    filtered = correlations.Where(p => p.is_mm_cat(1) == false).OrderByDescending(p => p.is_golden_2).ThenByDescending(p => p.max_corr).ToList();
                    //// exclude golden 2 correlations for children of MM root
                    //else if (tn.Level == 0)
                    //    filtered = correlations.Where(p => p.is_mm_cat(2) == false).OrderByDescending(p => p.is_golden_1).ThenByDescending(p => p.max_corr).ToList();
                    //else
                    //    filtered = correlations;

                    foreach (var correlation in filtered) {
                        tn.Nodes.Add(TreeNodeFromCorrelation(correlation));
                    }
                    tn.Expand();
                    this.Cursor = Cursors.Default;
                }
            }
        }

        public void AddRootTerm(term t) {
            this.BeginUpdate();
            this.Nodes.Add(TreeNodeFromTerm(t));
            this.EndUpdate();
        }

        private term FirstGoldenParent(TreeNode tn) {
            if (tn.Parent == null) { using (var db = mm02Entities.Create()) {
                return db.terms.Include("golden_term").Include("golden_term1").Single(p => p.id == g.MAOMAO_ROOT_TERM_ID);
            } }
            var corr = tn.Parent.Tag as correlation;
            if (corr != null && corr.is_golden_child) return corr.corr_terms.First();
            return FirstGoldenParent(tn.Parent);
        }

        TreeNode TreeNodeFromTerm(term t) {
            var tn = new TreeNode(t.ToString());
            if (t.is_golden) {
                tn.Text += $" / *GL={t.gold_level} golden child of [{string.Join(" / ", t.golden_parents.Select(p => p.parent_desc))}]";
            }
            tn.Tag = t;
            return tn;
        }

        TreeNode TreeNodeFromCorrelation(correlation c) {
            var tn = new TreeNode($"{c.corr_term} ... corr={c.corr_for_main.ToString("0.0000")} XX={c.sum_XX} corr_terms={c.corr_terms.Count}"); //**max_corr
            if (c.is_golden_child) { 
                var boldFont = new Font(this.Font, FontStyle.Bold);
                tn.NodeFont = boldFont;
                var parents = c.golden_parents;
                var parents_desc = new List<string>();
                foreach(var golden_parent in c.golden_parents) {
                    if (!parents_desc.Contains(golden_parent.parent_desc))
                        parents_desc.Add(golden_parent.parent_desc);
                }
                tn.Text = $"** " + tn.Text + $" / GOLDEN CHILD OF [{string.Join(" / ", parents_desc)}]";
            }
            foreach (var term in c.corr_terms) {
                var tn2 = TreeNodeFromTerm(term);
                tn.Nodes.Add(tn2);
            }
            tn.Tag = c;
            return tn;
        }

        private void contextMenuStrip1_Opening(object sender, CancelEventArgs e) {
            var p = this.PointToClient(Cursor.Position);
            var ht = this.HitTest(p);
            var node = ht.Node;
            if (node != null && node.Tag != null) {
                if (!(node.Tag is correlation)) { e.Cancel = true; return; }
                this.SelectedNode = node;
                mnuiCtxName.Text = (node.Tag as correlation).ToString();
            }
        }

        private void addRootTermToolStripMenuItem_Click(object sender, EventArgs e) {
            var node = this.SelectedNode;
            if (node != null && node.Tag != null && node.Tag is correlation) {
                var corr = node.Tag as correlation;
                AddRemoveGolden(node);
            }
        }

        private void findAtL1_Click(object sender, EventArgs e) {
            var node = this.SelectedNode;
            if (node != null && node.Tag != null && node.Tag is correlation) {
                var corr = node.Tag as correlation;
                Debug.Write($"find @l1 for {corr.corr_term}");
                this.Cursor = Cursors.WaitCursor;
                for (int i = 0; i < this.Nodes[0].Nodes.Count; i++) {
                    var tnL1 = this.Nodes[0].Nodes[i];
                    var corrL1 = tnL1.Tag as correlation;
                    if (corrL1.corr_term == corr.corr_term) {
                        this.SelectedNode = tnL1;
                        break;
                    }
                }
                this.Cursor = Cursors.Default;
            }
        }

        void AddRemoveGolden(TreeNode tn) {
            var corr = tn.Tag as correlation;
            var parent_term = FirstGoldenParent(tn);
            Debug.WriteLine("node.Level=" + tn.Level);
            Debug.WriteLine("parent_term=" + parent_term.name);
            Debug.WriteLine("parent_term.golden_mmcat_level=" + parent_term.gold_level);
            using (var db = mm02Entities.Create()) {
                this.Cursor = Cursors.WaitCursor;
                foreach (var term in corr.corr_terms) {
                    var golden_term = db.golden_term.Where(p => p.parent_term_id == parent_term.id && p.child_term_id == term.id).SingleOrDefault();
                    if (golden_term != null) {
                        // parent/child golden relation already exists; remove
                        db.golden_term.Remove(golden_term);
                        db.SaveChangesTraceValidationErrors();
                    }
                    else {
                        // parent/child golden relation doesn't exist; create
                        golden_term = new golden_term() {
                            child_term_id = term.id,
                            parent_term_id = parent_term.id,
                            mmcat_level = parent_term.gold_level + 1
                        };
                        db.golden_term.Add(golden_term);
                        db.SaveChangesTraceValidationErrors();
                    }
                }
                this.Cursor = Cursors.Default;

                // replace node with new correlation (to reflect updated golden status)
                this.Cursor = Cursors.WaitCursor;
                this.BeginUpdate();
                var old_ndx = tn.Index;
                var old_parent = tn.Parent;
                var new_corr = Correlations.GetTermCorrelations(new corr_input() { main_term = corr.main_term, corr_term_eq = corr.corr_term, max_appears_together_count = XX_max_GT_L1 });
                var tn_new = TreeNodeFromCorrelation(new_corr.First());
                old_parent.Nodes.Insert(old_ndx, tn_new);
                old_parent.Nodes.Remove(tn);
                this.EndUpdate();
                this.Cursor = Cursors.Default;
            }
        }
    }
}
