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
using mm_global;
using System.Diagnostics;

namespace wowmao.Controls
{
    public partial class WikiGoldenTree : TreeView
    {
        public event EventHandler<SearchGoldenTermEventArgs> OnSearchGoldenTerm = delegate { };
        public class SearchGoldenTermEventArgs : EventArgs { public long golden_term_id { get; set; } }

        public event EventHandler<OnSearchGoogleEventArgs> OnSearchGoogle = delegate { };
        public class OnSearchGoogleEventArgs : EventArgs { public string search_term { get; set; } }


        public event EventHandler<OnGtsLoadedEventArgs> OnGtsLoaded = delegate { };
        public class OnGtsLoadedEventArgs : EventArgs { public int count_loaded { get; set; } }

        public int total_gts_loaded = 0;

        public WikiGoldenTree()
        {
            InitializeComponent();
            this.ContextMenuStrip = this.contextMenuStrip1;
            this.AfterExpand += WikiGoldenTree_AfterExpand;
            this.AfterSelect += WikiGoldenTree_AfterSelect;
            this.MouseMove += WikiGoldenTree_MouseMove;
        }

        private void WikiGoldenTree_MouseMove(object sender, MouseEventArgs e)
        {
            TreeNode theNode = this.GetNodeAt(e.X, e.Y);
            if ((theNode != null)) {
                if (theNode.ToolTipText != null) {
                    if (theNode.ToolTipText != this.toolTip1.GetToolTip(this))
                    {
                        this.toolTip1.SetToolTip(this, theNode.ToolTipText);
                    }
                }
                else
                    this.toolTip1.SetToolTip(this, "");
            }
            else
                this.toolTip1.SetToolTip(this, "");
        }

        public void BuildTree(string search_text_root = null)
        {
            total_gts_loaded = 0;
            this.BeginUpdate();
            this.Nodes.Clear();
            this.Cursor = Cursors.WaitCursor;
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                List<term> root_wiki_terms;
                if (string.IsNullOrEmpty(search_text_root))
                    root_wiki_terms = db.terms.Where(p => p.name == g.WIKI_ROOT_TERM_NAME_CLEANED && p.term_type_id == (int)g.TT.WIKI_CAT).ToListNoLock();
                else
                    root_wiki_terms = db.terms.Where(p => p.name.Contains(search_text_root) && p.term_type_id == (int)g.TT.WIKI_CAT).ToListNoLock();

                foreach (var root_wiki_term in root_wiki_terms) {
                    var gts = GoldenTermsFromParentTermId(root_wiki_term.id);
                    var nodes = NodesFromGoldenTerms(gts);
                    this.Nodes.AddRange(nodes.ToArray());
                    Application.DoEvents();
                }
            }
            this.EndUpdate();
            this.Cursor = Cursors.Default;
        }

        private List<TreeNode> NodesFromGoldenTerms(List<golden_term> gts)
        {
            var nodes = new List<TreeNode>();
            foreach(var gt in gts)
            {
                var node = new TreeNode(gt.ToString());
                node.Tag = gt;
                node.ToolTipText = $"{gt.parent_term.name}[{gt.parent_term.id}] --> {gt.child_term.name}[{gt.child_term.id}]";
                nodes.Add(node);
            }
            return nodes;
        }

        private List<golden_term> GoldenTermsFromParentTermId(long parent_term_id)
        {
            var db = mm02Entities.Create();
            var qry = db.golden_term
                            .Include("term.golden_term").Include("term.golden_term1")
                            .Include("term1.golden_term").Include("term1.golden_term1")
                            .Where(p => p.parent_term_id == parent_term_id)
                            .OrderBy(p => p.mmcat_level).ThenBy(p => p.term.name).ThenBy(p => p.term1.name);
            //Debug.WriteLine(qry.ToString());
            var gts = qry.ToListNoLock();
            this.total_gts_loaded += gts.Count;
            OnGtsLoaded?.Invoke(this.GetType(), new OnGtsLoadedEventArgs() { count_loaded = total_gts_loaded });
            return gts;
        }

