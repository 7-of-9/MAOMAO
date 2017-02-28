using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace wowmao.Controls
{
    public partial class TopicTree : UserControl
    {
        private Button cmdRefresh;
        private Label lblInfo;
        private TreeView tvw;
        private ContextMenuStrip contextMenuStrip1;
        private System.ComponentModel.IContainer components;
        private ToolStripMenuItem mnuInfo;
        private ToolStripSeparator mnuSep1;
        private ToolStripMenuItem mnuToggleTopic;
        private ToolTip toolTip1;
        private ToolStripMenuItem mnuExcludeLink;
        private ToolStripMenuItem mnuRootTopic;
        private ToolStripMenuItem mnViewPathsContaining;
        private ToolStripMenuItem mnuViewPaths10;
        private ToolStripMenuItem mnuViewPaths50;
        private ToolStripMenuItem menuViewPaths100;
        private int count;

        public event EventHandler<OnNodeSelectEventArgs> OnNodeSelect = delegate { };
        public class OnNodeSelectEventArgs : EventArgs { public long term_id { get; set; } public int sample_size { get; set; } }

        public TopicTree() {
            InitializeComponent();
            tvw.NodeMouseHover += Tvw_NodeMouseHover;
        }

        private void Tvw_NodeMouseHover(object sender, TreeNodeMouseHoverEventArgs e) {
            var theNode = e.Node;
            if ((theNode != null)) {
                if (theNode.ToolTipText != null) {
                    if (theNode.ToolTipText != this.toolTip1.GetToolTip(this)) {
                        var p = this.PointToClient(Cursor.Position);
                        this.toolTip1.Show(theNode.ToolTipText, this, p.X + 5, p.Y + 5, 2000);
                    }
                }
                else this.toolTip1.Show("", this);
            }
            else this.toolTip1.Show("", this);
        }

        private void cmdRefresh_Click(object sender, EventArgs e) { BuildTree(); }

        private class NodeTag { public term t; public topic_link link; }

        public void BuildTree()
        {
            count = 0;
            this.Cursor = Cursors.WaitCursor;
            using (var db = mm02Entities.Create()) {
                // get root topics
                var explicit_root_topic_ids = db.terms.AsNoTracking().Where(p => p.is_topic_root == true).Select(p => p.id).ToListNoLock();

                var computed_root_topic_ids = db.ObjectContext().ExecuteStoreQuery<long>(
                    "SELECT DISTINCT [parent_term_id] FROM [topic_link] WHERE [parent_term_id] NOT IN (SELECT DISTINCT [child_term_id] FROM [topic_link])").ToList();

                var all_root_topic_ids = explicit_root_topic_ids.Union(computed_root_topic_ids);//.Distinct();

                tvw.Nodes.Clear();
                //tvw.BeginUpdate();
                foreach (var root_topic_id in all_root_topic_ids) {
                    var term = db.terms.Find(root_topic_id);
                    var tn_root = NodeFromTerm(term);
                    tvw.Nodes.Add(tn_root);
                    AddChildren(tn_root, root_topic_id, new List<long>());
                }
                //tvw.EndUpdate();
            }
            this.Cursor = Cursors.Default;
            this.lblInfo.Text = $">> total links: {count}";
        }

        private void AddChildren(TreeNode parent_node, long parent_topic_id, List<long> term_ids)
        {
            using (var db = mm02Entities.Create()) {
                var topic_links = db.topic_link.Include("term").Include("term1").AsNoTracking().Where(p => p.parent_term_id == parent_topic_id).OrderBy(p => p.max_distance).ToListNoLock();
                foreach (var link in topic_links) {
                    //if (!term_ids.Contains(link.child_term_id)) { 
                    if (!TermInParentsChain(parent_node, link.child_term_id)) {
                        var child_node = NodeFromTerm(link.child_term, link);
                        parent_node.Nodes.Add(child_node);
                        term_ids.Add(link.child_term_id);

                        if (!link.disabled)
                            AddChildren(child_node, link.child_term_id, term_ids);
                    }
                    else
                        ;// Debugger.Break();
                }
            }
        }

        private bool TermInParentsChain(TreeNode tn, long term_id)
        {
            var node_tag = tn.Tag as NodeTag;
            if (node_tag.t.id == term_id) return true;
            if (tn.Parent == null) return false;
            return TermInParentsChain(tn.Parent, term_id);
        }

        private TreeNode NodeFromTerm(term t, topic_link link = null) {
            var node_desc = link != null && link.disabled ? ($"({t})") : t.ToString();

            var tn = new TreeNode(node_desc);
            if (link != null)
                tn.Text += $" SEEN={link.seen_count} MIN_D={link.min_distance} MAX_D={link.max_distance}";
            tn.Tag = new NodeTag() { t = t, link = link };
            //tn.NodeFont = new Font(this.Font, FontStyle.Bold);
            if (link != null && link.disabled) {
                tn.ForeColor = Color.Gray;
            }
            else {
                tn.BackColor = RootPathViewer.ColorFromString(t.name);
                tn.ForeColor = RootPathViewer.InvertColor(tn.BackColor);
                tn.Text += $" (R={tn.BackColor.R} G={tn.BackColor.G} B={tn.BackColor.B})";
            }
            tn.ToolTipText = link == null ? node_desc : $"{link.parent_term} ==> {link.child_term}";
            count++;
            return tn;
        }

        // populate sample paths to root in root path viewer
        private void mnViewPathsContaining_Click(object sender, EventArgs e) { }
        private void tvw_AfterSelect(object sender, TreeViewEventArgs e) { }
        private void mnuViewPaths10_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size = 10 }); }
        private void mnuViewPaths50_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size = 50 }); }
        private void menuViewPaths100_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size=100 }); }

        // marks the link as disabled -- retains terms as topics, just prevents the link being valid
        private void mnuExcludeLink_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            using (var db = mm02Entities.Create()) {
                var link = db.topic_link.Find(tag.link.id);
                link.disabled = !link.disabled;
                db.SaveChangesTraceValidationErrors();

                tag.link = link;
                var new_node = NodeFromTerm(tag.t, tag.link);
                var parent = node.Parent;
                parent.Nodes.Remove(node);
                parent.Nodes.Add(new_node);
            }
        }

        // set term as NOT TOPIC -- removes from tree
        private void mnuToggleTopic_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            using (var db = mm02Entities.Create()) {
                var terms = db.terms.Where(p => p.name == tag.t.name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14)).ToListNoLock();
                if (MessageBox.Show($"Set following term(s) as NOT topics?\r\n{string.Join("\r\n", terms.Select(p => p))}", "wowmao", MessageBoxButtons.YesNo) == DialogResult.Yes) { 
                    foreach (var term in terms)
                        term.is_topic = false;
                    db.SaveChangesTraceValidationErrors();
                    if (node.Parent != null)
                        node.Parent.Nodes.Remove(node);
                    else
                        tvw.Nodes.Remove(node);
                }
            }
        }

        // toggles root-topic flag on term
        private void mnuRootTopic_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            using (var db = mm02Entities.Create()) {
                //var terms = db.terms.Where(p => p.name == tag.t.name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14));
                var terms = db.terms.Where(p => p.id == tag.t.id).ToListNoLock();
                bool current_is_topic_root = terms.First().is_topic_root;
                foreach (var term in terms)
                    term.is_topic_root = !current_is_topic_root;
                db.SaveChangesTraceValidationErrors();
            }
            this.BuildTree();
        }

        private void contextMenuStrip1_Opening(object sender, System.ComponentModel.CancelEventArgs e) {
            var pt = tvw.PointToClient(Cursor.Position);
            var ht = tvw.HitTest(pt);
            var node = ht.Node;
            if (node != null && node.Tag != null) {
                tvw.SelectedNode = node;
                var tag = tvw.SelectedNode.Tag as NodeTag;
                this.mnuInfo.Text = tag.link != null ? tag.link.ToString() : tag.t.ToString();
            }
        }


        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.tvw = new System.Windows.Forms.TreeView();
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.mnuInfo = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuSep1 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuToggleTopic = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuExcludeLink = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuRootTopic = new System.Windows.Forms.ToolStripMenuItem();
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.lblInfo = new System.Windows.Forms.Label();
            this.toolTip1 = new System.Windows.Forms.ToolTip(this.components);
            this.mnViewPathsContaining = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuViewPaths10 = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuViewPaths50 = new System.Windows.Forms.ToolStripMenuItem();
            this.menuViewPaths100 = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tvw
            // 
            this.tvw.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tvw.ContextMenuStrip = this.contextMenuStrip1;
            this.tvw.Location = new System.Drawing.Point(3, 26);
            this.tvw.Name = "tvw";
            this.tvw.Size = new System.Drawing.Size(333, 295);
            this.tvw.TabIndex = 0;
            this.tvw.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.tvw_AfterSelect);
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuInfo,
            this.mnuSep1,
            this.mnuToggleTopic,
            this.mnuExcludeLink,
            this.mnuRootTopic,
            this.mnViewPathsContaining});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(203, 142);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuInfo
            // 
            this.mnuInfo.Enabled = false;
            this.mnuInfo.Name = "mnuInfo";
            this.mnuInfo.Size = new System.Drawing.Size(202, 22);
            this.mnuInfo.Text = "(info)";
            // 
            // mnuSep1
            // 
            this.mnuSep1.Name = "mnuSep1";
            this.mnuSep1.Size = new System.Drawing.Size(199, 6);
            // 
            // mnuToggleTopic
            // 
            this.mnuToggleTopic.Name = "mnuToggleTopic";
            this.mnuToggleTopic.Size = new System.Drawing.Size(202, 22);
            this.mnuToggleTopic.Text = "Not a Topic!";
            this.mnuToggleTopic.Click += new System.EventHandler(this.mnuToggleTopic_Click);
            // 
            // mnuExcludeLink
            // 
            this.mnuExcludeLink.Name = "mnuExcludeLink";
            this.mnuExcludeLink.Size = new System.Drawing.Size(202, 22);
            this.mnuExcludeLink.Text = "Toggle disable_link";
            this.mnuExcludeLink.Click += new System.EventHandler(this.mnuExcludeLink_Click);
            // 
            // mnuRootTopic
            // 
            this.mnuRootTopic.Name = "mnuRootTopic";
            this.mnuRootTopic.Size = new System.Drawing.Size(202, 22);
            this.mnuRootTopic.Text = "Toggle ROOT";
            this.mnuRootTopic.Click += new System.EventHandler(this.mnuRootTopic_Click);
            // 
            // cmdRefresh
            // 
            this.cmdRefresh.Location = new System.Drawing.Point(3, 3);
            this.cmdRefresh.Name = "cmdRefresh";
            this.cmdRefresh.Size = new System.Drawing.Size(70, 20);
            this.cmdRefresh.TabIndex = 1;
            this.cmdRefresh.Text = "refresh";
            this.cmdRefresh.UseVisualStyleBackColor = true;
            this.cmdRefresh.Click += new System.EventHandler(this.cmdRefresh_Click);
            // 
            // lblInfo
            // 
            this.lblInfo.AutoSize = true;
            this.lblInfo.BackColor = System.Drawing.Color.LightSalmon;
            this.lblInfo.Location = new System.Drawing.Point(79, 7);
            this.lblInfo.Name = "lblInfo";
            this.lblInfo.Size = new System.Drawing.Size(25, 13);
            this.lblInfo.TabIndex = 2;
            this.lblInfo.Text = "......";
            // 
            // mnViewPathsContaining
            // 
            this.mnViewPathsContaining.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuViewPaths10,
            this.mnuViewPaths50,
            this.menuViewPaths100});
            this.mnViewPathsContaining.Name = "mnViewPathsContaining";
            this.mnViewPathsContaining.Size = new System.Drawing.Size(202, 22);
            this.mnViewPathsContaining.Text = "View Paths Containing...";
            this.mnViewPathsContaining.Click += new System.EventHandler(this.mnViewPathsContaining_Click);
            // 
            // mnuViewPaths10
            // 
            this.mnuViewPaths10.Name = "mnuViewPaths10";
            this.mnuViewPaths10.Size = new System.Drawing.Size(152, 22);
            this.mnuViewPaths10.Text = "10";
            this.mnuViewPaths10.Click += new System.EventHandler(this.mnuViewPaths10_Click);
            // 
            // mnuViewPaths50
            // 
            this.mnuViewPaths50.Name = "mnuViewPaths50";
            this.mnuViewPaths50.Size = new System.Drawing.Size(152, 22);
            this.mnuViewPaths50.Text = "50";
            this.mnuViewPaths50.Click += new System.EventHandler(this.mnuViewPaths50_Click);
            // 
            // menuViewPaths100
            // 
            this.menuViewPaths100.Name = "menuViewPaths100";
            this.menuViewPaths100.Size = new System.Drawing.Size(152, 22);
            this.menuViewPaths100.Text = "100";
            this.menuViewPaths100.Click += new System.EventHandler(this.menuViewPaths100_Click);
            // 
            // TopicTree
            // 
            this.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.Controls.Add(this.lblInfo);
            this.Controls.Add(this.cmdRefresh);
            this.Controls.Add(this.tvw);
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Name = "TopicTree";
            this.Size = new System.Drawing.Size(339, 325);
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

    
    }
}
