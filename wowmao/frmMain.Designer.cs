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
            this.lblTotGtsLoaded = new System.Windows.Forms.Label();
            this.cmdExpandAll = new System.Windows.Forms.Button();
            this.cmdGtSearch = new System.Windows.Forms.Button();
            this.txtGtSearch = new System.Windows.Forms.TextBox();
            this.wikiGoldTree = new wowmao.Controls.WikiGoldenTree();
            this.gtGoldTree = new wowmao.MmGoldenTree();
            this.splitter7 = new System.Windows.Forms.Splitter();
            this.pnlTermTreeAll = new System.Windows.Forms.Panel();
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.ttAll = new wowmao.TermTree();
            this.splitter1 = new System.Windows.Forms.Splitter();
            this.pnlTestMode = new System.Windows.Forms.Panel();
            this.splitter5 = new System.Windows.Forms.Splitter();
            this.pnlDirectGoldenCorrelations = new System.Windows.Forms.Panel();
            this.pnlLevel2Terms = new System.Windows.Forms.Panel();
            this.lvwUrlTerms2 = new wowmao.TermList();
            this.splitter6 = new System.Windows.Forms.Splitter();
            this.ttL2Terms = new wowmao.TermTree();
            this.lvwUrlTerms = new wowmao.TermList();
            this.splitter2 = new System.Windows.Forms.Splitter();
            this.pnlURLs = new System.Windows.Forms.Panel();
            this.pnlUrlTerms = new System.Windows.Forms.Panel();
            this.pnlUrlAllTermCorrelations = new System.Windows.Forms.Panel();
            this.label1 = new System.Windows.Forms.Label();
            this.ttUrlTerms = new wowmao.TermTree();
            this.splitter4 = new System.Windows.Forms.Splitter();
            this.txtInfo = new System.Windows.Forms.TextBox();
            this.splitter3 = new System.Windows.Forms.Splitter();
            this.pnlURL_List = new System.Windows.Forms.Panel();
            this.chkExcludeProcessed = new System.Windows.Forms.CheckBox();
            this.chkRndOrder = new System.Windows.Forms.CheckBox();
            this.chkUpdateUi = new System.Windows.Forms.CheckBox();
            this.lblWalkInfo = new System.Windows.Forms.Label();
            this.txtUrlSearch = new System.Windows.Forms.ComboBox();
            this.cboTop = new System.Windows.Forms.ComboBox();
            this.cmdWalk = new System.Windows.Forms.Button();
            this.lvwUrls = new System.Windows.Forms.ListView();
            this.columnHeader10 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader11 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader16 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader17 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader25 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader22 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.cmdSearchURLs = new System.Windows.Forms.Button();
            this.chkSearchWholeWord = new System.Windows.Forms.CheckBox();
            this.pnlLeft.SuspendLayout();
            this.pnlGoldenTree.SuspendLayout();
            this.pnlTermTreeAll.SuspendLayout();
            this.pnlTestMode.SuspendLayout();
            this.pnlDirectGoldenCorrelations.SuspendLayout();
            this.pnlLevel2Terms.SuspendLayout();
            this.pnlURLs.SuspendLayout();
            this.pnlUrlTerms.SuspendLayout();
            this.pnlUrlAllTermCorrelations.SuspendLayout();
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
            this.pnlLeft.Size = new System.Drawing.Size(300, 752);
            this.pnlLeft.TabIndex = 2;
            // 
            // pnlGoldenTree
            // 
            this.pnlGoldenTree.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.pnlGoldenTree.Controls.Add(this.chkSearchWholeWord);
            this.pnlGoldenTree.Controls.Add(this.lblTotGtsLoaded);
            this.pnlGoldenTree.Controls.Add(this.cmdExpandAll);
            this.pnlGoldenTree.Controls.Add(this.cmdGtSearch);
            this.pnlGoldenTree.Controls.Add(this.txtGtSearch);
            this.pnlGoldenTree.Controls.Add(this.wikiGoldTree);
            this.pnlGoldenTree.Controls.Add(this.gtGoldTree);
            this.pnlGoldenTree.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlGoldenTree.Location = new System.Drawing.Point(0, 240);
            this.pnlGoldenTree.Name = "pnlGoldenTree";
            this.pnlGoldenTree.Size = new System.Drawing.Size(300, 512);
            this.pnlGoldenTree.TabIndex = 6;
            // 
            // lblTotGtsLoaded
            // 
            this.lblTotGtsLoaded.AutoSize = true;
            this.lblTotGtsLoaded.Location = new System.Drawing.Point(87, 39);
            this.lblTotGtsLoaded.Name = "lblTotGtsLoaded";
            this.lblTotGtsLoaded.Size = new System.Drawing.Size(45, 13);
            this.lblTotGtsLoaded.TabIndex = 5;
            this.lblTotGtsLoaded.Text = "count ...";
            // 
            // cmdExpandAll
            // 
            this.cmdExpandAll.Location = new System.Drawing.Point(7, 35);
            this.cmdExpandAll.Name = "cmdExpandAll";
            this.cmdExpandAll.Size = new System.Drawing.Size(74, 21);
            this.cmdExpandAll.TabIndex = 4;
            this.cmdExpandAll.Text = "get all...";
            this.cmdExpandAll.UseVisualStyleBackColor = true;
            this.cmdExpandAll.Click += new System.EventHandler(this.cmdExpandAll_Click);
            // 
            // cmdGtSearch
            // 
            this.cmdGtSearch.Location = new System.Drawing.Point(7, 8);
            this.cmdGtSearch.Name = "cmdGtSearch";
            this.cmdGtSearch.Size = new System.Drawing.Size(74, 21);
            this.cmdGtSearch.TabIndex = 3;
            this.cmdGtSearch.Text = "Search GTs:";
            this.cmdGtSearch.UseVisualStyleBackColor = true;
            this.cmdGtSearch.Click += new System.EventHandler(this.cmdGtSearch_Click);
            // 
            // txtGtSearch
            // 
            this.txtGtSearch.Location = new System.Drawing.Point(88, 8);
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
            this.wikiGoldTree.Location = new System.Drawing.Point(7, 61);
            this.wikiGoldTree.Name = "wikiGoldTree";
            this.wikiGoldTree.Size = new System.Drawing.Size(287, 445);
            this.wikiGoldTree.TabIndex = 1;
            // 
            // gtGoldTree
            // 
            this.gtGoldTree.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gtGoldTree.BackColor = System.Drawing.SystemColors.HotTrack;
            this.gtGoldTree.Location = new System.Drawing.Point(287, 6);
            this.gtGoldTree.Name = "gtGoldTree";
            this.gtGoldTree.Size = new System.Drawing.Size(10, 23);
            this.gtGoldTree.TabIndex = 0;
            // 
            // splitter7
            // 
            this.splitter7.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter7.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter7.Location = new System.Drawing.Point(0, 234);
            this.splitter7.Name = "splitter7";
            this.splitter7.Size = new System.Drawing.Size(300, 6);
            this.splitter7.TabIndex = 5;
            this.splitter7.TabStop = false;
            // 
            // pnlTermTreeAll
            // 
            this.pnlTermTreeAll.Controls.Add(this.cmdRefresh);
            this.pnlTermTreeAll.Controls.Add(this.ttAll);
            this.pnlTermTreeAll.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlTermTreeAll.Location = new System.Drawing.Point(0, 0);
            this.pnlTermTreeAll.Name = "pnlTermTreeAll";
            this.pnlTermTreeAll.Size = new System.Drawing.Size(300, 234);
            this.pnlTermTreeAll.TabIndex = 4;
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
            // ttAll
            // 
            this.ttAll.AllowDrop = true;
            this.ttAll.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ttAll.Location = new System.Drawing.Point(3, 23);
            this.ttAll.Name = "ttAll";
            this.ttAll.Size = new System.Drawing.Size(294, 208);
            this.ttAll.TabIndex = 3;
            // 
            // splitter1
            // 
            this.splitter1.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter1.Location = new System.Drawing.Point(300, 0);
            this.splitter1.Name = "splitter1";
            this.splitter1.Size = new System.Drawing.Size(6, 752);
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
            this.pnlTestMode.Location = new System.Drawing.Point(306, 0);
            this.pnlTestMode.Name = "pnlTestMode";
            this.pnlTestMode.Size = new System.Drawing.Size(1122, 752);
            this.pnlTestMode.TabIndex = 4;
            // 
            // splitter5
            // 
            this.splitter5.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter5.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter5.Location = new System.Drawing.Point(0, 511);
            this.splitter5.Name = "splitter5";
            this.splitter5.Size = new System.Drawing.Size(1122, 6);
            this.splitter5.TabIndex = 10;
            this.splitter5.TabStop = false;
            // 
            // pnlDirectGoldenCorrelations
            // 
            this.pnlDirectGoldenCorrelations.Controls.Add(this.pnlLevel2Terms);
            this.pnlDirectGoldenCorrelations.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlDirectGoldenCorrelations.Location = new System.Drawing.Point(0, 511);
            this.pnlDirectGoldenCorrelations.Name = "pnlDirectGoldenCorrelations";
            this.pnlDirectGoldenCorrelations.Size = new System.Drawing.Size(1122, 241);
            this.pnlDirectGoldenCorrelations.TabIndex = 9;
            // 
            // pnlLevel2Terms
            // 
            this.pnlLevel2Terms.Controls.Add(this.lvwUrlTerms2);
            this.pnlLevel2Terms.Controls.Add(this.splitter6);
            this.pnlLevel2Terms.Controls.Add(this.ttL2Terms);
            this.pnlLevel2Terms.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlLevel2Terms.Location = new System.Drawing.Point(0, 0);
            this.pnlLevel2Terms.Name = "pnlLevel2Terms";
            this.pnlLevel2Terms.Size = new System.Drawing.Size(1122, 241);
            this.pnlLevel2Terms.TabIndex = 10;
            // 
            // lvwUrlTerms2
            // 
            this.lvwUrlTerms2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.lvwUrlTerms2.FullRowSelect = true;
            this.lvwUrlTerms2.HideSelection = false;
            this.lvwUrlTerms2.Location = new System.Drawing.Point(406, 0);
            this.lvwUrlTerms2.Name = "lvwUrlTerms2";
            this.lvwUrlTerms2.Size = new System.Drawing.Size(716, 241);
            this.lvwUrlTerms2.TabIndex = 11;
            this.lvwUrlTerms2.UseCompatibleStateImageBehavior = false;
            this.lvwUrlTerms2.View = System.Windows.Forms.View.Details;
            // 
            // splitter6
            // 
            this.splitter6.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter6.Location = new System.Drawing.Point(400, 0);
            this.splitter6.Name = "splitter6";
            this.splitter6.Size = new System.Drawing.Size(6, 241);
            this.splitter6.TabIndex = 10;
            this.splitter6.TabStop = false;
            // 
            // ttL2Terms
            // 
            this.ttL2Terms.AllowDrop = true;
            this.ttL2Terms.Dock = System.Windows.Forms.DockStyle.Left;
            this.ttL2Terms.Location = new System.Drawing.Point(0, 0);
            this.ttL2Terms.Name = "ttL2Terms";
            this.ttL2Terms.Size = new System.Drawing.Size(400, 241);
            this.ttL2Terms.TabIndex = 9;
            // 
            // lvwUrlTerms
            // 
            this.lvwUrlTerms.Dock = System.Windows.Forms.DockStyle.Top;
            this.lvwUrlTerms.FullRowSelect = true;
            this.lvwUrlTerms.HideSelection = false;
            this.lvwUrlTerms.Location = new System.Drawing.Point(0, 356);
            this.lvwUrlTerms.Name = "lvwUrlTerms";
            this.lvwUrlTerms.Size = new System.Drawing.Size(1122, 155);
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
            this.splitter2.Size = new System.Drawing.Size(1122, 6);
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
            this.pnlURLs.Size = new System.Drawing.Size(1122, 350);
            this.pnlURLs.TabIndex = 0;
            // 
            // pnlUrlTerms
            // 
            this.pnlUrlTerms.BackColor = System.Drawing.Color.Yellow;
            this.pnlUrlTerms.Controls.Add(this.pnlUrlAllTermCorrelations);
            this.pnlUrlTerms.Controls.Add(this.splitter4);
            this.pnlUrlTerms.Controls.Add(this.txtInfo);
            this.pnlUrlTerms.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlUrlTerms.Location = new System.Drawing.Point(1006, 0);
            this.pnlUrlTerms.Name = "pnlUrlTerms";
            this.pnlUrlTerms.Size = new System.Drawing.Size(116, 350);
            this.pnlUrlTerms.TabIndex = 6;
            // 
            // pnlUrlAllTermCorrelations
            // 
            this.pnlUrlAllTermCorrelations.Controls.Add(this.label1);
            this.pnlUrlAllTermCorrelations.Controls.Add(this.ttUrlTerms);
            this.pnlUrlAllTermCorrelations.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlUrlAllTermCorrelations.Location = new System.Drawing.Point(0, 106);
            this.pnlUrlAllTermCorrelations.Name = "pnlUrlAllTermCorrelations";
            this.pnlUrlAllTermCorrelations.Size = new System.Drawing.Size(116, 244);
            this.pnlUrlAllTermCorrelations.TabIndex = 9;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(3, 9);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(128, 13);
            this.label1.TabIndex = 0;
            this.label1.Text = "All URL-Term Correlations:";
            // 
            // ttUrlTerms
            // 
            this.ttUrlTerms.AllowDrop = true;
            this.ttUrlTerms.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ttUrlTerms.Location = new System.Drawing.Point(6, 25);
            this.ttUrlTerms.Name = "ttUrlTerms";
            this.ttUrlTerms.Size = new System.Drawing.Size(105, 214);
            this.ttUrlTerms.TabIndex = 8;
            // 
            // splitter4
            // 
            this.splitter4.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter4.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter4.Location = new System.Drawing.Point(0, 100);
            this.splitter4.Name = "splitter4";
            this.splitter4.Size = new System.Drawing.Size(116, 6);
            this.splitter4.TabIndex = 7;
            this.splitter4.TabStop = false;
            // 
            // txtInfo
            // 
            this.txtInfo.Dock = System.Windows.Forms.DockStyle.Top;
            this.txtInfo.Font = new System.Drawing.Font("Calibri", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtInfo.Location = new System.Drawing.Point(0, 0);
            this.txtInfo.Multiline = true;
            this.txtInfo.Name = "txtInfo";
            this.txtInfo.Size = new System.Drawing.Size(116, 100);
            this.txtInfo.TabIndex = 6;
            // 
            // splitter3
            // 
            this.splitter3.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter3.Location = new System.Drawing.Point(1000, 0);
            this.splitter3.Name = "splitter3";
            this.splitter3.Size = new System.Drawing.Size(6, 350);
            this.splitter3.TabIndex = 4;
            this.splitter3.TabStop = false;
            // 
            // pnlURL_List
            // 
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
            this.pnlURL_List.Size = new System.Drawing.Size(1000, 350);
            this.pnlURL_List.TabIndex = 1;
            // 
            // chkExcludeProcessed
            // 
            this.chkExcludeProcessed.AutoSize = true;
            this.chkExcludeProcessed.Checked = true;
            this.chkExcludeProcessed.CheckState = System.Windows.Forms.CheckState.Checked;
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
            this.chkRndOrder.Checked = true;
            this.chkRndOrder.CheckState = System.Windows.Forms.CheckState.Checked;
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
            this.chkUpdateUi.Location = new System.Drawing.Point(617, 5);
            this.chkUpdateUi.Name = "chkUpdateUi";
            this.chkUpdateUi.Size = new System.Drawing.Size(72, 17);
            this.chkUpdateUi.TabIndex = 10;
            this.chkUpdateUi.Text = "update UI";
            this.chkUpdateUi.UseVisualStyleBackColor = true;
            // 
            // lblWalkInfo
            // 
            this.lblWalkInfo.AutoSize = true;
            this.lblWalkInfo.Location = new System.Drawing.Point(704, 8);
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
            this.txtUrlSearch.Location = new System.Drawing.Point(419, 2);
            this.txtUrlSearch.Name = "txtUrlSearch";
            this.txtUrlSearch.Size = new System.Drawing.Size(181, 21);
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
            this.cboTop.Location = new System.Drawing.Point(142, 1);
            this.cboTop.Name = "cboTop";
            this.cboTop.Size = new System.Drawing.Size(79, 21);
            this.cboTop.TabIndex = 7;
            // 
            // cmdWalk
            // 
            this.cmdWalk.Location = new System.Drawing.Point(89, 3);
            this.cmdWalk.Name = "cmdWalk";
            this.cmdWalk.Size = new System.Drawing.Size(52, 19);
            this.cmdWalk.TabIndex = 6;
            this.cmdWalk.Text = "walk...";
            this.cmdWalk.UseVisualStyleBackColor = true;
            this.cmdWalk.Click += new System.EventHandler(this.cmdWalk_Click);
            // 
            // lvwUrls
            // 
            this.lvwUrls.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lvwUrls.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader10,
            this.columnHeader1,
            this.columnHeader2,
            this.columnHeader3,
            this.columnHeader11,
            this.columnHeader16,
            this.columnHeader17,
            this.columnHeader25,
            this.columnHeader22});
            this.lvwUrls.FullRowSelect = true;
            this.lvwUrls.GridLines = true;
            this.lvwUrls.HideSelection = false;
            this.lvwUrls.Location = new System.Drawing.Point(3, 23);
            this.lvwUrls.MultiSelect = false;
            this.lvwUrls.Name = "lvwUrls";
            this.lvwUrls.Size = new System.Drawing.Size(997, 325);
            this.lvwUrls.TabIndex = 5;
            this.lvwUrls.UseCompatibleStateImageBehavior = false;
            this.lvwUrls.View = System.Windows.Forms.View.Details;
            this.lvwUrls.SelectedIndexChanged += new System.EventHandler(this.lvwUrls_SelectedIndexChanged);
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
            // cmdSearchURLs
            // 
            this.cmdSearchURLs.Location = new System.Drawing.Point(3, 3);
            this.cmdSearchURLs.Name = "cmdSearchURLs";
            this.cmdSearchURLs.Size = new System.Drawing.Size(84, 19);
            this.cmdSearchURLs.TabIndex = 3;
            this.cmdSearchURLs.Text = "Search meta:";
            this.cmdSearchURLs.UseVisualStyleBackColor = true;
            this.cmdSearchURLs.Click += new System.EventHandler(this.cmdSearchURLs_Click);
            // 
            // chkSearchWholeWord
            // 
            this.chkSearchWholeWord.AutoSize = true;
            this.chkSearchWholeWord.Checked = true;
            this.chkSearchWholeWord.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chkSearchWholeWord.Location = new System.Drawing.Point(211, 10);
            this.chkSearchWholeWord.Name = "chkSearchWholeWord";
            this.chkSearchWholeWord.Size = new System.Drawing.Size(81, 17);
            this.chkSearchWholeWord.TabIndex = 6;
            this.chkSearchWholeWord.Text = "whole word";
            this.chkSearchWholeWord.UseVisualStyleBackColor = true;
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1428, 752);
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
            this.pnlGoldenTree.PerformLayout();
            this.pnlTermTreeAll.ResumeLayout(false);
            this.pnlTestMode.ResumeLayout(false);
            this.pnlDirectGoldenCorrelations.ResumeLayout(false);
            this.pnlLevel2Terms.ResumeLayout(false);
            this.pnlURLs.ResumeLayout(false);
            this.pnlUrlTerms.ResumeLayout(false);
            this.pnlUrlTerms.PerformLayout();
            this.pnlUrlAllTermCorrelations.ResumeLayout(false);
            this.pnlUrlAllTermCorrelations.PerformLayout();
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
        private TermTree ttAll;
        private System.Windows.Forms.Panel pnlUrlTerms;
        private System.Windows.Forms.Splitter splitter4;
        private System.Windows.Forms.TextBox txtInfo;
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
        private TermTree ttUrlTerms;
        private System.Windows.Forms.ColumnHeader columnHeader8;
        private System.Windows.Forms.Panel pnlUrlAllTermCorrelations;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Panel pnlDirectGoldenCorrelations;
        private TermTree ttL2Terms;
        private System.Windows.Forms.Splitter splitter5;
        private System.Windows.Forms.ColumnHeader columnHeader9;
        private System.Windows.Forms.ColumnHeader columnHeader10;
        private System.Windows.Forms.Button cmdWalk;
        private System.Windows.Forms.ComboBox cboTop;
        private System.Windows.Forms.Panel pnlLevel2Terms;
        private System.Windows.Forms.Splitter splitter6;
        private TermList lvwUrlTerms2;
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
        private System.Windows.Forms.CheckBox chkSearchWholeWord;
    }
}

