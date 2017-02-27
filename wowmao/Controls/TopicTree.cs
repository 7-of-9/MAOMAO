using mmdb_model;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace wowmao.Controls
{
    public partial class TopicTree : TreeView
    {
        public TopicTree()
        {
            InitializeComponent();
        }

        public void BuildTree()
        { 
            using (var db = mm02Entities.Create()) {
                // get root topics
                var root_topic_ids = db.ObjectContext().ExecuteStoreQuery<long>(
                "SELECT DISTINCT [parent_term_id] FROM [topic_link] WHERE [parent_term_id] NOT IN (SELECT DISTINCT [child_term_id] FROM [topic_link])").ToList();

                this.Nodes.Clear();
                this.BeginUpdate();
                foreach (var root_topic_id in root_topic_ids) {
                    var term = db.terms.Find(root_topic_id);
                    var tn_root = NodeFromTerm(term);
                    this.Nodes.Add(tn_root);
                    AddChildren(tn_root, root_topic_id, new List<long>());
                }
                this.EndUpdate();
            }
        }

        private void AddChildren(TreeNode parent_node, long parent_topic_id, List<long> term_ids)
        {
            using (var db = mm02Entities.Create()) {
                var topic_links = db.topic_link.Include("term").AsNoTracking().Where(p => p.parent_term_id == parent_topic_id).OrderBy(p => p.min_distance).ToListNoLock();
                foreach(var link in topic_links) {
                    //if (TermInParentsChain(tn_parent, link.child_term_id) == false) {
                    if (!term_ids.Contains(link.child_term_id)) { 
                        var child_node = NodeFromTerm(link.child_term, link);
                        parent_node.Nodes.Add(child_node);
                        term_ids.Add(link.child_term_id);
                        AddChildren(child_node, link.child_term_id, term_ids);
                    }
                }
            }
        }

        private bool TermInParentsChain(TreeNode tn, long term_id)
        {
            var node_term = tn.Tag as term;
            if (node_term.id == term_id) return true;
            if (tn.Parent == null) return false;
            return TermInParentsChain(tn.Parent, term_id);
        }

        private TreeNode NodeFromTerm(term t, topic_link link = null) {
            var tn = new TreeNode(t.ToString());
            if (link != null)
                tn.Text += $" MIN_D={link.min_distance} MAX_D={link.max_distance}";
            tn.Tag = t;
            tn.NodeFont = new Font(this.Font, FontStyle.Bold);
            tn.BackColor = RootPathViewer.ColorFromString(t.name);
            tn.ForeColor = RootPathViewer.InvertColor(tn.BackColor);
            return tn;
        }

        private void InitializeComponent()
        {
        }
    }
}
