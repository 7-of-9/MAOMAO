namespace wowmao
{
    partial class frmMain
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frmMain));
            this.pnlLeft = new System.Windows.Forms.Panel();
            this.pnlGoldenTree = new System.Windows.Forms.Panel();
            this.tabTrees = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.txtGtSearch = new System.Windows.Forms.TextBox();
            this.wikiGoldTree = new wowmao.Controls.WikiGoldenTree();
            this.cmdSearchClear = new System.Windows.Forms.Button();
            this.cmdGtSearch = new System.Windows.Forms.Button();
            this.chkTopicsOnly = new System.Windows.Forms.CheckBox();
            this.cmdExpandAll = new System.Windows.Forms.Button();
            this.chkExactMatch = new System.Windows.Forms.CheckBox();
            this.lblTotGtsLoaded = new System.Windows.Forms.Label();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.topicTree1 = new wowmao.Controls.TopicTree();
            this.gtGoldTree = new wowmao.MmGoldenTree();
            this.splitter7 = new System.Windows.Forms.Splitter();
            this.pnlTermTreeAll = new System.Windows.Forms.Panel();
            this.zoomBrowser1 = new wowmao.Controls.ZoomBrowser();
            this.txtOut = new System.Windows.Forms.TextBox();
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.splitter1 = new System.Windows.Forms.Splitter();
            this.pnlTestMode = new System.Windows.Forms.Panel();
            this.splitter5 = new System.Windows.Forms.Splitter();
            this.pnlDirectGoldenCorrelations = new System.Windows.Forms.Panel();
            this.pnlLevel2Terms = new System.Windows.Forms.Panel();
            this.txtTermParents = new System.Windows.Forms.TextBox();
            this.splitter6 = new System.Windows.Forms.Splitter();
            this.rootPathViewer1 = new wowmao.Controls.RootPathViewer();
            this.lvwUrlTerms = new wowmao.TermList();
            this.splitter2 = new System.Windows.Forms.Splitter();
            this.pnlURLs = new System.Windows.Forms.Panel();
            this.pnlUrlTerms = new System.Windows.Forms.Panel();
            this.txtInfo = new System.Windows.Forms.RichTextBox();
            this.splitter3 = new System.Windows.Forms.Splitter();
            this.pnlURL_List = new System.Windows.Forms.Panel();
            this.cmdWalkParallel = new System.Windows.Forms.Button();
            this.cmdWalkRndClassify = new System.Windows.Forms.Button();
            this.chkReprocess = new System.Windows.Forms.CheckBox();
            this.chkExcludeProcessed = new System.Windows.Forms.CheckBox();
            this.chkRndOrder = new System.Windows.Forms.CheckBox();
            this.chkUpdateUi = new System.Windows.Forms.CheckBox();
            this.lblWalkInfo = new System.Windows.Forms.Label();
            this.txtUrlSearch = new System.Windows.Forms.ComboBox();
            this.cboTop = new System.Windows.Forms.ComboBox();
            this.cmdWalk = new System.Windows.Forms.Button();
            this.lvwUrls = new System.Windows.Forms.ListView();
            this.columnHeader26 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader27 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader10 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader23 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader11 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader16 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader17 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader25 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader22 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader24 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.imageList1 = new System.Windows.Forms.ImageList(this.components);
            this.cmdSearchURLs = new System.Windows.Forms.Button();
            this.pnlLeft.SuspendLayout();
            this.pnlGoldenTree.SuspendLayout();
            this.tabTrees.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            this.pnlTermTreeAll.SuspendLayout();
            this.pnlTestMode.SuspendLayout();
            this.pnlDirectGoldenCorrelations.SuspendLayout();
            this.pnlLevel2Terms.SuspendLayout();
            this.pnlURLs.SuspendLayout();
            this.pnlUrlTerms.SuspendLayout();
            this.pnlURL_List.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlLeft
            // 
            this.pnlLeft.Controls.Add(this.pnlGoldenTree);
            this.pnlLeft.Controls.Add(this.splitter7);
            this.pnlLeft.Controls.Add(this.pnlTermTreeAll);
            this.pnlLeft.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlLeft.Location = new System.Drawing.Point(0, 0);
            this.pnlLeft.Name = "pnlLeft";
            this.pnlLeft.Size = new System.Drawing.Size(500, 741);
            this.pnlLeft.TabIndex = 2;
            // 
            // pnlGoldenTree
            // 
            this.pnlGoldenTree.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.pnlGoldenTree.Controls.Add(this.tabTrees);
            this.pnlGoldenTree.Controls.Add(this.gtGoldTree);
            this.pnlGoldenTree.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlGoldenTree.Location = new System.Drawing.Point(0, 406);
            this.pnlGoldenTree.Name = "pnlGoldenTree";
            this.pnlGoldenTree.Size = new System.Drawing.Size(500, 335);
            this.pnlGoldenTree.TabIndex = 6;
            // 
            // tabTrees
            // 
            this.tabTrees.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.tabTrees.Controls.Add(this.tabPage1);
            this.tabTrees.Controls.Add(this.tabPage2);
            this.tabTrees.Location = new System.Drawing.Point(3, 4);
            this.tabTrees.Name = "tabTrees";
            this.tabTrees.SelectedIndex = 0;
            this.tabTrees.Size = new System.Drawing.Size(494, 327);
            this.tabTrees.TabIndex = 10;
            this.tabTrees.SelectedIndexChanged += new System.EventHandler(this.tabTrees_SelectedIndexChanged);
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.txtGtSearch);
            this.tabPage1.Controls.Add(this.wikiGoldTree);
            this.tabPage1.Controls.Add(this.cmdSearchClear);
            this.tabPage1.Controls.Add(this.cmdGtSearch);
            this.tabPage1.Controls.Add(this.chkTopicsOnly);
            this.tabPage1.Controls.Add(this.cmdExpandAll);
            this.tabPage1.Controls.Add(this.chkExactMatch);
            this.tabPage1.Controls.Add(this.lblTotGtsLoaded);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(486, 301);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "WikiTree";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // txtGtSearch
            // 
            this.txtGtSearch.Location = new System.Drawing.Point(125, 6);
            this.txtGtSearch.Name = "txtGtSearch";
            this.txtGtSearch.Size = new System.Drawing.Size(118, 21);
            this.txtGtSearch.TabIndex = 2;
            this.txtGtSearch.Text = "chess";
            // 
            // wikiGoldTree
            // 
            this.wikiGoldTree.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.wikiGoldTree.Location = new System.Drawing.Point(5, 33);
            this.wikiGoldTree.Name = "wikiGoldTree";
            this.wikiGoldTree.Size = new System.Drawing.Size(477, 265);
            this.wikiGoldTree.TabIndex = 1;
            this.wikiGoldTree.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.wikiGoldTree_AfterSelect);
            this.wikiGoldTree.NodeMouseClick += new System.Windows.Forms.TreeNodeMouseClickEventHandler(this.wikiGoldTree_NodeMouseClick);
            // 
            // cmdSearchClear
            // 
            this.cmdSearchClear.Location = new System.Drawing.Point(86, 6);
            this.cmdSearchClear.Name = "cmdSearchClear";
            this.cmdSearchClear.Size = new System.Drawing.Size(33, 21);
            this.cmdSearchClear.TabIndex = 9;
            this.cmdSearchClear.Text = "x";
            this.cmdSearchClear.UseVisualStyleBackColor = true;
            this.cmdSearchClear.Click += new System.EventHandler(this.cmdSearchClear_Click);
            // 
            // cmdGtSearch
            // 
            this.cmdGtSearch.Location = new System.Drawing.Point(6, 6);
            this.cmdGtSearch.Name = "cmdGtSearch";
            this.cmdGtSearch.Size = new System.Drawing.Size(74, 21);
            this.cmdGtSearch.TabIndex = 3;
            this.cmdGtSearch.Text = "Search GTs:";
            this.cmdGtSearch.UseVisualStyleBackColor = true;
            this.cmdGtSearch.Click += new System.EventHandler(this.cmdGtSearch_Click);
            // 
            // chkTopicsOnly
            // 
            this.chkTopicsOnly.AutoSize = true;
            this.chkTopicsOnly.Location = new System.Drawing.Point(248, 15);
            this.chkTopicsOnly.Name = "chkTopicsOnly";
            this.chkTopicsOnly.Size = new System.Drawing.Size(77, 17);
            this.chkTopicsOnly.TabIndex = 8;
            this.chkTopicsOnly.Text = "only topics";
            this.chkTopicsOnly.UseVisualStyleBackColor = true;
            // 
            // cmdExpandAll
            // 
            this.cmdExpandAll.Location = new System.Drawing.Point(338, 5);
            this.cmdExpandAll.Name = "cmdExpandAll";
            this.cmdExpandAll.Size = new System.Drawing.Size(74, 21);
            this.cmdExpandAll.TabIndex = 4;
            this.cmdExpandAll.Text = "(expand all)";
            this.cmdExpandAll.UseVisualStyleBackColor = true;
            this.cmdExpandAll.Click += new System.EventHandler(this.cmdExpandAll_Click);
            // 
            // chkExactMatch
            // 
            this.chkExactMatch.AutoSize = true;
            this.chkExactMatch.Checked = true;
            this.chkExactMatch.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chkExactMatch.Location = new System.Drawing.Point(248, -1);
            this.chkExactMatch.Name = "chkExactMatch";
            this.chkExactMatch.Size = new System.Drawing.Size(84, 17);
            this.chkExactMatch.TabIndex = 6;
            this.chkExactMatch.Text = "exact match";
            this.chkExactMatch.UseVisualStyleBackColor = true;
            // 
            // lblTotGtsLoaded
            // 
            this.lblTotGtsLoaded.AutoSize = true;
            this.lblTotGtsLoaded.Location = new System.Drawing.Point(418, 9);
            this.lblTotGtsLoaded.Name = "lblTotGtsLoaded";
            this.lblTotGtsLoaded.Size = new System.Drawing.Size(45, 13);
            this.lblTotGtsLoaded.TabIndex = 5;
            this.lblTotGtsLoaded.Text = "count ...";
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.topicTree1);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(486, 301);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "TopicTree";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // topicTree1
            // 
            this.topicTree1.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.topicTree1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.topicTree1.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.topicTree1.Location = new System.Drawing.Point(3, 3);
            this.topicTree1.Name = "topicTree1";
            this.topicTree1.Size = new System.Drawing.Size(480, 295);
            this.topicTree1.TabIndex = 0;
            // 
            // gtGoldTree
            // 
            this.gtGoldTree.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gtGoldTree.BackColor = System.Drawing.SystemColors.HotTrack;
            this.gtGoldTree.Location = new System.Drawing.Point(287, 6);
            this.gtGoldTree.Name = "gtGoldTree";
            this.gtGoldTree.Size = new System.Drawing.Size(210, 0);
            this.gtGoldTree.TabIndex = 0;
            // 
            // splitter7
            // 
            this.splitter7.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter7.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter7.Location = new System.Drawing.Point(0, 400);
            this.splitter7.Name = "splitter7";
            this.splitter7.Size = new System.Drawing.Size(500, 6);
            this.splitter7.TabIndex = 5;
            this.splitter7.TabStop = false;
            // 
            // pnlTermTreeAll
            // 
            this.pnlTermTreeAll.Controls.Add(this.zoomBrowser1);
            this.pnlTermTreeAll.Controls.Add(this.txtOut);
            this.pnlTermTreeAll.Controls.Add(this.cmdRefresh);
            this.pnlTermTreeAll.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlTermTreeAll.Location = new System.Drawing.Point(0, 0);
            this.pnlTermTreeAll.Name = "pnlTermTreeAll";
            this.pnlTermTreeAll.Size = new System.Drawing.Size(500, 400);
            this.pnlTermTreeAll.TabIndex = 4;
            // 
            // zoomBrowser1
            // 
            this.zoomBrowser1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.zoomBrowser1.Location = new System.Drawing.Point(5, 28);
            this.zoomBrowser1.MinimumSize = new System.Drawing.Size(20, 20);
            this.zoomBrowser1.Name = "zoomBrowser1";
            this.zoomBrowser1.Size = new System.Drawing.Size(490, 371);
            this.zoomBrowser1.TabIndex = 9;
            this.zoomBrowser1.DocumentCompleted += new System.Windows.Forms.WebBrowserDocumentCompletedEventHandler(this.zoomBrowser1_DocumentCompleted);
            // 
            // txtOut
            // 
            this.txtOut.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtOut.Location = new System.Drawing.Point(328, 7);
            this.txtOut.Multiline = true;
            this.txtOut.Name = "txtOut";
            this.txtOut.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txtOut.Size = new System.Drawing.Size(166, 19);
            this.txtOut.TabIndex = 8;
            this.txtOut.WordWrap = false;
            // 
            // cmdRefresh
            // 
            this.cmdRefresh.Location = new System.Drawing.Point(2, 3);
            this.cmdRefresh.Name = "cmdRefresh";
            this.cmdRefresh.Size = new System.Drawing.Size(84, 19);
            this.cmdRefresh.TabIndex = 2;
            this.cmdRefresh.Text = "Refresh";
            this.cmdRefresh.UseVisualStyleBackColor = true;
            this.cmdRefresh.Click += new System.EventHandler(this.cmdRefresh_Click_1);
            // 
            // splitter1
            // 
            this.splitter1.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter1.Location = new System.Drawing.Point(500, 0);
            this.splitter1.Name = "splitter1";
            this.splitter1.Size = new System.Drawing.Size(6, 741);
            this.splitter1.TabIndex = 3;
            this.splitter1.TabStop = false;
            // 
            // pnlTestMode
            // 
            this.pnlTestMode.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.pnlTestMode.Controls.Add(this.splitter5);
            this.pnlTestMode.Controls.Add(this.pnlDirectGoldenCorrelations);
            this.pnlTestMode.Controls.Add(this.lvwUrlTerms);
            this.pnlTestMode.Controls.Add(this.splitter2);
            this.pnlTestMode.Controls.Add(this.pnlURLs);
            this.pnlTestMode.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlTestMode.Location = new System.Drawing.Point(506, 0);
            this.pnlTestMode.Name = "pnlTestMode";
            this.pnlTestMode.Size = new System.Drawing.Size(1055, 741);
            this.pnlTestMode.TabIndex = 4;
            // 
            // splitter5
            // 
            this.splitter5.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter5.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter5.Location = new System.Drawing.Point(0, 511);
            this.splitter5.Name = "splitter5";
            this.splitter5.Size = new System.Drawing.Size(1055, 6);
            this.splitter5.TabIndex = 10;
            this.splitter5.TabStop = false;
            // 
            // pnlDirectGoldenCorrelations
            // 
            this.pnlDirectGoldenCorrelations.Controls.Add(this.pnlLevel2Terms);
            this.pnlDirectGoldenCorrelations.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlDirectGoldenCorrelations.Location = new System.Drawing.Point(0, 511);
            this.pnlDirectGoldenCorrelations.Name = "pnlDirectGoldenCorrelations";
            this.pnlDirectGoldenCorrelations.Size = new System.Drawing.Size(1055, 230);
            this.pnlDirectGoldenCorrelations.TabIndex = 9;
            // 
            // pnlLevel2Terms
            // 
            this.pnlLevel2Terms.Controls.Add(this.txtTermParents);
            this.pnlLevel2Terms.Controls.Add(this.splitter6);
            this.pnlLevel2Terms.Controls.Add(this.rootPathViewer1);
            this.pnlLevel2Terms.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlLevel2Terms.Location = new System.Drawing.Point(0, 0);
            this.pnlLevel2Terms.Name = "pnlLevel2Terms";
            this.pnlLevel2Terms.Size = new System.Drawing.Size(1055, 230);
            this.pnlLevel2Terms.TabIndex = 10;
            // 
            // txtTermParents
            // 
            this.txtTermParents.Dock = System.Windows.Forms.DockStyle.Fill;
            this.txtTermParents.Location = new System.Drawing.Point(806, 0);
            this.txtTermParents.Multiline = true;
            this.txtTermParents.Name = "txtTermParents";
            this.txtTermParents.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txtTermParents.Size = new System.Drawing.Size(249, 230);
            this.txtTermParents.TabIndex = 14;
            this.txtTermParents.WordWrap = false;
            // 
            // splitter6
            // 
            this.splitter6.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter6.Location = new System.Drawing.Point(800, 0);
            this.splitter6.Name = "splitter6";
            this.splitter6.Size = new System.Drawing.Size(6, 230);
            this.splitter6.TabIndex = 10;
            this.splitter6.TabStop = false;
            // 
            // rootPathViewer1
            // 
            this.rootPathViewer1.AutoScroll = true;
            this.rootPathViewer1.BackColor = System.Drawing.SystemColors.Control;
            this.rootPathViewer1.Dock = System.Windows.Forms.DockStyle.Left;
            this.rootPathViewer1.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.rootPathViewer1.Location = new System.Drawing.Point(0, 0);
            this.rootPathViewer1.Name = "rootPathViewer1";
            this.rootPathViewer1.Size = new System.Drawing.Size(800, 230);
            this.rootPathViewer1.TabIndex = 13;
            // 
            // lvwUrlTerms
            // 
            this.lvwUrlTerms.Dock = System.Windows.Forms.DockStyle.Top;
            this.lvwUrlTerms.FullRowSelect = true;
            this.lvwUrlTerms.HideSelection = false;
            this.lvwUrlTerms.Location = new System.Drawing.Point(0, 356);
            this.lvwUrlTerms.Name = "lvwUrlTerms";
            this.lvwUrlTerms.Size = new System.Drawing.Size(1055, 155);
            this.lvwUrlTerms.TabIndex = 8;
            this.lvwUrlTerms.UseCompatibleStateImageBehavior = false;
            this.lvwUrlTerms.View = System.Windows.Forms.View.Details;
            this.lvwUrlTerms.SelectedIndexChanged += new System.EventHandler(this.lvwUrlTerms_SelectedIndexChanged);
            // 
            // splitter2
            // 
            this.splitter2.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter2.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter2.Location = new System.Drawing.Point(0, 350);
            this.splitter2.Name = "splitter2";
            this.splitter2.Size = new System.Drawing.Size(1055, 6);
            this.splitter2.TabIndex = 4;
            this.splitter2.TabStop = false;
            // 
            // pnlURLs
            // 
            this.pnlURLs.BackColor = System.Drawing.SystemColors.AppWorkspace;
            this.pnlURLs.Controls.Add(this.pnlUrlTerms);
            this.pnlURLs.Controls.Add(this.splitter3);
            this.pnlURLs.Controls.Add(this.pnlURL_List);
            this.pnlURLs.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlURLs.Location = new System.Drawing.Point(0, 0);
            this.pnlURLs.Name = "pnlURLs";
            this.pnlURLs.Size = new System.Drawing.Size(1055, 350);
            this.pnlURLs.TabIndex = 0;
            // 
            // pnlUrlTerms
            // 
            this.pnlUrlTerms.BackColor = System.Drawing.Color.Yellow;
            this.pnlUrlTerms.Controls.Add(this.txtInfo);
            this.pnlUrlTerms.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlUrlTerms.Location = new System.Drawing.Point(806, 0);
            this.pnlUrlTerms.Name = "pnlUrlTerms";
            this.pnlUrlTerms.Size = new System.Drawing.Size(249, 350);
            this.pnlUrlTerms.TabIndex = 6;
            // 
            // txtInfo
            // 
            this.txtInfo.Dock = System.Windows.Forms.DockStyle.Fill;
            this.txtInfo.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtInfo.Location = new System.Drawing.Point(0, 0);
            this.txtInfo.Name = "txtInfo";
            this.txtInfo.ScrollBars = System.Windows.Forms.RichTextBoxScrollBars.ForcedHorizontal;
            this.txtInfo.Size = new System.Drawing.Size(249, 350);
            this.txtInfo.TabIndex = 6;
            this.txtInfo.Text = "";
            this.txtInfo.WordWrap = false;
            this.txtInfo.LinkClicked += new System.Windows.Forms.LinkClickedEventHandler(this.txtInfo_LinkClicked);
            // 
            // splitter3
            // 
            this.splitter3.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter3.Location = new System.Drawing.Point(800, 0);
            this.splitter3.Name = "splitter3";
            this.splitter3.Size = new System.Drawing.Size(6, 350);
            this.splitter3.TabIndex = 4;
            this.splitter3.TabStop = false;
            // 
            // pnlURL_List
            // 
            this.pnlURL_List.Controls.Add(this.cmdWalkParallel);
            this.pnlURL_List.Controls.Add(this.cmdWalkRndClassify);
            this.pnlURL_List.Controls.Add(this.chkReprocess);
            this.pnlURL_List.Controls.Add(this.chkExcludeProcessed);
            this.pnlURL_List.Controls.Add(this.chkRndOrder);
            this.pnlURL_List.Controls.Add(this.chkUpdateUi);
            this.pnlURL_List.Controls.Add(this.lblWalkInfo);
            this.pnlURL_List.Controls.Add(this.txtUrlSearch);
            this.pnlURL_List.Controls.Add(this.cboTop);
            this.pnlURL_List.Controls.Add(this.cmdWalk);
            this.pnlURL_List.Controls.Add(this.lvwUrls);
            this.pnlURL_List.Controls.Add(this.cmdSearchURLs);
            this.pnlURL_List.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlURL_List.Location = new System.Drawing.Point(0, 0);
            this.pnlURL_List.Name = "pnlURL_List";
            this.pnlURL_List.Size = new System.Drawing.Size(800, 350);
            this.pnlURL_List.TabIndex = 1;
            // 
            // cmdWalkParallel
            // 
            this.cmdWalkParallel.Location = new System.Drawing.Point(96, 2);
            this.cmdWalkParallel.Name = "cmdWalkParallel";
            this.cmdWalkParallel.Size = new System.Drawing.Size(51, 19);
            this.cmdWalkParallel.TabIndex = 15;
            this.cmdWalkParallel.Text = "walk(P)";
            this.cmdWalkParallel.UseVisualStyleBackColor = true;
            this.cmdWalkParallel.Click += new System.EventHandler(this.cmdWalkParallel_Click);
            // 
            // cmdWalkRndClassify
            // 
            this.cmdWalkRndClassify.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cmdWalkRndClassify.Location = new System.Drawing.Point(723, 3);
            this.cmdWalkRndClassify.Name = "cmdWalkRndClassify";
            this.cmdWalkRndClassify.Size = new System.Drawing.Size(74, 19);
            this.cmdWalkRndClassify.TabIndex = 14;
            this.cmdWalkRndClassify.Text = "walk rnd & classify (uid=5)...";
            this.cmdWalkRndClassify.UseVisualStyleBackColor = true;
            this.cmdWalkRndClassify.Click += new System.EventHandler(this.cmdWalkRndClassify_Click);
            // 
            // chkReprocess
            // 
            this.chkReprocess.AutoSize = true;
            this.chkReprocess.Checked = true;
            this.chkReprocess.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chkReprocess.Location = new System.Drawing.Point(400, 5);
            this.chkReprocess.Name = "chkReprocess";
            this.chkReprocess.Size = new System.Drawing.Size(76, 17);
            this.chkReprocess.TabIndex = 13;
            this.chkReprocess.Text = "re-process";
            this.chkReprocess.UseVisualStyleBackColor = true;
            // 
            // chkExcludeProcessed
            // 
            this.chkExcludeProcessed.AutoSize = true;
            this.chkExcludeProcessed.Location = new System.Drawing.Point(321, 5);
            this.chkExcludeProcessed.Name = "chkExcludeProcessed";
            this.chkExcludeProcessed.Size = new System.Drawing.Size(71, 17);
            this.chkExcludeProcessed.TabIndex = 12;
            this.chkExcludeProcessed.Text = "ex. proc\'d";
            this.chkExcludeProcessed.UseVisualStyleBackColor = true;
            // 
            // chkRndOrder
            // 
            this.chkRndOrder.AutoSize = true;
            this.chkRndOrder.Location = new System.Drawing.Point(228, 5);
            this.chkRndOrder.Name = "chkRndOrder";
            this.chkRndOrder.Size = new System.Drawing.Size(85, 17);
            this.chkRndOrder.TabIndex = 11;
            this.chkRndOrder.Text = "order-by-rnd";
            this.chkRndOrder.UseVisualStyleBackColor = true;
            // 
            // chkUpdateUi
            // 
            this.chkUpdateUi.AutoSize = true;
            this.chkUpdateUi.Checked = true;
            this.chkUpdateUi.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chkUpdateUi.Location = new System.Drawing.Point(614, 4);
            this.chkUpdateUi.Name = "chkUpdateUi";
            this.chkUpdateUi.Size = new System.Drawing.Size(72, 17);
            this.chkUpdateUi.TabIndex = 10;
            this.chkUpdateUi.Text = "update UI";
            this.chkUpdateUi.UseVisualStyleBackColor = true;
            // 
            // lblWalkInfo
            // 
            this.lblWalkInfo.AutoSize = true;
            this.lblWalkInfo.BackColor = System.Drawing.Color.Cyan;
            this.lblWalkInfo.Location = new System.Drawing.Point(701, 7);
            this.lblWalkInfo.Name = "lblWalkInfo";
            this.lblWalkInfo.Size = new System.Drawing.Size(16, 13);
            this.lblWalkInfo.TabIndex = 9;
            this.lblWalkInfo.Text = "...";
            // 
            // txtUrlSearch
            // 
            this.txtUrlSearch.FormattingEnabled = true;
            this.txtUrlSearch.Items.AddRange(new object[] {
            "mission in kenya",
            "arnold",
            "tom and jerry",
            "hillary",
            "chess"});
            this.txtUrlSearch.Location = new System.Drawing.Point(477, 1);
            this.txtUrlSearch.Name = "txtUrlSearch";
            this.txtUrlSearch.Size = new System.Drawing.Size(120, 21);
            this.txtUrlSearch.TabIndex = 8;
            // 
            // cboTop
            // 
            this.cboTop.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cboTop.FormattingEnabled = true;
            this.cboTop.Items.AddRange(new object[] {
            "1",
            "10",
            "100",
            "1000",
            "100000"});
            this.cboTop.Location = new System.Drawing.Point(149, 1);
            this.cboTop.Name = "cboTop";
            this.cboTop.Size = new System.Drawing.Size(72, 21);
            this.cboTop.TabIndex = 7;
            // 
            // cmdWalk
            // 
            this.cmdWalk.Location = new System.Drawing.Point(57, 2);
            this.cmdWalk.Name = "cmdWalk";
            this.cmdWalk.Size = new System.Drawing.Size(38, 19);
            this.cmdWalk.TabIndex = 6;
            this.cmdWalk.Text = "walk";
            this.cmdWalk.UseVisualStyleBackColor = true;
            this.cmdWalk.Click += new System.EventHandler(this.cmdWalk_Click);
            // 
            // lvwUrls
            // 
            this.lvwUrls.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lvwUrls.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader26,
            this.columnHeader27,
            this.columnHeader10,
            this.columnHeader1,
            this.columnHeader2,
            this.columnHeader23,
            this.columnHeader3,
            this.columnHeader11,
            this.columnHeader16,
            this.columnHeader17,
            this.columnHeader25,
            this.columnHeader22,
            this.columnHeader24});
            this.lvwUrls.FullRowSelect = true;
            this.lvwUrls.GridLines = true;
            this.lvwUrls.HideSelection = false;
            this.lvwUrls.LargeImageList = this.imageList1;
            this.lvwUrls.Location = new System.Drawing.Point(3, 23);
            this.lvwUrls.MultiSelect = false;
            this.lvwUrls.Name = "lvwUrls";
            this.lvwUrls.Size = new System.Drawing.Size(797, 325);
            this.lvwUrls.SmallImageList = this.imageList1;
            this.lvwUrls.TabIndex = 5;
            this.lvwUrls.UseCompatibleStateImageBehavior = false;
            this.lvwUrls.View = System.Windows.Forms.View.Details;
            this.lvwUrls.SelectedIndexChanged += new System.EventHandler(this.lvwUrls_SelectedIndexChanged);
            // 
            // columnHeader26
            // 
            this.columnHeader26.Text = "?";
            // 
            // columnHeader27
            // 
            this.columnHeader27.Text = "W";
            // 
            // columnHeader10
            // 
            this.columnHeader10.Text = "id";
            // 
            // columnHeader1
            // 
            this.columnHeader1.Text = "url";
            this.columnHeader1.Width = 49;
            // 
            // columnHeader2
            // 
            this.columnHeader2.Text = "meta_title";
            this.columnHeader2.Width = 204;
            // 
            // columnHeader23
            // 
            this.columnHeader23.Text = "NSS";
            // 
            // columnHeader3
            // 
            this.columnHeader3.Text = "terms";
            this.columnHeader3.Width = 40;
            // 
            // columnHeader11
            // 
            this.columnHeader11.Text = "cur-gold";
            this.columnHeader11.Width = 50;
            // 
            // columnHeader16
            // 
            this.columnHeader16.Text = "new-gold-L1";
            // 
            // columnHeader17
            // 
            this.columnHeader17.Text = "new-gold-L2";
            // 
            // columnHeader25
            // 
            this.columnHeader25.Text = "proc-utc";
            // 
            // columnHeader22
            // 
            this.columnHeader22.Text = "proc-#";
            // 
            // columnHeader24
            // 
            this.columnHeader24.Text = "img_url";
            // 
            // imageList1
            // 
            this.imageList1.ImageStream = ((System.Windows.Forms.ImageListStreamer)(resources.GetObject("imageList1.ImageStream")));
            this.imageList1.TransparentColor = System.Drawing.Color.Transparent;
            this.imageList1.Images.SetKeyName(0, "6_custom_icons_02.png");
            this.imageList1.Images.SetKeyName(1, "6_custom_icons_03.png");
            this.imageList1.Images.SetKeyName(2, "6customicons_09.png");
            this.imageList1.Images.SetKeyName(3, "check_icon.png");
            this.imageList1.Images.SetKeyName(4, "delete_icon.png");
            this.imageList1.Images.SetKeyName(5, "heart_icon.png");
            this.imageList1.Images.SetKeyName(6, "icon.png");
            this.imageList1.Images.SetKeyName(7, "pause_icon.png");
            this.imageList1.Images.SetKeyName(8, "play_icon.png");
            this.imageList1.Images.SetKeyName(9, "plus_icon.png");
            this.imageList1.Images.SetKeyName(10, "ps_sirius_dog_black.png");
            this.imageList1.Images.SetKeyName(11, "ps_sirius_dog_blue.png");
            this.imageList1.Images.SetKeyName(12, "ps_sirius_dog_gray.png");
            this.imageList1.Images.SetKeyName(13, "skull_icon.png");
            this.imageList1.Images.SetKeyName(14, "smile_icon.png");
            this.imageList1.Images.SetKeyName(15, "stop_icon.png");
            this.imageList1.Images.SetKeyName(16, "success.png");
            // 
            // cmdSearchURLs
            // 
            this.cmdSearchURLs.Location = new System.Drawing.Point(3, 2);
            this.cmdSearchURLs.Name = "cmdSearchURLs";
            this.cmdSearchURLs.Size = new System.Drawing.Size(52, 19);
            this.cmdSearchURLs.TabIndex = 3;
            this.cmdSearchURLs.Text = "Search:";
            this.cmdSearchURLs.UseVisualStyleBackColor = true;
            this.cmdSearchURLs.Click += new System.EventHandler(this.cmdSearchURLs_Click);
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoScroll = true;
            this.ClientSize = new System.Drawing.Size(1561, 741);
            this.Controls.Add(this.pnlTestMode);
            this.Controls.Add(this.splitter1);
            this.Controls.Add(this.pnlLeft);
            this.DoubleBuffered = true;
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "frmMain";
            this.Text = "wowmao";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.pnlLeft.ResumeLayout(false);
            this.pnlGoldenTree.ResumeLayout(false);
            this.tabTrees.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.tabPage1.PerformLayout();
            this.tabPage2.ResumeLayout(false);
            this.pnlTermTreeAll.ResumeLayout(false);
            this.pnlTermTreeAll.PerformLayout();
            this.pnlTestMode.ResumeLayout(false);
            this.pnlDirectGoldenCorrelations.ResumeLayout(false);
            this.pnlLevel2Terms.ResumeLayout(false);
            this.pnlLevel2Terms.PerformLayout();
            this.pnlURLs.ResumeLayout(false);
            this.pnlUrlTerms.ResumeLayout(false);
            this.pnlURL_List.ResumeLayout(false);
            this.pnlURL_List.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion
        private System.Windows.Forms.Panel pnlLeft;
        private System.Windows.Forms.Button cmdRefresh;
        private System.Windows.Forms.Splitter splitter1;
        private System.Windows.Forms.Panel pnlTestMode;
        private System.Windows.Forms.Splitter splitter2;
        private System.Windows.Forms.Panel pnlURLs;
        private System.Windows.Forms.Splitter splitter3;
        private System.Windows.Forms.Panel pnlURL_List;
        private System.Windows.Forms.Button cmdSearchURLs;
        private System.Windows.Forms.ListView lvwUrls;
        private System.Windows.Forms.ColumnHeader columnHeader1;
        private System.Windows.Forms.ColumnHeader columnHeader2;
        private System.Windows.Forms.ColumnHeader columnHeader3;
        private System.Windows.Forms.ColumnHeader columnHeader11;
        private System.Windows.Forms.Panel pnlUrlTerms;
        private System.Windows.Forms.RichTextBox txtInfo;
        private TermList lvwUrlTerms;
        private System.Windows.Forms.ColumnHeader columnHeader4;
        private System.Windows.Forms.ColumnHeader columnHeader5;
        private System.Windows.Forms.ColumnHeader columnHeader6;
        private System.Windows.Forms.ColumnHeader columnHeader7;
        private System.Windows.Forms.ColumnHeader columnHeader21;
        private System.Windows.Forms.ColumnHeader columnHeader14;
        private System.Windows.Forms.ColumnHeader columnHeader13;
        private System.Windows.Forms.ColumnHeader columnHeader12;
        private System.Windows.Forms.ColumnHeader columnHeader15;
        private System.Windows.Forms.ColumnHeader columnHeader18;
        private System.Windows.Forms.ColumnHeader columnHeader19;
        private System.Windows.Forms.ColumnHeader columnHeader20;
        private System.Windows.Forms.ColumnHeader columnHeader8;
        private System.Windows.Forms.Panel pnlDirectGoldenCorrelations;
        private System.Windows.Forms.Splitter splitter5;
        private System.Windows.Forms.ColumnHeader columnHeader9;
        private System.Windows.Forms.ColumnHeader columnHeader10;
        private System.Windows.Forms.Button cmdWalk;
        private System.Windows.Forms.ComboBox cboTop;
        private System.Windows.Forms.Panel pnlLevel2Terms;
        private System.Windows.Forms.Splitter splitter6;
        private System.Windows.Forms.ColumnHeader columnHeader16;
        private System.Windows.Forms.ColumnHeader columnHeader17;
        private System.Windows.Forms.Panel pnlTermTreeAll;
        private System.Windows.Forms.Panel pnlGoldenTree;
        private MmGoldenTree gtGoldTree;
        private System.Windows.Forms.Splitter splitter7;
        private System.Windows.Forms.ComboBox txtUrlSearch;
        private System.Windows.Forms.ColumnHeader columnHeader25;
        private System.Windows.Forms.ColumnHeader columnHeader22;
        private System.Windows.Forms.Label lblWalkInfo;
        private System.Windows.Forms.CheckBox chkUpdateUi;
        private System.Windows.Forms.CheckBox chkExcludeProcessed;
        private System.Windows.Forms.CheckBox chkRndOrder;
        private Controls.WikiGoldenTree wikiGoldTree;
        private System.Windows.Forms.Button cmdGtSearch;
        private System.Windows.Forms.TextBox txtGtSearch;
        private System.Windows.Forms.Button cmdExpandAll;
        private System.Windows.Forms.Label lblTotGtsLoaded;
        private System.Windows.Forms.CheckBox chkExactMatch;
        private System.Windows.Forms.CheckBox chkReprocess;
        private System.Windows.Forms.ColumnHeader columnHeader23;
        private System.Windows.Forms.ColumnHeader columnHeader24;
        private System.Windows.Forms.TextBox txtOut;
        private System.Windows.Forms.Button cmdWalkRndClassify;
        private Controls.ZoomBrowser zoomBrowser1;
        private System.Windows.Forms.CheckBox chkTopicsOnly;
        private Controls.RootPathViewer rootPathViewer1;
        private System.Windows.Forms.Button cmdSearchClear;
        private System.Windows.Forms.TextBox txtTermParents;
        private System.Windows.Forms.TabControl tabTrees;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
        private Controls.TopicTree topicTree1;
        private System.Windows.Forms.Button cmdWalkParallel;
        private System.Windows.Forms.ImageList imageList1;
        private System.Windows.Forms.ColumnHeader columnHeader26;
        private System.Windows.Forms.ColumnHeader columnHeader27;
    }
}

