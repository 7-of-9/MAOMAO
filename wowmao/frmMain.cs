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
using mm_svc;

namespace wowmao
{
    //
    // TODO: manually defining top-level cats is fine.
    //       but will definitely need some "auto-golden" cateogry setting by the categorizor
    //
    public partial class frmMain : Form
    {
        private string db_name;
        private term root_term;

        private Dictionary<long, List<url_term>> url_term_cache = new Dictionary<long, List<url_term>>();

        public frmMain() {
            Correlations.cache_add += Correlations_cache_add;
            CorrelatedGoldens.cache_add += CorrelatedGoldens_cache_add;
            InitializeComponent();
            this.cboTop.SelectedIndex = 1;
            this.ttAll.XX_max_L1 = 10;
            InitTvwRootNodes();
        }

        private void SetCaption() {
            this.Text = $"wowmao ~ corr.cache={Correlations.cache.Count} / corr_goldens.cache={CorrelatedGoldens.cache.Count} / url_term_cache.cache={url_term_cache.Count}";
        }

        private void CorrelatedGoldens_cache_add(object sender, EventArgs e) { SetCaption(); }

        private void Correlations_cache_add(object sender, EventArgs e) { SetCaption(); }

        private void cmdSearchURLs_Click(object sender, EventArgs e) {
            this.Cursor = Cursors.WaitCursor;
            InitUrls(txtURLSearch.Text);
            this.Cursor = Cursors.Default;
        }

