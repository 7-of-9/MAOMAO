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
            //SetCols(lvwUrls);
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

            using (var db = mm02Entities.Create()) {
                // get url_terms 
                var url_terms = //url.url_term.ToList();
                db.url_term
                  .Include("term")
                  .Include("term.term_type")
                  .Include("term.cal_entity_type")
                  .Where(p => p.url_id == url.id && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();

                // derive MM CAT!
                var cat = new mm_svc.MmCat();
                var final = cat.GetCat(meta_all, url_terms) as List<string>;
                item.SubItems[3].Text = string.Join(" / ", final);
                txtInfo.AppendText(cat.log);

                // display -- each URL-term
                ttUrlTerms.Nodes.Clear();
                lvwUrlTerms.Items.Clear();
                lvwUrlTerms.BeginUpdate();
                List<ListViewItem> ut_items = new List<ListViewItem>();
                foreach (var ut in url_terms.OrderByDescending(p => p.topic_specifc_score)) {
                    ttUrlTerms.AddRootTerm(ut.term);

                    // is term directly golden?
                    var direct_golden = Golden.IsGolden(ut.term.name);

                    // get any correlated golden term(s) -- dedupe
                    var correlated_goldens = Correlations.GetGorrelatedGoldenTerms_Ordered(ut.term.name);

                    // ***
                    // plan -- should auto-golden high TSS terms to the closest (deepest)
                    //         golden term (either correlated or direct)
                    //
                    // intent -- 2-level hierarchy on all URLs
                    //
                    // first: simple extraction of best-golden
                    //      * prefer any direct golden terms
                    //      * if no golden terms, need heuristic for picking a single best corrleated golden term
                    //          (maybe average of top n high TSS corrleated goldens)
                    //
                    // only after this: can think about auto-suggesting L2 golden terms for high TSS scores
                    //  (would be children of best-golden above).

                    var ut_item = new ListViewItem(new string[] {
                        direct_golden ? "*" : "",
                        correlated_goldens.Count.ToString(), //"?",
                        ut.topic_specifc_score.ToString(),
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
            if (lvwUrlTerms.SelectedItems.Count == 0) return;
            var url_term = lvwUrlTerms.SelectedItems[0].Tag as url_term;
            var ordered_correlated_golden = Correlations.GetGorrelatedGoldenTerms_Ordered(url_term.term.name);
            ttDirectGoldens.Nodes.Clear();
            foreach(var golden_term in ordered_correlated_golden) {
                ttDirectGoldens.AddRootTerm(golden_term);
            }
        }
    }
}