        private void WikiGoldenTree_AfterSelect(object sender, TreeViewEventArgs e)
        {
            if (sender != null) {
                this.Cursor = Cursors.WaitCursor;
                this.BeginUpdate();
            }
            var gt = e.Node.Tag as golden_term;
            if (e.Node.Nodes.Count == 0) {
                var gts = GoldenTermsFromParentTermId(gt.child_term_id);
                var nodes = NodesFromGoldenTerms(gts);
                e.Node.Nodes.AddRange(nodes.ToArray());
            }
            e.Node.Expand();
            if (sender != null) { 
                this.EndUpdate();
                this.Cursor = Cursors.Default;
            }
        }

        #region Get All
        bool stop_get_all = false;
        internal void StartGetAll(TreeNodeCollection nodes) {
            stop_get_all = false;
            this.BeginUpdate();
            GetAll(nodes);
            this.EndUpdate();
        }
        private void GetAll(TreeNodeCollection nodes) {
            foreach (var node in nodes) {
                var tn = ((TreeNode)node);
                WikiGoldenTree_AfterSelect(null, new TreeViewEventArgs(tn));
                if (!stop_get_all)
                    GetAll(tn.Nodes);
                else
                    { this.EndUpdate(); break; }
                Application.DoEvents();
            }
        }
        internal void StopGetAll() { stop_get_all = true; }
        #endregion

        #region Search
        internal void Search(string searchText) { BuildTree(searchText); }

        //private List<TreeNode> CurrentNodeMatches = new List<TreeNode>();
        //private int LastNodeIndex = 0;
        //private string LastSearchText;
        //internal void Search(string searchText)
        //{
        //    if (String.IsNullOrEmpty(searchText)) return;
        //    if (LastSearchText != searchText) { //It's a new Search
        //        CurrentNodeMatches.Clear();
        //        LastSearchText = searchText;
        //        LastNodeIndex = 0;
        //        SearchNodes(searchText, this.Nodes[0]);
        //    }
        //    if (LastNodeIndex >= 0 && CurrentNodeMatches.Count > 0 && LastNodeIndex < CurrentNodeMatches.Count) {
        //        TreeNode selectedNode = CurrentNodeMatches[LastNodeIndex];
        //        LastNodeIndex++;
        //        this.SelectedNode = selectedNode;
        //        this.SelectedNode.Expand();
        //        this.Select();
        //    }
        //}
        //private void SearchNodes(string SearchText, TreeNode StartNode) {
        //    while (StartNode != null) {
        //        if (StartNode.Text.ToLower().Contains(SearchText.ToLower())) {
        //            CurrentNodeMatches.Add(StartNode);
        //        };
        //        if (StartNode.Nodes.Count != 0) {
        //            SearchNodes(SearchText, StartNode.Nodes[0]);//Recursive Search 
        //        };
        //        StartNode = StartNode.NextNode;
        //    };
        //}
        #endregion

        private void WikiGoldenTree_AfterExpand(object sender, TreeViewEventArgs e)
        {
        }

        private void contextMenuStrip1_Opening(object sender, CancelEventArgs e)
        {
            var pt = this.PointToClient(Cursor.Position);
            var ht = this.HitTest(pt);
            var node = ht.Node;
            if (node != null && node.Tag != null) {
                this.SelectedNode = node;
                var gt = this.SelectedNode.Tag as golden_term;
                var nodes_path = new List<TreeNode>();
                GetParentNodes(this.SelectedNode, nodes_path);
                var gts_path = nodes_path.Select(p => p.Tag).Cast<golden_term>();
                var terms_path = gts_path.Select(p => p.child_term);
                this.mnuInfo.Text = string.Join(" / ", terms_path.Select(p => p.name).ToArray());
            }
        }

        private void GetParentNodes(TreeNode node, List<TreeNode> parents) {
            parents.Add(node);
            if (node.Parent != null)
                GetParentNodes(node.Parent, parents);
        }

        //private TreeNode NodeFromTerm(term t, golden_term parent_gt = null)
        //{
        //    var node = new TreeNode($"{t.ToString()}");
        //    if (parent_gt != null && parent_gt.autosuggested_at_utc != null)
        //        node.Text += $" (autogold @{parent_gt.autosuggested_at_utc?.ToString("dd MMM yyyy HH:mm")}";
        //    node.Tag = new NodeTag() { term = t, golden_term = parent_gt };
        //    return node;
        //}
    }
}
