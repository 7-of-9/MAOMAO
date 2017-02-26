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
using mm_global.Extensions;
using mm_svc.Terms;
using System.Diagnostics;
using static mm_svc.Terms.Correlations;
using mm_svc;
using System.Collections;

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
            mm02Entities.static_instance = mm02Entities.Create();

            Correlations.OnCacheAdd += Correlations_cache_add;
            InitializeComponent();
            this.cboTop.SelectedIndex = 2;
            InitTvwRootNodes();

            //txtUrlSearch.SelectedIndex = 1;

            //this.gtGoldTree.BuildTree(g.MAOMAO_ROOT_TERM_ID);
            this.gtGoldTree.OnSearchGoldenTerm += GtGoldTree_OnSearchGoldenTerm;
            this.gtGoldTree.OnSearchGoogle += GtGoldTree_OnSearchGoogle;

            this.wikiGoldTree.OnGtsLoaded += WikiGoldTree_OnGtsLoaded;
            this.wikiGoldTree.OnSearchGoogle += WikiGoldTree_OnSearchGoogle;

            this.lvwUrls.ColumnClick += LvwUrls_ColumnClick;

            this.rootPathViewer1.OnTopicToggled += RootPathViewer1_OnTopicToggled;

            cmdSearchURLs_Click(null, null);
        }

        private void RootPathViewer1_OnTopicToggled(object sender, Controls.RootPathViewer.OnTopicToggledEventArgs e)
        {
            this.txtGtSearch.Text = e.term_name;
            cmdGtSearch_Click(null, null);
        }

        private void LvwUrls_ColumnClick(object sender, ColumnClickEventArgs e)
        {
            this.lvwUrls.ListViewItemSorter = new ListViewItemComparer(e.Column);
            lvwUrls.Sort();
        }
        class ListViewItemComparer : IComparer
        {
            private int col;
            public ListViewItemComparer()
            {
                col = 0;
            }
            public ListViewItemComparer(int column)
            {
                col = column;
            }
            public int Compare(object x, object y)
            {
                int returnVal = -1;
                returnVal = String.Compare(((ListViewItem)x).SubItems[col].Text,
                ((ListViewItem)y).SubItems[col].Text);
                return returnVal;
            }
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            this.wikiGoldTree.BuildTree();
        }

        private void WikiGoldTree_OnSearchGoogle(object sender, Controls.WikiGoldenTree.OnSearchGoogleEventArgs e)
        {
            Process.Start($"chrome.exe", $"https://en.wikipedia.org/wiki/{e.search_term}");
        }

        private void GtGoldTree_OnSearchGoogle(object sender, MmGoldenTree.OnSearchGoogleEventArgs e)
        {
            Process.Start($"https://www.google.com/#q={e.search_term}");
        }

        private void GtGoldTree_OnSearchGoldenTerm(object sender, MmGoldenTree.SearchGoldenTermEventArgs e)
        {
            //InitUrls(null, e.golden_term_id);
        }

        private void SetCaption() {
            this.Text = $"wowmao ~ corr.cache={Correlations.cache.Count} (cache_tot_terms={Correlations.cache_tot_terms} // url_term_cache.cache={url_term_cache.Count}";
        }

        private void CorrelatedGoldens_cache_add(object sender, EventArgs e) { SetCaption(); }

        private void Correlations_cache_add(object sender, EventArgs e) { SetCaption(); }

        private void cmdSearchURLs_Click(object sender, EventArgs e) {
            this.Cursor = Cursors.WaitCursor;
            InitUrls(txtUrlSearch.Text);
            this.Cursor = Cursors.Default;
        }

        void InitUrls(string search_term) {//, long? golden_term_id = null) {
            //
            // 8533: la la land -> suggest: golden globes top TSS - suggest TSS boost for SOCIAL_TAG type
            //       entity-type movie: strong suggest candidate
            // problem: picking correlated-golden "trump" -- surely it's not highly correlated enough?
            //         need to see corr. coeffic. to some min. value?
            //
            // 7567: peter thiel &kasparaov (suggest: type=person - strong candidate golden children)
            //

            lvwUrls.Items.Clear();
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                lvwUrls.BeginUpdate();
                var items = new List<ListViewItem>();
                var rnd = new Random();
                var qry = db.urls
                    .AsNoTracking()
                    .Include("url_term.term.term_type")
                    .Include("url_term.term.cal_entity_type")
                  //.Include("url_golden_term")
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search_term)) {
                    qry = qry.Where(p => p.meta_all.ToLower().Contains(search_term.ToLower())); // search by meta string
                    if (chkExcludeProcessed.Checked)
                        qry = qry.Where(p => p.processed_at_utc == null);
                }
                //else if (golden_term_id != null)
                //    qry = qry.Where(p => p.url_golden_term.Any(p2 => p2.golden_term_id == golden_term_id)); // search by processed golden term id

                qry = qry.Where(p => p.nlp_suitability_score > 10);
                qry = qry.OrderByDescending(p => p.id);

                var count_urls = qry.Count();
                var take = Convert.ToInt32(this.cboTop.Text);
                if (chkRndOrder.Checked && count_urls > take)
                    qry = qry.Skip(rnd.Next(0, count_urls - take));

                qry = qry.Take(take);

                Debug.WriteLine(qry.ToString());
                var data = qry.ToListNoLock();
                foreach (var x in data) {
                    var item = new ListViewItem(new string[] {
                        x.id.ToString(),
                        x.url1,
                        x.meta_title,
                        x.nlp_suitability_score?.ToString(),
                        x.url_term.Count().ToString(),
                        string.Join(" / ", x.url_term.Where(p => p.tss_norm > 0.4 && p.term.term_type_id != (int)g.TT.WIKI_NS_0 && p.term.term_type_id != (int)g.TT.WIKI_NS_14).OrderByDescending(p => p.tss_norm).Select(p => $"{p.term.name} [TSS_N={p.tss_norm?.ToString("0.00")}]")),//"-",
                        "-",
                        "-",
                        x.processed_at_utc?.ToString("dd MMM yyyy HH:mm"),
                        x.processed_golden_count.ToString(),
                        x.img_url,
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
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                root_term = db.terms.Include("golden_term").Include("golden_term1").Single(p => p.id == g.MAOMAO_ROOT_TERM_ID);
                this.db_name = "winmao ~ " + db.Database.Connection.Database;
                SetCaption();
            }
            this.Cursor = Cursors.Default;
        }

        private void cmdRefresh_Click_1(object sender, EventArgs e) {

            // clear cache & recycle object context
            Correlations.cache = new Dictionary<string, List<correlation>>();
            this.url_term_cache = new Dictionary<long, List<url_term>>();
            mm02Entities.static_instance.Dispose();
            mm02Entities.static_instance = null;
            mm02Entities.static_instance = mm02Entities.Create();
            this.SetCaption();

            InitTvwRootNodes();
            //gtGoldTree.BuildTree(g.MAOMAO_ROOT_TERM_ID);
            wikiGoldTree.BuildTree();
        }

        private void ZoomBrowser(int zoom)
        {
            if (zoom > 0)
                for (int i = 0; i < zoom; i++) { zoomBrowser1.Focus(); SendKeys.Send("^{+}"); } // [CTRL]+[+]
            else if (zoom < 0)
                for (int i = 0; i < zoom*-1; i++) { zoomBrowser1.Focus(); SendKeys.Send("^-"); } // [CTRL]+[-]
            else { zoomBrowser1.Focus(); SendKeys.Send("^0"); } // [CTRL]+[0]
        }

        private void lvwUrls_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvwUrls.SelectedItems.Count == 0) return;
            var item = lvwUrls.SelectedItems[0];
            var url = item.Tag as url;

            this.Cursor = Cursors.WaitCursor;
            var new_gold_count = 0;

            // get meta
            dynamic meta_all = JsonConvert.DeserializeObject(url.meta_all);
            string pretty_meta_all = JsonConvert.SerializeObject(meta_all, Formatting.Indented);
            txtInfo.Text = "html_title: " + meta_all.html_title.ToString() + "\r\n" +
                           "ip_description: " + (meta_all.ip_description ?? "").ToString() + "\r\n" +
                           "pretty_meta_all: " + (pretty_meta_all ?? "").ToString() + "\r\n";

            zoomBrowser1.Navigate(url.url1);
            zoomBrowser1.ScriptErrorsSuppressed = true;
            //int zoomFactor = 300;
            //((SHDocVw.WebBrowser)zoomBrowser1.ActiveXInstance).ExecWB(SHDocVw.OLECMDID.OLECMDID_OPTICAL_ZOOM,
            //    SHDocVw.OLECMDEXECOPT.OLECMDEXECOPT_DONTPROMPTUSER, zoomFactor, IntPtr.Zero);
            //ZoomBrowser(-2);

            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {

                //
                // ** ProcessTss **
                //
                var l1_url_terms = mm_svc.UrlProcessor.ProcessUrl(url.id, reprocess: chkReprocess.Checked);

                // (1) get url_terms (L1 terms)
                /*if (this.url_term_cache.ContainsKey(url.id))
                    l1_url_terms = url_term_cache[url.id];
                else {
                    l1_url_terms = db.url_term.Include("term").Include("term.term_type").Include("term.cal_entity_type").Where(p => p.url_id == url.id && !g.EXCLUDE_TERM_IDs.Contains(p.term_id)).ToListNoLock();
                    url_term_cache.Add(url.id, l1_url_terms);
                    SetCaption();

                    // TMP -- (while waiting for bulk/batch crawl to populate organically) -- add matching wiki terms
                    //var add_wiki_url_terms = new List<url_term>();
                    //var distinct_l1_names = l1_url_terms.Select(p => p.term.name).Distinct();
                    //foreach (var l1_term_name in distinct_l1_names)
                    //{
                    //    var url_term = l1_url_terms.Where(p => p.term.name == l1_term_name).OrderByDescending(p => p.S).First();
                    //    var wiki_term = db.terms.Where(p => p.name == url_term.term.name && (p.term_type_id == (int)g.TT.WIKI_NS_14)).FirstOrDefaultNoLock();
                    //    if (wiki_term != null) {
                    //        add_wiki_url_terms.Add(new url_term {
                    //            term = wiki_term,
                    //            term_id = wiki_term.id,
                    //            url_id = url_term.url_id,
                    //            wiki_S = url_term.term.term_type_id == (int)g.TT.CALAIS_ENTITY ? Convert.ToDouble(url_term.cal_entity_relevance.ToString()) * 10 // 0-10
                    //                    : url_term.term.term_type_id == (int)g.TT.CALAIS_SOCIALTAG ? ((4 - Convert.ToDouble(url_term.cal_socialtag_importance.ToString())) * 3) // 0-10
                    //                    : url_term.term.term_type_id == (int)g.TT.CALAIS_TOPIC ? Convert.ToDouble(url_term.cal_topic_score.ToString()) * 10 : -1 // 0-10
                    //        });
                    //    }
                    //}
                    //l1_url_terms.AddRange(add_wiki_url_terms);
                }*/

                // (2) *** Calc. TSS for L1 terms ***
                //var cat = new mm_svc.TssProduction();
                //cat.CalcTSS(meta_all, l1_url_terms, run_l2_boost: true); // TODO: have this pick the top n calais terms, return mapped wiki terms for top n

                // L1 terms -> for each L1 term: add to TermTree
                if (chkUpdateUi.Checked) { 
                    //ttUrlTerms.Nodes.Clear();
                    //l1_url_terms.OrderByDescending(p => p.S).ToList().ForEach(p => ttUrlTerms.AddRootTerm(p.term, extra: $" (S={p.S})"));
                    lvwUrlTerms.Items.Clear();
                    lvwUrlTerms.BeginUpdate();
                }
                var ut_items = new List<ListViewItem>();
                var direct_goldens = new List<url_term>();
                var all_l2_term_ids_by_count = new Dictionary<long, int>();
                var all_l2_terms = new List<term>();
                foreach (var l1_url_term in l1_url_terms.OrderByDescending(p => p.wiki_S != null).ThenByDescending(p => p.tss_norm)) {

                    // --- L2 terms -- (disable for now while testing tmp wiki terms...)
                    List<term> l2_terms = null;
                    /*if (l1_url_term.tss > 0) {
                        // is term directly golden?
                        if (l1_url_term.term.is_gold)
                            direct_goldens.Add(l1_url_term);

                        // L2 terms: all -- rank by correlation
                        l2_terms = Correlations.GetTermCorrelations(new corr_input() { main_term = l1_url_term.term.name, min_corr = 0.1 })
                                                .SelectMany(p => p.corr_terms)
                                                .OrderByDescending(p => p.corr_for_main)
                                                .ToList();

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
                    }*/

                    // add L1 term to TermList
                    if (chkUpdateUi.Checked)
                        ut_items.Add(lvwUrlTerms.NewLvi(l1_url_term, l2_terms));
                }
                if (chkUpdateUi.Checked) {
                    lvwUrlTerms.Items.AddRange(ut_items.ToArray());
                    lvwUrlTerms.EndUpdate();
                    SetCols(lvwUrlTerms);
                }

                //
                // L2 TSS
                /*if (chkUpdateUi.Checked)
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

                    if (chkUpdateUi.Checked) { 
                        lvwUrlTerms2.BeginUpdate();
                        foreach (var l2_url_term in l2_url_terms.OrderByDescending(p => p.tss)) {
                            lvwUrlTerms2.Items.Add(lvwUrlTerms2.NewLvi(l2_url_term, null));
                        }
                        lvwUrlTerms2.EndUpdate();
                        SetCols(lvwUrlTerms2);
                    }
                }*/

                //
                // output/suggest phase
                //

                //
                // process new gold suggestions
                //
                /*var out_suggest_l1_gold = new List<term>(); // gold suggest L1 -- top L1 terms by TSS norm threshold
                out_suggest_l1_gold = l1_url_terms.OrderByDescending(p => p.tss_norm)
                                                  .Where(p => p.tss_norm > 0.7 // *** min_tss_norm for L1 suggest gold (was: 0.5)
                                                           && p.tss > TssProduction.MIN_GOLD_TSS).Select(p => p.term)
                                                  .Where(p => !p.is_gold)
                                                  .ToList();
                new_gold_count += Golden.ProcessSuggested(out_suggest_l1_gold, url.id);
                item.SubItems[5].Text = string.Join(" / ", out_suggest_l1_gold.Where(p => p.suggested_gold_parent != null).Select(p => $"{p.name} [{p.id}] {p.gold_desc} -> {p.suggested_gold_parent?.name}"));

                var out_suggest_l2_gold = new List<term>();
                if (l2_url_terms.Count > 0) {              // gold suggest L2 -- highest TSS ranked L2 all terms 
                    
                    out_suggest_l2_gold = l2_url_terms.OrderByDescending(p => p.tss_norm)
                                                       .Where(p => p.tss_norm > 0.9 // *** min_tss_norm for L2 suggest gold (was: 0.7)
                                                                && p.tss > TssProduction.MIN_GOLD_TSS).Select(p => p.term)
                                                       .Where(p => !p.is_gold)
                                                       .Where(p => !out_suggest_l1_gold.Select(p2 => p2.name.ltrim()).Contains(p.name.ltrim()))
                                                       .ToList();
                    new_gold_count += Golden.ProcessSuggested(out_suggest_l2_gold, url.id);
                    item.SubItems[6].Text = string.Join(" / ", out_suggest_l2_gold.Where(p => p.suggested_gold_parent != null).Select(p => $"{p.name} [{p.id}] {p.gold_desc} -> {p.suggested_gold_parent?.name}"));

                    // suggestion 3 -- highest L2 golden by count (very restrictive dataset?)
                    //var mm_cats = new List<term>();
                    //if (all_l2_terms.Count > 0) {
                    //    var list = all_l2_term_ids_by_count.ToList();
                    //    list.Sort((pair1, pair2) => pair2.Value.CompareTo(pair1.Value));
                    //    item.SubItems[7].Text = all_l2_terms.Single(p => p.id == list[0].Key).name;
                    //}
                }*/

                //
                // final outputs -- existing gold @ L1 & L2 - over TSS norm threshold (varies by gold level)
                // note: this will *not* include auggested gold that was processed immediately above (caching issues) - probably doesn't matter a great deal, only affects first time
                // gold is suggested and processed.
                //
                var out_existing_l1_l2_gold = new List<term>();
                if (direct_goldens.Count > 0)
                {
                    out_existing_l1_l2_gold =
                    
                        // existing L1 
                        direct_goldens.OrderByDescending(p => p.tss_norm).Where(p => p.tss_norm > 0.2)//p.term.existing_gold_min_tss_norm)

                       // existing L2 
                       //.Union(l2_url_terms.OrderByDescending(p => p.tss_norm).Where(p => p.term.is_gold && p.tss_norm > p.term.existing_gold_min_tss_norm))

                       // rank
                       .Select(p => p.term)
                       .ToList();

                    // save result for URL -- NOTE: just taking first child appearance in GT tree; this will *not* work
                    // if the term is a GC of multiple golden parents! i.e. -- should for now maintain logic of term only appears once in the GT tree
                    var final_mmcats = out_existing_l1_l2_gold.Select(p => p.child_in_golden_terms.First()).ToList();
                    //Golden.RecordUrlGoldenTerms(url.id, final_mmcats);

                    item.SubItems[7].Text = DateTime.UtcNow.ToString("dd MMM yyyy");
                    item.SubItems[8].Text = final_mmcats.Count().ToString();

                    item.SubItems[4].Text = string.Join(" / ", out_existing_l1_l2_gold.Select(p => $"{p.name} [{p.id}] {p.gold_desc}"));
                }

                //
                // url suggested/related parent terms (from UrlProcessing)
                //
                var parent_terms = db.url_parent_term.AsNoTracking().Include("term").Where(p => p.url_id == url.id).OrderBy(p => p.pri).ToListNoLock();
                txtInfo.AppendText("\r\n\r\n>>> (RelatedParents) url_parent_terms: " + string.Join(", ", parent_terms.Select(p => p.term.name)));

                txtInfo.AppendText("\r\n\r\n>>> HTTP: " + url.url1 + "\r\n");
                txtInfo.ScrollToCaret();
            }

            if (new_gold_count > 0) {
                //gtGoldTree.BuildTree(g.MAOMAO_ROOT_TERM_ID);
                wikiGoldTree.BuildTree();
            }

            this.Cursor = Cursors.Default;
        }
   
   
        // walk & process...
        private bool walking = false;
        private void cmdWalk_Click(object sender, EventArgs e)
        {
            var sw = new Stopwatch(); sw.Start();
            if (!walking) {
                walking = true;
                cmdWalk.Text = "STOP";
                this.Cursor = Cursors.WaitCursor;
                int n = 0;
                for (int i = lvwUrls.SelectedIndices.Count > 0 ? lvwUrls.SelectedIndices[0] : 0; i < lvwUrls.Items.Count; i++) {
                    if (!walking) break;

                    lvwUrls.Items[i].Selected = true; // process
                    lvwUrls.Items[i].EnsureVisible();
                    Application.DoEvents();
                    n++;

                    var url_per_sec = n / sw.Elapsed.TotalSeconds;
                    lblWalkInfo.Text = $"Walking... url_per_sec={url_per_sec.ToString("0.00")}";
                }
                this.Cursor = Cursors.Default;
                cmdWalk.Text = "Walk...";
                walking = false;
            }
            else {
                cmdWalk.Text = "Walk...";
                walking = false;
            }
        }

        private void cmdGtSearch_Click(object sender, EventArgs e)
        {
            wikiGoldTree.Search(this.txtGtSearch.Text, chkExactMatch.Checked, chkTopicsOnly.Checked);
        }

        bool getting_all_gts = false;
        private void cmdExpandAll_Click(object sender, EventArgs e)
        {
            if (!getting_all_gts) {
                getting_all_gts = true;
                cmdExpandAll.Text = "STOP";
                wikiGoldTree.StartGetAll(wikiGoldTree.Nodes);
            }
            else {
                getting_all_gts = false;
                wikiGoldTree.StopGetAll();
                cmdExpandAll.Text = "get all...";
            }
        }

        private void WikiGoldTree_OnGtsLoaded(object sender, Controls.WikiGoldenTree.OnGtsLoadedEventArgs e)
        {
            this.Invoke((MethodInvoker)delegate { this.lblTotGtsLoaded.Text = e.count_loaded.ToString() + " GTs loaded."; });
        }

        private void wikiGoldTree_AfterSelect(object sender, TreeViewEventArgs e)
        {
            // paths to root
            if (wikiGoldTree.SelectedNode == null) return;
            var gt = wikiGoldTree.SelectedNode.Tag as golden_term;
            this.Cursor = Cursors.WaitCursor;
            var root_paths = GoldenPaths.GetOrProcessPathsToRoot(gt.child_term.id); //GoldenPaths.CalculatePathsToRoot(gt.child_term_id);
            root_paths.ForEach(p => Trace.WriteLine(gt.child_term.name + " // " + string.Join(" / ", p.Take(p.Count - 0).Select(p2 => p2.t.name)) + "\r\n"));

            if (gt.child_term.IS_TOPIC) {
                // todo -- don't load the topic's rooth paths; instead load the various root paths (multiple terms) that the topic appears in
                this.rootPathViewer1.AddTermPaths(null);
            }
            else {
                this.rootPathViewer1.AddTermPaths(root_paths);
            }
            this.Cursor = Cursors.Default;

        }

        private void lvwUrlTerms_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (lvwUrlTerms.SelectedItems.Count == 0) return;
            var all_root_paths = new List<List<GoldenPaths.TermPath>>();
            this.Cursor = Cursors.WaitCursor;
            //foreach (var lvi in lvwUrlTerms.Items)
            {
                var lvi = lvwUrlTerms.SelectedItems[0];
                var tag = ((ListViewItem)lvi).Tag as TermList.lvwUrlTermTag;
                this.txtGtSearch.Text = tag.ut.term.name;
                this.chkTopicsOnly.Checked = false;
                if (tag.ut.term.term_type_id == (int)g.TT.WIKI_NS_0 ||
                    tag.ut.term.term_type_id == (int)g.TT.WIKI_NS_14)
                {
                    var root_paths = GoldenPaths.GetStoredPathsToRoot(tag.ut.term);
                    this.rootPathViewer1.AddTermPaths(root_paths);

                    var parents = GoldenParents.GetStoredParents(tag.ut.term_id);
                    txtTermParents.Text = "TOPICS:\r\n";
                    parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList().ForEach(p => txtTermParents.AppendText($"\t{p.parent_term} S={p.S} S_norm={p.S_norm}\r\n"));
                    txtTermParents.AppendText("\r\nSUGGESTED:\r\n");
                    parents.Where(p => !p.is_topic).OrderByDescending(p => p.S).ToList().ForEach(p => txtTermParents.AppendText($"\t{p.parent_term} S={p.S} S_norm={p.S_norm}\r\n"));
                    txtTermParents.Select(0, 0);
                    txtTermParents.ScrollToCaret();
                }
            }
            this.Cursor = Cursors.Default;

            // remember: ProcessPathsToRoot() itself does NOT have to be perfect; intention is to x-ref all URL wiki terms processed suggesed parents
            //           to try and find some overlap/commonality; that's our resultant master suggested parent/term for the URL
            //
            //TextBoxTraceListener listener = new TextBoxTraceListener(this.txtPathsToRoot2);
            //Trace.Listeners.Add(listener);
            //txtPathsToRoot2.Text = "";
            //GoldenPaths.ProcessPathsToRoot(all_root_paths);
            //Trace.Listeners.Remove(listener);

            //this.txtPathsToRoot2.Text += "\r\nTerm Top Counts across Paths:\r\n";
            //foreach (var kvp in path_term_counts.Take(10))
            //    this.txtPathsToRoot2.Text += $"\t{kvp.Key.name} / similar_count={kvp.Value.similar_count} / distances_from_leaf=[{string.Join(",", kvp.Value.distances_from_leaf)}] score={kvp.Value.score.ToString("0.0000")}\r\n";
        }


        private void wikiGoldTree_NodeMouseClick(object sender, TreeNodeMouseClickEventArgs e)
        {
        }

        // 
        // naive classification -- pick random urls, classify -- simulate full user flow
        // TODO FIRST -- need to record top n parent terms for url; 
        // then --
        // (1) add to user_url table -- simulate user history
        // (2) classify naive -- based on mashup of top url terms and their gt_parents
        //...
        private void cmdWalkRndClassify_Click(object sender, EventArgs e)
        {
            var user_id = 5;
            var rnd = new Random();
            using (var db = mm02Entities.Create())
            {
                //
                // two distinct approaches; classifying ONE by ONE (ClassifySingleUrl) 
                //                      or; classifying a SET of URLs in one hit 
                // preferring option (2) here for now!
                //

                //
                // mm_svc.UrlClassifier.ClassifyUrlSet
                //
                {
                    var url_ids = new List<long>();
                    for (int i = 0; i < 20; i++) url_ids.Add((this.lvwUrls.Items[/*rnd.Next(lvwUrls.Items.Count)*/i].Tag as url).id);
                    var classifications = mm_svc.UrlClassifier.ClassifyUrlSet(url_ids, user_id);
                }

                //
                // mm_svc.UrlClassifier.ClassifySingleUrl --> // flow -- simulates user navigating random urls one by one
                //
                /*{
                    // clear down user history
                    db.user_url_classification.RemoveRange(db.user_url_classification.Where(p => p.user_id == user_id));
                    db.SaveChangesTraceValidationErrors();

                    db.user_url.RemoveRange(db.user_url.Where(p => p.userId == user_id));
                    db.SaveChangesTraceValidationErrors();

                    // ClassifySingleUrl 
                    var summary = new Dictionary<term, List<url>>();
                    this.txtOut.Text = "";
                    var traceListener = new TextBoxTraceListener(this.txtOut);
                    Trace.Listeners.Add(traceListener);
                    var sample_user_url_ids = new List<long>();
                    for (int i = 0; i < 100; i++) {
                        var lvi = this.lvwUrls.Items[rnd.Next(lvwUrls.Items.Count)];
                        var url = lvi.Tag as url;

                        int new_classifications, reused_classifications;
                        var classifications = mm_svc.UrlClassifier.ClassifySingleUrl(url.id, user_id, out new_classifications, out reused_classifications, call_level: 1);
                        sample_user_url_ids.Add(db.user_url.Where(p => p.userId == user_id && p.urlId == url.id).Single().id);
                        Application.DoEvents();
                    }

                    // TODO: this can't work -- must re-read the entire sample set and look at their top negative ordinals (i.e. after reclassification)
                    //Trace.WriteLine("***");
                    //Trace.WriteLine("***");
                    //foreach (var user_url_id in sample_user_url_ids)
                    //{
                    //    var url_classifications = db.user_url_classification.Include("user_url").Include("user_url.url").AsNoTracking().Where(p => p.user_url_id == user_url_id).ToListNoLock();
                    //    if (url_classifications.Count == 0) continue;

                    //    var url_classifications_common = url_classifications.Where(p => p.pri < 0).OrderByDescending(p => p.pri);
                    //    var url_classifications_distinct = url_classifications.Where(p => p.pri > 0).OrderBy(p => p.pri);

                    //    if (url_classifications_common.Count() > 0)
                    //    {
                    //        var url = db.urls.Find(url_classifications_common.First().user_url.urlId);
                    //        Trace.WriteLine($"{url.meta_title}");
                    //        foreach (var classification in url_classifications_common)
                    //            Trace.WriteLine($"\tCOMMON TERM: pri={classification.pri} {classification.term}");

                    //        // todo -- group URLs by first common term for output
                    //    }
                    //    else
                    //    {
                    //        var url = db.urls.Find(url_classifications.First().user_url.urlId);
                    //        Trace.WriteLine($"{url.meta_title} >>> NO COMMON CLASSIFICATIONS");
                    //        foreach (var classification in url_classifications_distinct)
                    //            Trace.WriteLine($"\tdistinct term: pri={classification.pri} {classification.term}");
                    //    }
                    //}

                    //foreach (var key in summary.Keys)
                    //{
                    //    this.txtOut.AppendText($"** {key} **\r\n");
                    //    foreach (var url in summary[key])
                    //    {
                    //        this.txtOut.AppendText($"\t -> {url.meta_title} {url.url1}\r\n");
                    //    }
                    //}
                }*/
            }
        }

        private void zoomBrowser1_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            zoomBrowser1.Zoom(70);
        }

        private void txtInfo_LinkClicked(object sender, LinkClickedEventArgs e)
        {
            Process.Start(e.LinkText);
        }

        private void cmdSearchClear_Click(object sender, EventArgs e)
        {
            this.txtGtSearch.Text = "";
        }
    }
}
