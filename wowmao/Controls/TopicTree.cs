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
        private ToolStripMenuItem mnuFindInWikiTree;
        private ToolStripSeparator toolStripSeparator1;
        private ToolStripSeparator toolStripSeparator2;
        private ContextMenuStrip contextMenuStrip2;
        private ToolStripMenuItem toolStripMenuItem1;
        private ToolStripSeparator toolStripSeparator6;
        private ToolStripSeparator toolStripSeparator3;
        private ToolStripMenuItem toolStripMenuItem2;
        private ToolStripSeparator toolStripSeparator4;
        private ToolStripMenuItem toolStripMenuItem3;
        private ToolStripMenuItem toolStripMenuItem4;
        private ToolStripSeparator toolStripSeparator5;
        private ToolStripMenuItem toolStripMenuItem5;
        private ToolStripMenuItem toolStripMenuItem6;
        private ToolStripMenuItem toolStripMenuItem7;
        private ToolStripMenuItem toolStripMenuItem8;
        private ToolStripMenuItem toolStripMenuItem9;
        private ToolStripMenuItem mnuOnlyHere;
        private ToolStripSeparator toolStripSeparator7;
        private ToolStripMenuItem mnuOnlyHere2;
        private ToolStripSeparator toolStripSeparator8;
        private ToolStripMenuItem mnuRefreshNode;
        private int count;

        public event EventHandler<OnNodeSelectEventArgs> OnNodeSelect = delegate { };
        public class OnNodeSelectEventArgs : EventArgs { public long term_id { get; set; } public int sample_size { get; set; } }

        public event EventHandler<OnFindInWikiTreeEventArgs> OnFindInWikiTree = delegate { };
        public class OnFindInWikiTreeEventArgs : EventArgs { public long term_id { get; set; } }

        public TopicTree() {
            InitializeComponent();
            tvw.NodeMouseHover += Tvw_NodeMouseHover;
        }

        private class NodeTag { public term t; public topic_link link; public int enabled_child_link_count; }
        public void BuildTree()
        {
            count = 0;
            this.Cursor = Cursors.WaitCursor;
            using (var db = mm02Entities.Create()) {
                // get root topics
                var explicit_root_topic_ids = db.terms.AsNoTracking().Where(p => p.is_topic_root == true).Select(p => p.id).ToListNoLock();

                var computed_root_topic_ids = db.ObjectContext().ExecuteStoreQuery<long>(
                    "SELECT DISTINCT [parent_term_id] FROM [topic_link] WHERE [parent_term_id] NOT IN (SELECT DISTINCT [child_term_id] FROM [topic_link] WHERE [disabled]=0)").ToList();

                var all_root_topic_ids = explicit_root_topic_ids.Union(computed_root_topic_ids);//.Distinct();

                tvw.Nodes.Clear();
                //tvw.BeginUpdate();
                foreach (var root_topic_id in all_root_topic_ids) {
                    var term = db.terms.Find(root_topic_id);
                    var tn_root = NodeFromTerm(term);
                    tvw.Nodes.Add(tn_root);
                    AddChildren(tn_root, root_topic_id);
                }
                //tvw.EndUpdate();
            }
            this.Cursor = Cursors.Default;
        }

        private void AddChildren(TreeNode parent_node, long parent_topic_id) {
            this.Cursor = Cursors.WaitCursor;
            this.tvw.BeginUpdate();
            using (var db = mm02Entities.Create()) {
                var topic_links = db.topic_link.Include("term").Include("term1").AsNoTracking()
                                    .Where(p => p.parent_term_id == parent_topic_id)
                                    .OrderBy(p => p.disabled)
                                    .ThenBy(p => p.max_distance)
                                    .ToListNoLock();
                foreach (var link in topic_links) {
                    if (!TermInParentsChain(parent_node, link.child_term_id)) {

                        // maintain mmtopic_level
                        if (link.disabled == false) {
                            // TL 1 = root terms (no entry in topic_link!), TL 2 = first level children of root terms, TL 0 = undefined/not in topic tree
                            var correct_mmtopic_level = parent_node.Level + 2;
                            if (link.mmtopic_level != correct_mmtopic_level) {
                                db.Database.ExecuteSqlCommand("UPDATE [topic_link] SET mmtopic_level={0} WHERE id={1}", correct_mmtopic_level, link.id);
                                link.mmtopic_level = correct_mmtopic_level;
                            }
                        }

                        var child_node = NodeFromTerm(link.child_term, link);
                        parent_node.Nodes.Add(child_node);

                        if (!link.disabled && child_node.Level < 3)
                            tvw.SelectedNode = child_node;
                    }
                    else ;// Debugger.Break();
                }
            }
            this.tvw.EndUpdate();
            this.lblInfo.Text = $">> links loaded: {count}";
            this.Cursor = Cursors.Default;
        }

        private bool TermInParentsChain(TreeNode tn, long term_id) {
            var node_tag = tn.Tag as NodeTag;
            if (node_tag.t.id == term_id) return true;
            if (tn.Parent == null) return false;
            return TermInParentsChain(tn.Parent, term_id);
        }

        private TreeNode NodeFromTerm(term t, topic_link link = null) {

            var enabled_child_link_count = -1;
            using (var db = mm02Entities.Create()) {
                if (link != null) {
                    // how many times does child appear in enabled state in topic_link -- we want only one parent per topic
                    enabled_child_link_count = db.topic_link.Count(p => p.child_term_id == link.child_term_id && !p.disabled);
                }
            }

            var node_desc = link != null && link.disabled ? ($"({t.ToString()})") : t.ToString();

            if (enabled_child_link_count != -1)
                node_desc += $" C={enabled_child_link_count}";

            var tn = new TreeNode(node_desc);
            tn.Tag = new NodeTag() { t = t, link = link, enabled_child_link_count = enabled_child_link_count };
            if (link != null)
                tn.Text += $" *TL={link.mmtopic_level} (#={link.seen_count} min_d={link.min_distance} max_d={link.max_distance})";

            // highlight topics linked more than once
            if (enabled_child_link_count > 1)
                { tn.Text = "### " + tn.Text; tn.NodeFont = new Font(tvw.Font, FontStyle.Underline); }

            // highlight root topics not at root
            if (t.is_topic_root && link != null)
                { tn.Text = "### " + tn.Text; tn.NodeFont = new Font(tvw.Font, FontStyle.Underline); }

            // format color node
            if (link != null && link.disabled)
                tn.ForeColor = Color.Gray;
            else {
                tn.BackColor = RootPathViewer.ColorFromString(t.name);
                tn.ForeColor = RootPathViewer.InvertColor(tn.BackColor);
                //tn.Text += 
            }

            tn.ToolTipText = (link == null ? node_desc : $"{link.parent_term.name} ==> {link.child_term.name}")
                             + $" (R={ tn.BackColor.R} G={ tn.BackColor.G} B ={ tn.BackColor.B})";
            count++;
            return tn;
        }

        private void tvw_AfterSelect(object sender, TreeViewEventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            if (node.Nodes.Count == 0)
                AddChildren(node, tag.t.id);
            node.Expand();
        }

        private void Tvw_NodeMouseHover(object sender, TreeNodeMouseHoverEventArgs e) {
            var theNode = e.Node;
            if ((theNode != null)) {
                if (theNode.ToolTipText != null) {
                    if (theNode.ToolTipText != this.toolTip1.GetToolTip(this.tvw)) {
                        Debug.WriteLine(theNode.Text);
                        var p = this.tvw.PointToClient(Cursor.Position);
                        this.toolTip1.Show("", this.tvw);
                        this.toolTip1.Show(theNode.ToolTipText, this.tvw, p.X + 5, p.Y + 5, 2000);
                    }
                }
                else this.toolTip1.Show("", this.tvw);
            }
            else this.toolTip1.Show("", this.tvw);
        }

        private void cmdRefresh_Click(object sender, EventArgs e) { BuildTree(); }

        // populate sample paths to root in root path viewer
        private void mnViewPathsContaining_Click(object sender, EventArgs e) { }
        private void mnuViewPaths10_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size = 10 }); }
        private void mnuViewPaths50_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size = 50 }); }
        private void menuViewPaths100_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnNodeSelect?.Invoke(this.GetType(), new OnNodeSelectEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id, sample_size=100 }); }

        // find topic in wiki tree
        private void mnuFindInWikiTree_Click(object sender, EventArgs e) { if (tvw.SelectedNode == null) return; OnFindInWikiTree?.Invoke(this.GetType(), new OnFindInWikiTreeEventArgs() { term_id = (tvw.SelectedNode.Tag as NodeTag).t.id }); }

        // marks the link as disabled -- retains terms as topics, just prevents the link being valid
        private void mnuExcludeLink_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            using (var db = mm02Entities.Create()) {
                var link = db.topic_link.Find(tag.link.id);
                if (link != null) {
                    link.disabled = !link.disabled;
                    db.SaveChangesTraceValidationErrors();
                    tag.link = link;
                }
                RefreshNode(node, tag.t, tag.link);
            }
        }

        private void RefreshNode(TreeNode node, term t, topic_link link) {
            var new_node = NodeFromTerm(t, link);
            var parent_nodes = node.Parent?.Nodes ?? tvw.Nodes;
            var old_ndx = node.Index;
            parent_nodes.Remove(node);
            parent_nodes.Insert(old_ndx, new_node);
            tvw.SelectedNode = new_node;
        }

        // set term as NOT TOPIC -- removes from tree
        private void mnuToggleTopic_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            using (var db = mm02Entities.Create()) {
                var terms = db.terms.Where(p => p.name == tag.t.name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14)).ToListNoLock();
                if (MessageBox.Show($"Set following term(s) as NOT topics?\r\n{string.Join("\r\n", terms.Select(p => p))}", "wowmao", MessageBoxButtons.YesNo) == DialogResult.Yes) {

                    Maintenance.SetTopicFlag(false, tag.t.name);

                    // remove topic flag from term(s)
                    //terms.ForEach(p => p.is_topic = false);
                    //db.SaveChangesTraceValidationErrors();
                    //// delete term() from topic_link
                    //db.ObjectContext().ExecuteStoreCommand(
                    //    "DELETE FROM [topic_link] WHERE [parent_term_id] IN ({0}) OR [child_term_id] IN ({0})",
                    //    string.Join(",", terms.Select(p => p.id)));

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
                var terms = db.terms.Where(p => p.id == tag.t.id).ToListNoLock();
                bool current_is_topic_root = terms.First().is_topic_root;
                foreach (var term in terms)
                    term.is_topic_root = !current_is_topic_root;
                db.SaveChangesTraceValidationErrors();
            }
            //this.BuildTree();
        }

        // simplify tree -- only here: disables all other topic_link appearances for this child term, so that the only remaining link is this one
        private void mnuOnlyHere2_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            this.Cursor = Cursors.WaitCursor;
            using (var db = mm02Entities.Create()) {
                var links_to_disable =
                    tag.link != null ? db.topic_link.Where(p => p.child_term_id == tag.link.child_term_id && p.id != tag.link.id).ToListNoLock()
                                     : db.topic_link.Where(p => p.child_term_id == tag.t.id).ToListNoLock();
                links_to_disable.ForEach(p => p.disabled = true);
                db.SaveChangesTraceValidationErrors();
                RefreshNode(node, tag.t, tag.link);
            }
            this.Cursor = Cursors.Default;
        }

        private void mnuRefreshNode_Click(object sender, EventArgs e) {
            if (tvw.SelectedNode == null) return;
            var node = tvw.SelectedNode;
            var tag = node.Tag as NodeTag;
            this.Cursor = Cursors.WaitCursor;
            node.Nodes.Clear();
            AddChildren(node, tag.link.child_term_id);
            this.Cursor = Cursors.Default;
        }

        private void contextMenuStrip1_Opening(object sender, System.ComponentModel.CancelEventArgs e) {
            var pt = tvw.PointToClient(Cursor.Position);
            var ht = tvw.HitTest(pt);
            var node = ht.Node;
            if (node != null && node.Tag != null) {
                tvw.SelectedNode = node;
                var tag = tvw.SelectedNode.Tag as NodeTag;
                this.mnuInfo.Text = tag.link != null ? tag.link.ToString() : tag.t.ToString();
                this.mnuOnlyHere.Enabled = tag.enabled_child_link_count > 1;

                this.mnuExcludeLink.Enabled = tag.link != null;
                this.mnuExcludeLink.Text = tag.link != null && tag.link.disabled ? "Enable Here" : "Not Here";

                this.mnuRootTopic.Text = tag.t.is_topic_root ? "Remove ROOT" : "Add ROOT";
            }
        }

        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.tvw = new System.Windows.Forms.TreeView();
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.mnuInfo = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuToggleTopic = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator7 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuOnlyHere2 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator2 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuExcludeLink = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuRootTopic = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuSep1 = new System.Windows.Forms.ToolStripSeparator();
            this.mnViewPathsContaining = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuViewPaths10 = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuViewPaths50 = new System.Windows.Forms.ToolStripMenuItem();
            this.menuViewPaths100 = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuFindInWikiTree = new System.Windows.Forms.ToolStripMenuItem();
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.lblInfo = new System.Windows.Forms.Label();
            this.toolTip1 = new System.Windows.Forms.ToolTip(this.components);
            this.contextMenuStrip2 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.toolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator6 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuOnlyHere = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator3 = new System.Windows.Forms.ToolStripSeparator();
            this.toolStripMenuItem2 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator4 = new System.Windows.Forms.ToolStripSeparator();
            this.toolStripMenuItem3 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem4 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator5 = new System.Windows.Forms.ToolStripSeparator();
            this.toolStripMenuItem5 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem6 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem7 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem8 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripMenuItem9 = new System.Windows.Forms.ToolStripMenuItem();
            this.toolStripSeparator8 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuRefreshNode = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.contextMenuStrip2.SuspendLayout();
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
            this.toolStripSeparator1,
            this.mnuToggleTopic,
            this.toolStripSeparator7,
            this.mnuOnlyHere2,
            this.toolStripSeparator2,
            this.mnuExcludeLink,
            this.mnuRootTopic,
            this.mnuSep1,
            this.mnViewPathsContaining,
            this.mnuFindInWikiTree,
            this.toolStripSeparator8,
            this.mnuRefreshNode});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(159, 232);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuInfo
            // 
            this.mnuInfo.Enabled = false;
            this.mnuInfo.Name = "mnuInfo";
            this.mnuInfo.Size = new System.Drawing.Size(158, 22);
            this.mnuInfo.Text = "(info)";
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(155, 6);
            // 
            // mnuToggleTopic
            // 
            this.mnuToggleTopic.Name = "mnuToggleTopic";
            this.mnuToggleTopic.Size = new System.Drawing.Size(158, 22);
            this.mnuToggleTopic.Text = "REMOVE TOPIC";
            this.mnuToggleTopic.Click += new System.EventHandler(this.mnuToggleTopic_Click);
            // 
            // toolStripSeparator7
            // 
            this.toolStripSeparator7.Name = "toolStripSeparator7";
            this.toolStripSeparator7.Size = new System.Drawing.Size(155, 6);
            // 
            // mnuOnlyHere2
            // 
            this.mnuOnlyHere2.Name = "mnuOnlyHere2";
            this.mnuOnlyHere2.Size = new System.Drawing.Size(158, 22);
            this.mnuOnlyHere2.Text = "Only Here!";
            this.mnuOnlyHere2.Click += new System.EventHandler(this.mnuOnlyHere2_Click);
            // 
            // toolStripSeparator2
            // 
            this.toolStripSeparator2.Name = "toolStripSeparator2";
            this.toolStripSeparator2.Size = new System.Drawing.Size(155, 6);
            // 
            // mnuExcludeLink
            // 
            this.mnuExcludeLink.Name = "mnuExcludeLink";
            this.mnuExcludeLink.Size = new System.Drawing.Size(158, 22);
            this.mnuExcludeLink.Text = "toggle DISABLE";
            this.mnuExcludeLink.Click += new System.EventHandler(this.mnuExcludeLink_Click);
            // 
            // mnuRootTopic
            // 
            this.mnuRootTopic.Name = "mnuRootTopic";
            this.mnuRootTopic.Size = new System.Drawing.Size(158, 22);
            this.mnuRootTopic.Text = "toggle ROOT";
            this.mnuRootTopic.Click += new System.EventHandler(this.mnuRootTopic_Click);
            // 
            // mnuSep1
            // 
            this.mnuSep1.Name = "mnuSep1";
            this.mnuSep1.Size = new System.Drawing.Size(155, 6);
            // 
            // mnViewPathsContaining
            // 
            this.mnViewPathsContaining.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuViewPaths10,
            this.mnuViewPaths50,
            this.menuViewPaths100});
            this.mnViewPathsContaining.Name = "mnViewPathsContaining";
            this.mnViewPathsContaining.Size = new System.Drawing.Size(158, 22);
            this.mnViewPathsContaining.Text = "Sample Paths...";
            this.mnViewPathsContaining.Click += new System.EventHandler(this.mnViewPathsContaining_Click);
            // 
            // mnuViewPaths10
            // 
            this.mnuViewPaths10.Name = "mnuViewPaths10";
            this.mnuViewPaths10.Size = new System.Drawing.Size(92, 22);
            this.mnuViewPaths10.Text = "10";
            this.mnuViewPaths10.Click += new System.EventHandler(this.mnuViewPaths10_Click);
            // 
            // mnuViewPaths50
            // 
            this.mnuViewPaths50.Name = "mnuViewPaths50";
            this.mnuViewPaths50.Size = new System.Drawing.Size(92, 22);
            this.mnuViewPaths50.Text = "50";
            this.mnuViewPaths50.Click += new System.EventHandler(this.mnuViewPaths50_Click);
            // 
            // menuViewPaths100
            // 
            this.menuViewPaths100.Name = "menuViewPaths100";
            this.menuViewPaths100.Size = new System.Drawing.Size(92, 22);
            this.menuViewPaths100.Text = "100";
            this.menuViewPaths100.Click += new System.EventHandler(this.menuViewPaths100_Click);
            // 
            // mnuFindInWikiTree
            // 
            this.mnuFindInWikiTree.Name = "mnuFindInWikiTree";
            this.mnuFindInWikiTree.Size = new System.Drawing.Size(158, 22);
            this.mnuFindInWikiTree.Text = "Find in WikiTree";
            this.mnuFindInWikiTree.Click += new System.EventHandler(this.mnuFindInWikiTree_Click);
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
            // contextMenuStrip2
            // 
            this.contextMenuStrip2.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripMenuItem1,
            this.toolStripSeparator6,
            this.mnuOnlyHere,
            this.toolStripSeparator3,
            this.toolStripMenuItem2,
            this.toolStripSeparator4,
            this.toolStripMenuItem3,
            this.toolStripMenuItem4,
            this.toolStripSeparator5,
            this.toolStripMenuItem5,
            this.toolStripMenuItem9});
            this.contextMenuStrip2.Name = "contextMenuStrip1";
            this.contextMenuStrip2.Size = new System.Drawing.Size(168, 182);
            // 
            // toolStripMenuItem1
            // 
            this.toolStripMenuItem1.Enabled = false;
            this.toolStripMenuItem1.Name = "toolStripMenuItem1";
            this.toolStripMenuItem1.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem1.Text = "(info)";
            // 
            // toolStripSeparator6
            // 
            this.toolStripSeparator6.Name = "toolStripSeparator6";
            this.toolStripSeparator6.Size = new System.Drawing.Size(164, 6);
            // 
            // mnuOnlyHere
            // 
            this.mnuOnlyHere.Name = "mnuOnlyHere";
            this.mnuOnlyHere.Size = new System.Drawing.Size(167, 22);
            // 
            // toolStripSeparator3
            // 
            this.toolStripSeparator3.Name = "toolStripSeparator3";
            this.toolStripSeparator3.Size = new System.Drawing.Size(164, 6);
            // 
            // toolStripMenuItem2
            // 
            this.toolStripMenuItem2.Name = "toolStripMenuItem2";
            this.toolStripMenuItem2.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem2.Text = "Not a Topic!";
            // 
            // toolStripSeparator4
            // 
            this.toolStripSeparator4.Name = "toolStripSeparator4";
            this.toolStripSeparator4.Size = new System.Drawing.Size(164, 6);
            // 
            // toolStripMenuItem3
            // 
            this.toolStripMenuItem3.Name = "toolStripMenuItem3";
            this.toolStripMenuItem3.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem3.Text = "disable_link!";
            // 
            // toolStripMenuItem4
            // 
            this.toolStripMenuItem4.Name = "toolStripMenuItem4";
            this.toolStripMenuItem4.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem4.Text = "toggle ROOT";
            // 
            // toolStripSeparator5
            // 
            this.toolStripSeparator5.Name = "toolStripSeparator5";
            this.toolStripSeparator5.Size = new System.Drawing.Size(164, 6);
            // 
            // toolStripMenuItem5
            // 
            this.toolStripMenuItem5.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripMenuItem6,
            this.toolStripMenuItem7,
            this.toolStripMenuItem8});
            this.toolStripMenuItem5.Name = "toolStripMenuItem5";
            this.toolStripMenuItem5.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem5.Text = "Sample Paths...";
            // 
            // toolStripMenuItem6
            // 
            this.toolStripMenuItem6.Name = "toolStripMenuItem6";
            this.toolStripMenuItem6.Size = new System.Drawing.Size(92, 22);
            this.toolStripMenuItem6.Text = "10";
            // 
            // toolStripMenuItem7
            // 
            this.toolStripMenuItem7.Name = "toolStripMenuItem7";
            this.toolStripMenuItem7.Size = new System.Drawing.Size(92, 22);
            this.toolStripMenuItem7.Text = "50";
            // 
            // toolStripMenuItem8
            // 
            this.toolStripMenuItem8.Name = "toolStripMenuItem8";
            this.toolStripMenuItem8.Size = new System.Drawing.Size(92, 22);
            this.toolStripMenuItem8.Text = "100";
            // 
            // toolStripMenuItem9
            // 
            this.toolStripMenuItem9.Name = "toolStripMenuItem9";
            this.toolStripMenuItem9.Size = new System.Drawing.Size(167, 22);
            this.toolStripMenuItem9.Text = "Find in WikiTree...";
            // 
            // toolStripSeparator8
            // 
            this.toolStripSeparator8.Name = "toolStripSeparator8";
            this.toolStripSeparator8.Size = new System.Drawing.Size(155, 6);
            // 
            // mnuRefreshNode
            // 
            this.mnuRefreshNode.Name = "mnuRefreshNode";
            this.mnuRefreshNode.Size = new System.Drawing.Size(158, 22);
            this.mnuRefreshNode.Text = "Refresh Node...";
            this.mnuRefreshNode.Click += new System.EventHandler(this.mnuRefreshNode_Click);
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
            this.contextMenuStrip2.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

     
    }
}
