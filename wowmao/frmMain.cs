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
using System.Data.Entity;

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

        //private Dictionary<long, List<url_term>> url_term_cache = new Dictionary<long, List<url_term>>();

        private frmTrace trace_form;

        public frmMain() {
            //mm02Entities.static_instance = mm02Entities.Create();

            /*trace_form = new frmTrace();
            trace_form.Show();
            Trace.Listeners.Add(new TextBoxTraceListener(trace_form.txtTrace));
            trace_form.WindowState = FormWindowState.Minimized;*/

            //Correlations.OnCacheAdd += Correlations_cache_add;
            GoldenPaths.OnCacheAdd += GoldenPaths_OnCacheAdd;

            InitializeComponent();
            this.cboTop.SelectedIndex = 2;
            InitTvwRootNodes();

            //txtUrlSearch.SelectedIndex = 1;

            //this.gtGoldTree.BuildTree(g.MAOMAO_ROOT_TERM_ID);
            this.gtGoldTree.OnSearchGoldenTerm += GtGoldTree_OnSearchGoldenTerm;
            this.gtGoldTree.OnSearchGoogle += GtGoldTree_OnSearchGoogle;

            this.wikiGoldTree.OnGtsLoaded += WikiGoldTree_OnGtsLoaded;
            this.wikiGoldTree.OnSearchGoogle += WikiGoldTree_OnSearchGoogle;
            this.wikiGoldTree.OnFindPathsContaining += WikiGoldTree_OnFindPathsContaining;

            this.lvwUrls.ColumnClick += LvwUrls_ColumnClick;

            this.rootPathViewer1.OnTopicToggled += RootPathViewer1_OnTopicToggled;

            this.topicTree1.OnNodeSelect += TopicTree1_OnNodeSelect;
            this.topicTree1.OnFindInWikiTree += TopicTree1_OnFindInWikiTree;

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

            Action set_title = () => this.Text = $"wowmao ~ gt_cache#={GoldenPaths.golden_term_cache.Count}";
            if (this.InvokeRequired)
                this.BeginInvoke(set_title);
            else 
                set_title();
            
            //corr.cache={Correlations.cache.Count} (cache_tot_terms={Correlations.cache_tot_terms}";
            // url_term_cache.cache={url_term_cache.Count}";
        }

        //private void CorrelatedGoldens_cache_add(object sender, EventArgs e) { SetCaption(); }
        //private void Correlations_cache_add(object sender, EventArgs e) { SetCaption(); }
        private void GoldenPaths_OnCacheAdd(object sender, EventArgs e) { SetCaption(); }

        private void cmdSearchURLs_Click(object sender, EventArgs e) {
            this.Cursor = Cursors.WaitCursor;
            InitUrls(txtUrlSearch.Text);
            this.Cursor = Cursors.Default;
        }

        void InitUrls(string search_term) {//, long? golden_term_id = null) {
          
            lvwUrls.Items.Clear();
            var db = mm02Entities.Create(); { //using (var db = mm02Entities.Create()) {
                lvwUrls.BeginUpdate();
                var items = new List<ListViewItem>();
                var rnd = new Random();
                var qry = db.urls
                    .AsNoTracking()
                  //.Include("url_term.term.term_type")
                  //.Include("url_term.term.cal_entity_type")
                    .AsQueryable();

                if (!string.IsNullOrEmpty(search_term)) {
                    qry = qry.Where(p => p.meta_all.ToLower().Contains(search_term.ToLower())); // search by meta string
                    if (chkExcludeProcessed.Checked)
                        qry = qry.Where(p => p.processed_at_utc == null);
                }

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
            //Correlations.cache = new Dictionary<string, List<correlation>>();
            //this.url_term_cache = new Dictionary<long, List<url_term>>();

            mm02Entities.static_instance.Dispose();
            mm02Entities.static_instance = null;
            mm02Entities.static_instance = mm02Entities.Create();
            this.SetCaption();

            InitTvwRootNodes();
            //gtGoldTree.BuildTree(g.MAOMAO_ROOT_TERM_ID);
            wikiGoldTree.BuildTree();
        }

        private void ZoomBrowser(int zoom) {
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

            // get meta
            if (chkUpdateUi.Checked) {
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
            }

            using (var db = mm02Entities.Create()) {

                //
                // ** ProcessTss **
                //
                var l1_url_terms = mm_svc.UrlProcessor.ProcessUrl(url.id, reprocess: chkReprocess.Checked);

                // L1 terms -> for each L1 term: add to TermList
                if (chkUpdateUi.Checked) { 
                    lvwUrlTerms.Items.Clear();
                    lvwUrlTerms.BeginUpdate();

                    var ut_items = new List<ListViewItem>();
                    foreach (var l1_url_term in l1_url_terms.OrderByDescending(p => p.wiki_S != null).ThenByDescending(p => p.tss_norm))
                        if (chkUpdateUi.Checked)
                            ut_items.Add(lvwUrlTerms.NewLvi(l1_url_term, null));

                    lvwUrlTerms.Items.AddRange(ut_items.ToArray());
                    lvwUrlTerms.EndUpdate();
                    SetCols(lvwUrlTerms);
                }

                //
                // url suggested/related parent terms (from UrlProcessing)
                //
                if (chkUpdateUi.Checked) {
                    var parents = db.url_parent_term.AsNoTracking().Include("term").Where(p => p.url_id == url.id).ToListNoLock();
                    var topics = parents.Where(p => p.found_topic);
                    var suggested = parents.Where(p => p.suggested_dynamic);

                    txtInfo.Text += "\r\n\r\nTOPICS:\r\n";
                    topics.OrderBy(p => p.pri).ToList().ForEach(p => txtInfo.AppendText($"\t{p.term} -> S={p.S?.ToString("0.00000")} S_norm={p.S_norm?.ToString("0.00")} avg_S={p.avg_S?.ToString("0.0000")}\r\n"));

                    txtInfo.AppendText("\r\nSUGGESTED (not in topics):\r\n");
                    suggested.Where(p => !topics.Select(p2 => p2.term_id).Contains(p.term_id))
                             .Where(p => !p.term.IS_TOPIC)
                             .OrderBy(p => p.pri).ToList().ForEach(p => txtInfo.AppendText($"\t{p.term} -> S={p.S?.ToString("0.00000")}\r\n"));

                    //txtInfo.AppendText("\r\n\r\n>>> (RelatedParents) url_parent_terms: " + string.Join(", ", parent_terms.Select(p => p.term.name)));

                    txtInfo.AppendText("\r\n\r\n>>> HTTP: " + url.url1 + "\r\n");
                    txtInfo.ScrollToCaret();
                }
            }

            this.Cursor = Cursors.Default;
            GC.Collect(2);
        }

        // walk parallel
        private void cmdWalkParallel_Click(object sender, EventArgs e) {
            var urls_to_process = new List<url>();
            for (int i = 0; i < lvwUrls.Items.Count; i++)
                urls_to_process.Add(lvwUrls.Items[i].Tag as url);
            var remaining = urls_to_process.Count;
            var reprocess = chkReprocess.Checked;
            this.Cursor = Cursors.WaitCursor;
            Parallel.ForEach(urls_to_process, new ParallelOptions() { MaxDegreeOfParallelism = 8 }, (url) => {
                var a = mm_svc.UrlProcessor.ProcessUrl(url.id, reprocess);
                this.BeginInvoke((Action)(() => this.lblWalkInfo.Text = $"remaining: {--remaining}..."));
                Application.DoEvents();
            });
            this.Cursor = Cursors.Default;
        }

        // walk sequential
        private bool walking = false;
        private void cmdWalk_Click(object sender, EventArgs e) {
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
                GC.Collect(2);
            }
            else {
                cmdWalk.Text = "Walk...";
                walking = false;
                GC.Collect(2);
            }
        }

        private void cmdGtSearch_Click(object sender, EventArgs e) {
            wikiGoldTree.Search(this.txtGtSearch.Text, chkExactMatch.Checked, chkTopicsOnly.Checked);
        }

        bool getting_all_gts = false;
        private void cmdExpandAll_Click(object sender, EventArgs e) {
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

        private void WikiGoldTree_OnGtsLoaded(object sender, Controls.WikiGoldenTree.OnGtsLoadedEventArgs e) {
            this.Invoke((MethodInvoker)delegate { this.lblTotGtsLoaded.Text = e.count_loaded.ToString() + " GTs loaded."; });
        }

        private void WikiGoldTree_OnFindPathsContaining(object sender, Controls.WikiGoldenTree.OnFindPathsContainingEventArgs e) {
            // load the various paths to root (multiple leaf terms) that the topic appears in
            var paths_with_topic = GoldenPaths.GetStoredPathsToRoot_ContainingTerm(e.term_id, e.sample_size);
            this.rootPathViewer1.AddTermPaths(paths_with_topic);
        }

        private void wikiGoldTree_AfterSelect(object sender, TreeViewEventArgs e) {
            // paths to root
            if (wikiGoldTree.SelectedNode == null) return;
            var gt = wikiGoldTree.SelectedNode.Tag as golden_term;
            this.Cursor = Cursors.WaitCursor;
            var root_paths = GoldenPaths.GetOrProcessPathsToRoot(gt.child_term.id); //GoldenPaths.CalculatePathsToRoot(gt.child_term_id);
            root_paths.ForEach(p => Trace.WriteLine(gt.child_term.name + " // " + string.Join(" / ", p.Take(p.Count - 0).Select(p2 => p2.t.name)) + "\r\n"));

            if (gt.child_term.IS_TOPIC) {
                // load the various paths to root (multiple leaf terms) that the topic appears in
                //var paths_with_topic = GoldenPaths.GetStoredPathsToRoot_ContainingTerm(gt.child_term_id, sample_size: 50);
                //this.rootPathViewer1.AddTermPaths(paths_with_topic);
                ;
            }
            else {
                // load the non-topic term's paths to root
                this.rootPathViewer1.AddTermPaths(root_paths);
            }
            this.Cursor = Cursors.Default;
        }

        // load the various paths to root (multiple leaf terms) that the topic appears in
        private void TopicTree1_OnNodeSelect(object sender, Controls.TopicTree.OnNodeSelectEventArgs e) {
            this.Cursor = Cursors.WaitCursor;
            var paths_with_topic = GoldenPaths.GetStoredPathsToRoot_ContainingTerm(e.term_id, e.sample_size);
            this.rootPathViewer1.AddTermPaths(paths_with_topic);
            this.Cursor = Cursors.Default;
        }

        private void TopicTree1_OnFindInWikiTree(object sender, Controls.TopicTree.OnFindInWikiTreeEventArgs e) {
            this.txtGtSearch.Text = e.term_id.ToString();
            this.cmdGtSearch_Click(null, null);
            this.tabTrees.SelectedIndex = 0;
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
                    using (var db = mm02Entities.Create()) {
                        // refresh term paths to root data (including PtR term topic info)
                        var term = db.terms.AsNoTracking().Include(x => x.gt_path_to_root1.Select(y => y.term))
                                     .Where(p => p.id == tag.ut.term.id).FirstOrDefaultNoLock();
                        var root_paths = GoldenPaths.GetStoredPathsToRoot_ForTerm(term);// tag.ut.term);
                        this.rootPathViewer1.AddTermPaths(root_paths);

                        // recalc parents
                        GoldenParents.GetOrProcessParents(tag.ut.term_id, reprocess: true);
                        var parents = GoldenParents.GetStoredParents(tag.ut.term_id);

                        txtTermParents.Text = "TOPICS:\r\n";
                        parents.Where(p => p.is_topic).OrderByDescending(p => p.S).ToList().ForEach(p => txtTermParents.AppendText($"\t{p.parent_term} S={p.S} S_norm={p.S_norm}\r\n"));
                        txtTermParents.AppendText("\r\nSUGGESTED:\r\n");
                        parents.Where(p => !p.is_topic).OrderByDescending(p => p.S).ToList().ForEach(p => txtTermParents.AppendText($"\t{p.parent_term} S={p.S} S_norm={p.S_norm}\r\n"));
                        txtTermParents.Select(0, 0);
                        txtTermParents.ScrollToCaret();
                    }
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

        bool loaded_topic_tree = false;
        private void tabTrees_SelectedIndexChanged(object sender, EventArgs e)
        {
            // populate TopicTree
            if (tabTrees.SelectedIndex == 1 && !loaded_topic_tree) {
                this.Cursor = Cursors.WaitCursor;
                this.topicTree1.BuildTree();
                this.Cursor = Cursors.Default;
                loaded_topic_tree = true;
            }
        }

    }
}
