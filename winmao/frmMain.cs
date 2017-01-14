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
using static mm_svc.Terms.Correlations;

namespace winmao
{
    public partial class frmMain : Form
    {
        public frmMain() {
            InitializeComponent();
            InitUrls();
        }

        private void chkCrunch_CheckedChanged(object sender, EventArgs e) { Crunch(); }
        void Crunch() {
            for (int i = 0; i < lvwUrls.Items.Count; i++) {
                if (chkCrunch.Checked) {
                    lvwUrls.Items[i].Selected = true;
                    Application.DoEvents();
                } else break;
            }
        }

        void InitUrls()
        {
            using (var db = mm02Entities.Create())
            {
                lvwUrls.BeginUpdate();
                var items = new List<ListViewItem>();
                var qry = db.urls
                    .AsNoTracking()
                    .Include("url_term")
                    .Include("url_term.term")
                    .Include("url_term.term.term_type")
                    .Include("url_term.term.cal_entity_type")
                    .Take(20);
                Debug.WriteLine(qry.ToString());
                var data = qry.ToListNoLock();
                foreach(var x in data) { 
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
            //SetCols();
        }

        void SetCols(ListView lvw)
        {
            for(int i=0; i < lvw.Columns.Count; i++) {
                var col = lvw.Columns[i];
                col.Width = -2;
            }
        }

        private void lvwUrls_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvwUrls.SelectedItems.Count == 0) return;
            var item = lvwUrls.SelectedItems[0];
            var url = item.Tag as url;

            this.Cursor = Cursors.WaitCursor;

            // get meta
            dynamic meta_all = JsonConvert.DeserializeObject(url.meta_all);
            //string pretty_meta_all = JsonConvert.SerializeObject(meta_all, Formatting.Indented);
            txtInfo.Text = "html_title: " + meta_all.html_title.ToString() + "\r\n" +
                           "ip_description: " + meta_all.ip_description.ToString() + "\r\n";
                           //pretty_meta_all;

            using (var db = mm02Entities.Create()) {
                // get url_terms 
                var url_terms = url.url_term.ToList();
                    //db.url_term
                    //  .Include("term")
                    //  .Include("term.term_type")
                    //  .Include("term.cal_entity_type")
                    //  .Where(p => p.url_id == url.id).ToListNoLock();

                // derive MM CAT!
                var cat = new mm_svc.MmCat();
                cat.CalcTSS(meta_all, url_terms, run_l2_boost: true);
                //item.SubItems[3].Text = string.Join(" / ", final);
                txtInfo.AppendText(cat.log);

                // display
                lvwUrlTerms.Items.Clear();
                lvwUrlTerms.BeginUpdate();
                List<ListViewItem> ut_items = new List<ListViewItem>();
                foreach(var ut in url_terms.OrderByDescending(p => p.tss)) {
                    var ut_item = new ListViewItem(new string[] {
                        ut.term.name + " [" + ut.term.id + "] #" + ut.term.occurs_count,
                        ut.term.term_type.type,
                        ut.term.cal_entity_type != null ? ut.term.cal_entity_type.name : "-",
                        ut.term.occurs_count.ToString(),
                        //(ut.cal_topic_score ?? -1).ToString(),
                        //(ut.cal_socialtag_importance?? -1).ToString(),
                        //(ut.cal_entity_relevance ?? -1).ToString(),
                        ut.S.ToString(),
                        ut.appearance_count.ToString(),
                        ut.candidate_reason,
                        ut.tss.ToString(),
                        ut.words_common_to_title != null ? string.Join("/", ut.words_common_to_title.Select(p => p + "/")) : "",
                        ut.words_common_to_desc != null ? string.Join("/", ut.words_common_to_desc.Select(p => p + "/")) : "",
                        //ut.words_common_to_title_and_entities != null ? string.Join("/", ut.words_common_to_title_and_entities.Select(p => p + "/")) : "",
                        //ut.common_to_entities_exact != null ? string.Join("/", ut.common_to_entities_exact.Select(p => p + "/")) : "",
                        ut.words_common_to_title_stemmed != null ? string.Join("/", ut.words_common_to_title_stemmed.Select(p => p + "/")) : "",
                        ut.words_common_to_desc_stemmed != null ? string.Join("/", ut.words_common_to_desc_stemmed.Select(p => p + "/")) : "",
                    });
                    ut_item.Tag = ut;
                    ut_items.Add(ut_item);
                }
                lvwUrlTerms.Items.AddRange(ut_items.ToArray());
                lvwUrlTerms.EndUpdate();
                SetCols(lvwUrlTerms);
            }

            this.Cursor = Cursors.Default;
        }

        private void lvwUrlTerms_SelectedIndexChanged(object sender, EventArgs e)
        {
            // init term correlations tree
            if (lvwUrlTerms.SelectedItems.Count == 0) return;
            var item = lvwUrlTerms.SelectedItems[0];
            var ut = item.Tag as url_term;
            using (var db = mm02Entities.Create()) {
                tvwTermCorr.Nodes.Clear();
                tvwTermCorr.Nodes.Add(TreeNodeFromTerm(ut.term));
            }
        }

        TreeNode TreeNodeFromTerm(term t) {
            var tn = new TreeNode($"{t.name} [{t.id}] #{t.occurs_count} ({((g.TT)t.term_type_id).ToString()})");
            tn.Tag = t;
            return tn;
        }

        TreeNode TreeNodeFromCorrelation(correlation c) {
            var tn = new TreeNode($"max_corr={c.max_corr.ToString("0.0000")} {c.corr_term} XX={c.sum_XX}");
            foreach(var term in c.corr_terms) {
                var tn2 = TreeNodeFromTerm(term);
                tn.Nodes.Add(tn2);
            }
            tn.Tag = c;
            return tn;
        }

        private void tvwTermCorr_AfterSelect(object sender, TreeViewEventArgs e)
        {
            // load correlated terms
            var node = tvwTermCorr.SelectedNode;
            if (node == null) return;
            if (node.Nodes.Count > 0) return;
            var term = node.Tag as term;
            if (term == null) return;
            using (var db = mm02Entities.Create())
            {
                var correlated_terms = mm_svc.Terms.Correlations.GetTermCorrelations(new corr_input() { main_term = term.name }); 
                var correlated_term_nodes = new List<TreeNode>();
                foreach (var correlation in correlated_terms) {
                    TreeNode tn_related = TreeNodeFromCorrelation(correlation);

                    correlated_term_nodes.Add(tn_related);
                }
                node.Nodes.AddRange(correlated_term_nodes.OrderByDescending(p => p.Text).ToArray());
            }
            node.Expand();
        }

   
    }
}
