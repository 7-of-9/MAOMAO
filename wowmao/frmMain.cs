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
    //
    // TODO: manually defining top-level cats is fine.
    //       but will definitely need some "auto-golden" cateogry setting by the categorizor
    //
    public partial class frmMain : Form
    {
        private term root_term;
        //private mm02Entities db = mm02Entities.Create();
        //private const int XX_max_L1 = 10;
        //private const int XX_max_GT_L1 = 1;

        public frmMain() {
            InitializeComponent();
            InitTvwRootNodes();
        }

        private void cmdSearchURLs_Click(object sender, EventArgs e) {
            this.Cursor = Cursors.WaitCursor;
            InitUrls(txtURLSearch.Text);
            this.Cursor = Cursors.Default;
        }

        void InitUrls(string search_term) {
            lvwUrls.Items.Clear();
            using (var db = mm02Entities.Create()) {
                lvwUrls.BeginUpdate();
                var items = new List<ListViewItem>();
                var qry = db.urls
                    .AsNoTracking()
                    .Include("url_term")
                    .Include("url_term.term")
                    .Include("url_term.term.term_type")
                    .Include("url_term.term.cal_entity_type")
                    .Where(p => p.meta_all.ToLower().Contains(search_term.ToLower()))
                    .Take(100);
                Debug.WriteLine(qry.ToString());
                var data = qry.ToListNoLock();
                foreach (var x in data) {
                    var item = new ListViewItem(new string[] {
                        x.url1,
                        x.meta_title,
                        "-", //x.term_count.ToString(),
                        "-",
                    });
                    item.Tag = x;
                    items.Add(item);
                }
                lvwUrls.Items.AddRange(items.ToArray());
                lvwUrls.EndUpdate();
            }
            SetCols(lvwUrls);
        }

        void SetCols(ListView lvw) {
            for (int i = 0; i < lvw.Columns.Count; i++) {
                var col = lvw.Columns[i];
                col.Width = -2;
            }
        }

        void InitTvwRootNodes() {
            this.Cursor = Cursors.WaitCursor;
            using (var db = mm02Entities.Create()) {
                root_term = db.terms.Include("golden_term").Include("golden_term1").Single(p => p.id == g.MAOMAO_ROOT_TERM_ID);
                //tvw.BeginUpdate();
                //tvw.Nodes.Clear();
                //tvw.Nodes.Add(TreeNodeFromTerm(root_term));
                //tvw.EndUpdate();
                ttAll.Nodes.Clear();
                ttAll.AddRootTerm(root_term);
                ttAll.SelectedNode = ttAll.Nodes[0];
                this.Text = "winmao ~ " + db.Database.Connection.Database;
            }
            this.Cursor = Cursors.Default;
        }

        private void cmdRefresh_Click_1(object sender, EventArgs e) {
            InitTvwRootNodes();
        }

        //TreeNode TreeNodeFromTerm(term t) {
        //    var tn = new TreeNode($"{t.name} ... [{t.id}] #{t.occurs_count} ({((g.TT)t.term_type_id).ToString()})");
        //    if (t.golden_parents.Count > 0) {
        //        tn.Text += $" / golden child of [{string.Join(" / ", t.golden_parents.Select(p => p.parent_desc))}]";
        //    }
        //    tn.Tag = t;
        //    return tn;
        //}

        //TreeNode TreeNodeFromCorrelation(correlation c) {
        //    var tn = new TreeNode($"{c.corr_term} ... max_corr={c.max_corr.ToString("0.0000")} XX={c.sum_XX} corr_terms={c.corr_terms.Count}");
        //    if (c.is_golden_child) { 
        //        var boldFont = new Font(tvw.Font, FontStyle.Bold);
        //        tn.NodeFont = boldFont;
        //        var parents = c.golden_parents;
        //        var parents_desc = new List<string>();
        //        foreach(var golden_parent in c.golden_parents) {
        //            if (!parents_desc.Contains(golden_parent.parent_desc))
        //                parents_desc.Add(golden_parent.parent_desc);
        //        }
        //        tn.Text = $"** " + tn.Text + $" / GOLDEN CHILD OF [{string.Join(" / ", parents_desc)}]";
        //    }
        //    foreach (var term in c.corr_terms) {
        //        var tn2 = TreeNodeFromTerm(term);
        //        tn.Nodes.Add(tn2);
        //    }
        //    tn.Tag = c;
        //    return tn;
        //}

        private void tvw_AfterSelect(object sender, TreeViewEventArgs e) {
            //var tn = tvw.SelectedNode;
            //if (tn == null) return;
            //Debug.WriteLine($"tn.Level={tn.Level}");
            //if (tn.Tag is correlation) {
            //    if (!tn.IsExpanded)
            //        tn.Expand();
            //}
            //else if (tn.Nodes.Count == 0 && tn.Tag is term) {
            //    if (tn.Tag is term) {
            //        this.Cursor = Cursors.WaitCursor;
            //        var parent_term = tn.Tag as term;
            //        var correlations = Correlations.Get2(parent_term.name, null, tn.Level == 0 ? XX_max_L1 : XX_max_GT_L1);
            //        List<correlation> filtered;

            //        // exclude golden children whose parent is not this correlation
            //        filtered = correlations.Where(p => p.is_golden_child == false ||
            //                                           p.golden_parents.Any(p2 => p2.parent_term.id == parent_term.id)).ToList();

            //        // order golden to top
            //        filtered = filtered.OrderByDescending(p => p.is_golden_child).ToList();

            //        // exclude golden 1 correlations for children of golden 1 nodes
            //        //if (AnyParentHasMmCat(1, tn))
            //        //    filtered = correlations.Where(p => p.is_mm_cat(1) == false).OrderByDescending(p => p.is_golden_2).ThenByDescending(p => p.max_corr).ToList();
            //        //// exclude golden 2 correlations for children of MM root
            //        //else if (tn.Level == 0)
            //        //    filtered = correlations.Where(p => p.is_mm_cat(2) == false).OrderByDescending(p => p.is_golden_1).ThenByDescending(p => p.max_corr).ToList();
            //        //else
            //        //    filtered = correlations;

            //        foreach (var correlation in filtered) {
            //            tn.Nodes.Add(TreeNodeFromCorrelation(correlation));
            //        }
            //        tn.Expand();
            //        this.Cursor = Cursors.Default;
            //    }
            //}
        }
    
        private void contextMenuStrip1_Opening(object sender, CancelEventArgs e) {
            //var p = tvw.PointToClient(Cursor.Position);
            //var ht = tvw.HitTest(p);
            //var node = ht.Node;
            //if (node != null && node.Tag != null) {
            //   if (!(node.Tag is correlation)) { e.Cancel = true; return; }

            //    tvw.SelectedNode = node;
            //    mnuiCtxName.Text = (node.Tag as correlation).ToString();
            //}
        }

        //private term FirstGoldenParent(TreeNode tn) {
        //    //if (tn.Parent == null) return root_term;
        //    //var corr = tn.Parent.Tag as correlation;
        //    //if (corr != null && corr.is_golden_child) return corr.corr_terms.First();
        //    //return FirstGoldenParent(tn.Parent);
        //}

        private void addRootTermToolStripMenuItem_Click(object sender, EventArgs e) {
            //var node = tvw.SelectedNode;
            //if (node != null && node.Tag != null && node.Tag is correlation) {
            //    var corr = node.Tag as correlation;
            //    AddRemoveGolden(node);
            //}
        }

        private void findAtL1_Click(object sender, EventArgs e) {
            //var node = tvw.SelectedNode;
            //if (node != null && node.Tag != null && node.Tag is correlation) {
            //    var corr = node.Tag as correlation;
            //    Debug.Write($"find @l1 for {corr.corr_term}");
            //    this.Cursor = Cursors.WaitCursor;
            //    for(int i=0; i < tvw.Nodes[0].Nodes.Count; i++) {
            //        var tnL1 = tvw.Nodes[0].Nodes[i];
            //        var corrL1 = tnL1.Tag as correlation;
            //        if (corrL1.corr_term == corr.corr_term) {
            //            tvw.SelectedNode = tnL1;
            //            break;
            //        }
            //    }
            //    this.Cursor = Cursors.Default;
            //}
        }

        void AddRemoveGolden(TreeNode tn)//, int? mmcat)
        {
            //var corr = tn.Tag as correlation;
            //var parent_term = FirstGoldenParent(tn);
            //Debug.WriteLine("node.Level=" + tn.Level);
            //Debug.WriteLine("parent_term=" + parent_term.name);
            //Debug.WriteLine("parent_term.golden_mmcat_level=" + parent_term.golden_mmcat_level);
            //using (var db = mm02Entities.Create()) {
            //    this.Cursor = Cursors.WaitCursor;
            //    foreach (var term in corr.corr_terms) {
            //        var golden_term = db.golden_term.Where(p => p.parent_term_id == parent_term.id && p.child_term_id == term.id).SingleOrDefault();
            //        if (golden_term != null) {
            //            // parent/child golden relation already exists; remove
            //            db.golden_term.Remove(golden_term);
            //            db.SaveChangesTraceValidationErrors();
            //        }
            //        else {
            //            // parent/child golden relation doesn't exist; create
            //            golden_term = new golden_term() {
            //                child_term_id = term.id,
            //                parent_term_id = parent_term.id,
            //                mmcat_level = parent_term.golden_mmcat_level + 1
            //            };
            //            db.golden_term.Add(golden_term);
            //            db.SaveChangesTraceValidationErrors();
            //        }
            //        //var term_db = db.terms.Single(p => p.id == term.id);
            //        //term_db.mmcat = mmcat;
            //        //term_db.parent_term_id = mmcat != null ? (long?)parent_term.id : null;
            //        //db.SaveChanges();
            //    }
            //    this.Cursor = Cursors.Default;
            //    //MessageBox.Show($"DONE: set mmcat (golden={mmcat}) for {corr.corr_terms.Count} term(s) '{corr.corr_term}'");

            //    // replace node with new correlation (to reflect updated golden status)
            //    this.Cursor = Cursors.WaitCursor;
            //    tvw.BeginUpdate();
            //    var old_ndx = tn.Index;
            //    var old_parent = tn.Parent;
            //    var new_corr = Correlations.Get2(corr.main_term, corr.corr_term, XX_max_GT_L1);
            //    var tn_new = TreeNodeFromCorrelation(new_corr.First());
            //    old_parent.Nodes.Insert(old_ndx, tn_new);
            //    old_parent.Nodes.Remove(tn);
            //    tvw.EndUpdate();
            //    this.Cursor = Cursors.Default;
            //}
        }


        private void tvw_BeforeExpand(object sender, TreeViewCancelEventArgs e)
        {
        }

        private void tvw_BeforeCheck(object sender, TreeViewCancelEventArgs e)
        {

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
