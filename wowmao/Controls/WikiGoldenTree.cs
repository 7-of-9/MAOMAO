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
            this.NodeMouseHover += WikiGoldenTree_NodeMouseHover;
        }

        private void WikiGoldenTree_NodeMouseHover(object sender, TreeNodeMouseHoverEventArgs e)
        {
            var theNode = e.Node; //this.GetNodeAt(e.X, e.Y);
            if ((theNode != null)) {
                if (theNode.ToolTipText != null) {
                    if (theNode.ToolTipText != this.toolTip1.GetToolTip(this)) {
                        var p = this.PointToClient(Cursor.Position);
                        this.toolTip1.Show(theNode.ToolTipText, this, p.X+5, p.Y+5, 2000);
                    }
                } else this.toolTip1.Show("", this);
            } else this.toolTip1.Show("", this);
        }

        private void WikiGoldenTree_MouseMove(object sender, MouseEventArgs e) {}

        public void BuildTree(string search = null, bool exact = false, bool topics_only = false)
        {
            total_gts_loaded = 0;
            this.BeginUpdate();
            this.Nodes.Clear();
            this.Cursor = Cursors.WaitCursor;
            long term_id = 0;
            long.TryParse(search, out term_id);

            using (var db = mm02Entities.Create()) {
                if (string.IsNullOrEmpty(search) && !topics_only) {
                    // root terms in wiki golden tree
                    var root_term = db.terms.Where(p => p.name == g.WIKI_ROOT_TERM_NAME_CLEANED && (p.term_type_id == (int)g.TT.WIKI_NS_0 || p.term_type_id == (int)g.TT.WIKI_NS_14)).Single();
                    var gts = GoldenTermsFromParentTermId(root_term.id); // term is parent - guaranteed (it's the root term)
                    var nodes = NodesFromGoldenTerms(gts);
                    this.Nodes.AddRange(nodes.ToArray());
                }
                else
                {
                    // search 
                    List<term> terms;
                    IQueryable<term> qry = db.terms.AsNoTracking();
                    if (!string.IsNullOrEmpty(search)) {
                        if (term_id != 0)
                            qry = qry.Where(p => p.id == term_id);
                        else {
                            if (!exact) {
                                var linq_search = $"{search}";
                                qry = qry.Where(p => (p.name.Contains(linq_search) && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0)));
                            }
                            else
                                qry = qry.Where(p => (p.name == search) && (p.term_type_id == (int)g.TT.WIKI_NS_14 || p.term_type_id == (int)g.TT.WIKI_NS_0));
                        }
                    }
                    if (topics_only)
                        qry = qry.Where(p => p.is_topic == true);
                    Debug.WriteLine(qry.ToString());
                    terms = qry.ToListNoLock();

                    foreach (var term in terms) {
                        var gts = GoldenTermsFromChildTermId(term.id); // term is a child - guaranteed: all apart from root are children of something
                        var nodes = NodesFromGoldenTerms(gts);
                        this.Nodes.AddRange(nodes.ToArray());
                    }

                    //??
                    //GetParentTreeForParentTermId(wiki_term.id, nodes); // search terms -- build parent tree for each search result
                }

                /*
                //Parallel.ForEach(wiki_terms.Take(1), new ParallelOptions() { MaxDegreeOfParallelism = 10 }, (wiki_term) =>
                {
                    var gts = GoldenTermsFromParentTermId(wiki_term.id); // WRONG! search term is not necessarily a parent of anything, but it must be a child
                    if (gts.Count > 0)
                    {
                        var nodes = NodesFromGoldenTerms(gts);
                        if (wiki_term.name == g.WIKI_ROOT_TERM_NAME_CLEANED)
                            this.Invoke((MethodInvoker)delegate { this.Nodes.AddRange(nodes.ToArray()); });
                        else
                        {
                            GetParentTreeForParentTermId(wiki_term.id, nodes); // search terms -- build parent tree for each search result
                            var root_parent = GetRootParentNode(nodes[0]);
                            nodes[0].Parent.ForeColor = Color.Red;
                            this.Invoke((MethodInvoker)delegate { this.Nodes.Add(root_parent); });
                        }
                    }
                    //Application.DoEvents();
                }*/
                //);
            }
            this.EndUpdate();
            this.Cursor = Cursors.Default;
        }

        private TreeNode GetRootParentNode(TreeNode node)
        {
            if (node.Parent != null) return GetRootParentNode(node.Parent);
            return node;
        }

        private void GetParentTreeForParentTermId(long term_id, List<TreeNode> nodes)
        {
            // immediate parent(s)
            var gts = GoldenTermsFromChildTermId(term_id);
            foreach (var gt_parent in gts)
            {
                var parent_node = NodesFromGoldenTerms(new List<golden_term>() { gt_parent }).First();
                parent_node.Nodes.AddRange(nodes.ToArray());
                GetParentTreeForParentTermId(gt_parent.parent_term_id, new List<TreeNode>() { parent_node }); // recurse
            }
        }

        private List<golden_term> GoldenTermsFromChildTermId(long child_term_id)
        {
            var db = mm02Entities.Create();
            var qry = db.golden_term
                            .Include("term.golden_term").Include("term.golden_term1")
                            .Include("term1.golden_term").Include("term1.golden_term1")
                            .Where(p => p.child_term_id == child_term_id)
                            .OrderBy(p => p.mmcat_level).ThenBy(p => p.term.name).ThenBy(p => p.term1.name);
            //Debug.WriteLine(qry.ToString());
            var gts = qry.ToListNoLock();
            gts.ForEach(p => Debug.WriteLine($"child_term_id={child_term_id} -> got GTs: {p.ToString()}"));

            this.total_gts_loaded += gts.Count;
            OnGtsLoaded?.Invoke(this.GetType(), new OnGtsLoadedEventArgs() { count_loaded = total_gts_loaded });
            return gts;
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

        private List<TreeNode> NodesFromGoldenTerms(List<golden_term> gts)
        {
            var nodes = new List<TreeNode>();
            foreach(var gt in gts) {
                var node = new TreeNode(gt.ToString());
                node.Tag = gt;
                node.ToolTipText = $"{gt.parent_term.name}[{gt.parent_term.id}] --> {gt.child_term.name}[{gt.child_term.id}]";
                SetNodeFont(node);
                nodes.Add(node);
            }
            return nodes;
        }

        private void SetNodeFont(TreeNode tn) {
            var gt = tn.Tag as golden_term;
            if (gt.child_term.IS_TOPIC) {
                tn.Text = gt.ToString();
                tn.NodeFont = new Font(this.Font, FontStyle.Bold);
                tn.BackColor = RootPathViewer.ColorFromString(gt.child_term.name);
                tn.ForeColor = RootPathViewer.InvertColor(tn.BackColor);
            }
            else {
                tn.Text = gt.ToString();
                tn.NodeFont = new Font(this.Font, FontStyle.Regular);
                tn.BackColor = Color.Transparent;
            }
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
        internal void Search(string searchText, bool exact, bool topics) { BuildTree(searchText, exact, topics); }

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

        private void mnuSearchGoogle_Click(object sender, EventArgs e)
        {
            if (this.SelectedNode == null) return;
            var gt = this.SelectedNode.Tag as golden_term;
            Debug.WriteLine(gt.ToString());
            OnSearchGoogle?.Invoke(this.GetType(), new OnSearchGoogleEventArgs() { search_term = 
                (gt.child_term.term_type_id == (int)g.TT.WIKI_NS_14 ? "Category:" : "") + gt.child_term.name.Replace(" ", "_") });
        }

        private void mnuToggleTopic_Click(object sender, EventArgs e)
        {
            if (this.SelectedNode == null) return;
            var gt = this.SelectedNode.Tag as golden_term;
            using (var db = mm02Entities.Create()) {
                var set_to = !(gt.child_term.is_topic ?? false);
                var terms = db.terms.Where(p => p.name == gt.child_term.name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14));
                foreach (var term in terms.ToListNoLock()) {
                    term.is_topic = set_to;
                    db.SaveChangesTraceValidationErrors();
                }
                gt.child_term.is_topic = set_to;
                SetNodeFont(this.SelectedNode);
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