        void InitUrls(string search_term) {
            //
            // 8533: la la land -> suggest: golden globes top TSS - suggest TSS boost for SOCIAL_TAG type
            //       entity-type movie: strong suggest candidate
            // problem: picking correlated-golden "trump" -- surely it's not highly correlated enough?
            //         need to see corr. coeffic. to some min. value?
            //
            // 7567: peter thiel &kasparaov (suggest: type=person - strong candidate golden children)
            //

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
                    .OrderByDescending(p => p.id)
                    .Take(Convert.ToInt32(this.cboTop.Text));
                Debug.WriteLine(qry.ToString());
                var data = qry.ToListNoLock();
                foreach (var x in data) {
                    var item = new ListViewItem(new string[] {
                        x.id.ToString(),
                        x.url1,
                        x.meta_title,
                        x.url_term.Count().ToString(),
                        "-",
                        "-",
                        "-",
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
            if (lvw == this.lvwUrls) {
                lvw.Columns[1].Width = 50;
                lvw.Columns[2].Width = 200;
            }
        }

        void InitTvwRootNodes() {
            this.Cursor = Cursors.WaitCursor;
            using (var db = mm02Entities.Create()) {
                root_term = db.terms.Include("golden_term").Include("golden_term1").Single(p => p.id == g.MAOMAO_ROOT_TERM_ID);
                ttAll.Nodes.Clear();
                ttAll.AddRootTerm(root_term);
                ttAll.SelectedNode = ttAll.Nodes[0];
                this.db_name = "winmao ~ " + db.Database.Connection.Database;
                SetCaption();
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
            ttL2Terms.Nodes.Clear();

            // get meta
            dynamic meta_all = JsonConvert.DeserializeObject(url.meta_all);
            //string pretty_meta_all = JsonConvert.SerializeObject(meta_all, Formatting.Indented);
            txtInfo.Text = "html_title: " + meta_all.html_title.ToString() + "\r\n" +
                           "ip_description: " + (meta_all.ip_description ?? "").ToString() + "\r\n";

            using (var db = mm02Entities.Create()) {
                // get url_terms 
                List<url_term> l1_url_terms;
                if (this.url_term_cache.ContainsKey(url.id))
                    l1_url_terms = url_term_cache[url.id];
                else {
                    l1_url_terms = db.url_term.Include("term").Include("term.term_type").Include("term.cal_entity_type").Where(p => p.url_id == url.id && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();
                    url_term_cache.Add(url.id, l1_url_terms);
                    SetCaption();
                }

                // meta-heuristics: TSS for L1 terms
                var cat = new mm_svc.TssProduction();
                cat.CalcTSS(meta_all, l1_url_terms, run_l2_boost: true);
                txtInfo.AppendText(cat.log);

                // display -- each L1 URL-term
                ttUrlTerms.Nodes.Clear();
                lvwUrlTerms.Items.Clear();
                lvwUrlTerms.BeginUpdate();
                var ut_items = new List<ListViewItem>();
                var direct_goldens = new List<url_term>();
                var all_l2_term_ids_by_count = new Dictionary<long, int>();
                var all_l2_terms = new List<term>();
                foreach (var l1_url_term in l1_url_terms.OrderByDescending(p => p.tss)) {
                    ttUrlTerms.AddRootTerm(l1_url_term.term);

                    List<term> l2_terms = null;
                    if (l1_url_term.tss > 0) {
                        // is term directly golden?
                        if (l1_url_term.term.is_golden)
                            direct_goldens.Add(l1_url_term);

                        // get any correlated golden term(s) (2nd level terms)
                        // todo -- (1) order/rank in aggregate by degree of correlation to parent term
                        //         (2) consider not restricting to current goldens, i.e. all 2nd-level terms, ranked/weighted by corr. & golden

                        // l2 terms: all
                        l2_terms = Correlations.GetTermCorrelations(new corr_input() { main_term = l1_url_term.term.name, min_corr = 0.1 })
                                                .SelectMany(p => p.corr_terms)
                                                .OrderByDescending(p => p.corr_for_main)
                                                .ToList();

                        // l2 terms: just golden
                        //l2_terms = CorrelatedGoldens.GetGorrelatedGoldenTerms_Ordered(l1_url_term.term.name)
                        //    .Where(p => p.term_type_id != (int)g.TT.CALAIS_TOPIC /*&& p.corr > 0.1*/).ToList();

                        // map S value underlyers from parent url-term, to the l2 url-term
                        l2_terms.ForEach(p => {
                            p.parent_url_term = l1_url_term;
                        });

                        // keep counts
                        foreach (var l2_term in l2_terms) { 
                            if (all_l2_term_ids_by_count.ContainsKey(l2_term.id))
                                all_l2_term_ids_by_count[l2_term.id]++;
                            else
                                all_l2_term_ids_by_count.Add(l2_term.id, 1);

                            if (!all_l2_terms.Any(p => p.id == l2_term.id))
                                all_l2_terms.Add(l2_term);
                        }
                    }

                    ut_items.Add(lvwUrlTerms.NewLvi(l1_url_term, l2_terms));
                }
                lvwUrlTerms.Items.AddRange(ut_items.ToArray());
                lvwUrlTerms.EndUpdate();
                SetCols(lvwUrlTerms);

                //
                // L2 TSS
                lvwUrlTerms2.Items.Clear();
                var l2_url_terms = new List<url_term>();
                if (all_l2_terms.Count > 0) {
                    var l1_term_ids = l1_url_terms.Select(p => p.term.id).Distinct();
                    l2_url_terms = all_l2_terms.Where(p => !l1_term_ids.Contains(p.id)).Select(p => new url_term() { term = p }).ToList();

                    // L2.S = L1.S
                    l2_url_terms.ForEach(p => {
                        if (p.term.term_type_id == (int)g.TT.CALAIS_ENTITY) p.cal_entity_relevance = p.term.parent_url_term.S / 10;
                        if (p.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG) p.cal_socialtag_importance = (int)(p.term.parent_url_term.S / 3.0);
                        if (p.term.term_type_id == (int)g.TT.CALAIS_TOPIC) p.cal_topic_score = (int)(p.term.parent_url_term.S / 10);
                    });

                    // scale L2.S by corr/L2.Max(corr)
                    var l2_max_corr = l2_url_terms.Max(p => p.term.corr_for_main);
                    l2_url_terms.ForEach(p => p.s = (p.term.corr_for_main ?? 0) / (l2_max_corr??1));

                    // DeriveMmCat (produce TSS) for L2 terms
                    cat.CalcTSS(meta_all, l2_url_terms, run_l2_boost: false);
                    lvwUrlTerms2.BeginUpdate();
                    foreach (var l2_url_term in l2_url_terms.OrderByDescending(p => p.tss)) {
                        lvwUrlTerms2.Items.Add(lvwUrlTerms2.NewLvi(l2_url_term, null));
                    }
                    lvwUrlTerms2.EndUpdate();
                    SetCols(lvwUrlTerms2);
                }

                //
                // (NOTE/TODO:
                //
                //   "analogs" -- "Chess" being same as "chess" is functionally identical to "World Trade Center" being same as "WTC"
                //    treat them identically, i.e. an admin-mapping of analogs is needed; programmatic case-handling will only cover half of it.
                //
                //   "exclusions" -- kind of similar - need admin fn. to mark terms as excluded from presentation, e.g. "outline of chess" will appear v.
                //       frequently as gold suggestion (compare: "computer chess", which is actually good - very hard to programatically dismabiguate them)
                //     so, must want admin fn. to mark a gold-term as "excluded" -- it lives as normal, the only difference being that its excluded flag
                //     will remove it from presentation.
                //
                // both of these are presentation-level issues: marking gold terms as analogs, and marking gold terms as excluded from presentation)
                //

                //
                // output/suggest phase
                //

                // existing gold: L1 & L2 - over TSS norm threshold (varies by gold level)
                var out_existing_l1_l2_gold = new List<term>();
                if (direct_goldens.Count > 0) {

                        // existing L1 
                         out_existing_l1_l2_gold = direct_goldens.OrderByDescending(p => p.tss_norm)
                        .Where(p =>  p.tss_norm > p.term.existing_gold_min_tss_norm)

                        // existing L2 
                        .Union(l2_url_terms.Where(p => p.term.is_golden && p.tss_norm > p.term.existing_gold_min_tss_norm))
                        .Select(p => p.term)
                        .ToList();
                    item.SubItems[4].Text = string.Join(" / ", out_existing_l1_l2_gold.Select(p => $"{p.name} [{p.id}] *GL={p.gold_level}"));
                }

                // new gold suggestions

                // gold suggest L1 -- top L1 terms by TSS norm threshold
                var out_suggest_l1_gold = new List<term>();
                out_suggest_l1_gold = l1_url_terms.OrderByDescending(p => p.tss_norm)
                                                  .Where(p => p.tss_norm > 0.7 && p.tss > TssProduction.MIN_GOLD_TSS).Select(p => p.term)
                                                  .Where(p => !p.is_golden)
                                                  .ToList();
                item.SubItems[5].Text = string.Join(" / ", out_suggest_l1_gold.Select(p => $"{p.name} [{p.id}] *GL={p.gold_level}"));

                if (l2_url_terms.Count > 0) {

                    // gold suggest L2 -- highest TSS ranked L2 all terms 
                    var out_suggest_l2_gold = new List<term>();
                    out_suggest_l2_gold = l2_url_terms.OrderByDescending(p => p.tss_norm)
                                                       .Where(p => p.tss_norm > 0.8 && p.tss > TssProduction.MIN_GOLD_TSS).Select(p => p.term)
                                                       .Where(p => !p.is_golden)
                                                       .Where(p => !out_suggest_l1_gold.Select(p2 => p2.name.ltrim()).Contains(p.name.ltrim()))
                                                       .ToList();
                    item.SubItems[6].Text = string.Join(" / ", out_suggest_l2_gold.Select(p => $"{p.name} [{p.id}] *GL={p.gold_level}"));
                    
                    // suggestion 3 -- highest L2 golden by count (very restrictive dataset?)
                    //var mm_cats = new List<term>();
                    //if (all_l2_terms.Count > 0) {
                    //    var list = all_l2_term_ids_by_count.ToList();
                    //    list.Sort((pair1, pair2) => pair2.Value.CompareTo(pair1.Value));
                    //    item.SubItems[7].Text = all_l2_terms.Single(p => p.id == list[0].Key).name;
                    //}
                }
                SetCols(lvwUrls);

                // ***
                // plan -- should auto-golden high TSS terms to the closest (deepest)
                //         golden term (either correlated or direct)
                //
                // intent -- 2-level hierarchy on all URLs
                //
                // first: simple extraction of best-golden
                //      * prefer any direct golden terms
                //      * if no golden terms, need heuristic for picking a single best corrleated golden term
                //          > most frequently occuring correlated golden across top TSS terms
                //
                // only after this: can think about auto-suggesting L2 golden terms for high TSS scores
                //  (would be children of best-golden above).
            }

            this.Cursor = Cursors.Default;
        }

   
        private void lvwUrlTerms_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvwUrlTerms.SelectedItems.Count == 0) return;
            var tag = lvwUrlTerms.SelectedItems[0].Tag as TermList.lvwUrlTermTag;
            var l2_terms = CorrelatedGoldens.GetGorrelatedGoldenTerms_Ordered(tag.ut.term.name).Where(p => p.term_type_id != (int)g.TT.CALAIS_TOPIC);
            ttL2Terms.Nodes.Clear();
            foreach(var golden_term in l2_terms) {
                ttL2Terms.AddRootTerm(golden_term);
            }
        }

        private void cmdWalk_Click(object sender, EventArgs e)
        {
            this.Cursor = Cursors.AppStarting;
            for (int i = 0; i < lvwUrls.Items.Count; i++) { 
                lvwUrls.Items[i].Selected = true;
                Application.DoEvents();
            }
            this.Cursor = Cursors.Default;
        }
    }
}
