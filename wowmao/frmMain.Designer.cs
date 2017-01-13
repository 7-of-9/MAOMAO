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
            this.pnlTermTree = new System.Windows.Forms.Panel();
            this.ttAll = new wowmao.TermTree();
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.splitter1 = new System.Windows.Forms.Splitter();
            this.pnlTestMode = new System.Windows.Forms.Panel();
            this.splitter5 = new System.Windows.Forms.Splitter();
            this.pnlDirectGoldenCorrelations = new System.Windows.Forms.Panel();
            this.panel1 = new System.Windows.Forms.Panel();
            this.splitter6 = new System.Windows.Forms.Splitter();
            this.ttDirectGoldens = new wowmao.TermTree();
            this.lblDirectGoldenCorrelations = new System.Windows.Forms.Label();
            this.lvwUrlTerms = new System.Windows.Forms.ListView();
            this.columnHeader9 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader8 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader12 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader4 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader5 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader6 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader7 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader21 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader14 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader13 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader15 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader18 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader19 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader20 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
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
            this.cboTop = new System.Windows.Forms.ComboBox();
            this.cmdWalk = new System.Windows.Forms.Button();
            this.lvwUrls = new System.Windows.Forms.ListView();
            this.columnHeader10 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader11 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.txtURLSearch = new System.Windows.Forms.TextBox();
            this.cmdSearchURLs = new System.Windows.Forms.Button();
            this.termList1 = new wowmao.TermList();
            this.pnlTermTree.SuspendLayout();
            this.pnlTestMode.SuspendLayout();
            this.pnlDirectGoldenCorrelations.SuspendLayout();
            this.panel1.SuspendLayout();
            this.pnlURLs.SuspendLayout();
            this.pnlUrlTerms.SuspendLayout();
            this.pnlUrlAllTermCorrelations.SuspendLayout();
            this.pnlURL_List.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlTermTree
            // 
            this.pnlTermTree.Controls.Add(this.ttAll);
            this.pnlTermTree.Controls.Add(this.cmdRefresh);
            this.pnlTermTree.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlTermTree.Location = new System.Drawing.Point(0, 0);
            this.pnlTermTree.Name = "pnlTermTree";
            this.pnlTermTree.Size = new System.Drawing.Size(532, 761);
            this.pnlTermTree.TabIndex = 2;
            // 
            // ttAll
            // 
            this.ttAll.AllowDrop = true;
            this.ttAll.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ttAll.Location = new System.Drawing.Point(3, 25);
            this.ttAll.Name = "ttAll";
            this.ttAll.Size = new System.Drawing.Size(529, 733);
            this.ttAll.TabIndex = 3;
            // 
            // cmdRefresh
            // 
            this.cmdRefresh.Location = new System.Drawing.Point(3, 3);
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
            this.splitter1.Location = new System.Drawing.Point(532, 0);
            this.splitter1.Name = "splitter1";
            this.splitter1.Size = new System.Drawing.Size(6, 761);
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
            this.pnlTestMode.Location = new System.Drawing.Point(538, 0);
            this.pnlTestMode.Name = "pnlTestMode";
            this.pnlTestMode.Size = new System.Drawing.Size(774, 761);
            this.pnlTestMode.TabIndex = 4;
            // 
            // splitter5
            // 
            this.splitter5.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter5.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter5.Location = new System.Drawing.Point(0, 611);
            this.splitter5.Name = "splitter5";
            this.splitter5.Size = new System.Drawing.Size(774, 6);
            this.splitter5.TabIndex = 10;
            this.splitter5.TabStop = false;
            // 
            // pnlDirectGoldenCorrelations
            // 
            this.pnlDirectGoldenCorrelations.Controls.Add(this.panel1);
            this.pnlDirectGoldenCorrelations.Controls.Add(this.lblDirectGoldenCorrelations);
            this.pnlDirectGoldenCorrelations.Location = new System.Drawing.Point(0, 611);
            this.pnlDirectGoldenCorrelations.Name = "pnlDirectGoldenCorrelations";
            this.pnlDirectGoldenCorrelations.Size = new System.Drawing.Size(774, 150);
            this.pnlDirectGoldenCorrelations.TabIndex = 9;
            // 
            // panel1
            // 
            this.panel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.panel1.Controls.Add(this.termList1);
            this.panel1.Controls.Add(this.splitter6);
            this.panel1.Controls.Add(this.ttDirectGoldens);
            this.panel1.Location = new System.Drawing.Point(8, 24);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(757, 117);
            this.panel1.TabIndex = 10;
            // 
            // splitter6
            // 
            this.splitter6.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter6.Location = new System.Drawing.Point(301, 0);
            this.splitter6.Name = "splitter6";
            this.splitter6.Size = new System.Drawing.Size(6, 117);
            this.splitter6.TabIndex = 10;
            this.splitter6.TabStop = false;
            // 
            // ttDirectGoldens
            // 
            this.ttDirectGoldens.AllowDrop = true;
            this.ttDirectGoldens.Dock = System.Windows.Forms.DockStyle.Left;
            this.ttDirectGoldens.Location = new System.Drawing.Point(0, 0);
            this.ttDirectGoldens.Name = "ttDirectGoldens";
            this.ttDirectGoldens.Size = new System.Drawing.Size(301, 117);
            this.ttDirectGoldens.TabIndex = 9;
            // 
            // lblDirectGoldenCorrelations
            // 
            this.lblDirectGoldenCorrelations.AutoSize = true;
            this.lblDirectGoldenCorrelations.Location = new System.Drawing.Point(5, 8);
            this.lblDirectGoldenCorrelations.Name = "lblDirectGoldenCorrelations";
            this.lblDirectGoldenCorrelations.Size = new System.Drawing.Size(166, 13);
            this.lblDirectGoldenCorrelations.TabIndex = 1;
            this.lblDirectGoldenCorrelations.Text = "Directly Correlated Golden Terms:";
            // 
            // lvwUrlTerms
            // 
            this.lvwUrlTerms.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader9,
            this.columnHeader8,
            this.columnHeader12,
            this.columnHeader4,
            this.columnHeader5,
            this.columnHeader6,
            this.columnHeader7,
            this.columnHeader21,
            this.columnHeader14,
            this.columnHeader13,
            this.columnHeader15,
            this.columnHeader18,
            this.columnHeader19,
            this.columnHeader20});
            this.lvwUrlTerms.Dock = System.Windows.Forms.DockStyle.Top;
            this.lvwUrlTerms.FullRowSelect = true;
            this.lvwUrlTerms.HideSelection = false;
            this.lvwUrlTerms.Location = new System.Drawing.Point(0, 356);
            this.lvwUrlTerms.Name = "lvwUrlTerms";
            this.lvwUrlTerms.Size = new System.Drawing.Size(774, 255);
            this.lvwUrlTerms.TabIndex = 8;
            this.lvwUrlTerms.UseCompatibleStateImageBehavior = false;
            this.lvwUrlTerms.View = System.Windows.Forms.View.Details;
            this.lvwUrlTerms.SelectedIndexChanged += new System.EventHandler(this.lvwUrlTerms_SelectedIndexChanged);
            // 
            // columnHeader9
            // 
            this.columnHeader9.Text = "dir-gold";
            // 
            // columnHeader8
            // 
            this.columnHeader8.Text = "corr-gold";
            // 
            // columnHeader12
            // 
            this.columnHeader12.Text = "*TSS";
            // 
            // columnHeader4
            // 
            this.columnHeader4.Text = "name";
            // 
            // columnHeader5
            // 
            this.columnHeader5.Text = "term_type";
            this.columnHeader5.Width = 72;
            // 
            // columnHeader6
            // 
            this.columnHeader6.Text = "entity_type";
            this.columnHeader6.Width = 87;
            // 
            // columnHeader7
            // 
            this.columnHeader7.Text = "term_occurs_#";
            this.columnHeader7.Width = 93;
            // 
            // columnHeader21
            // 
            this.columnHeader21.Text = "S";
            // 
            // columnHeader14
            // 
            this.columnHeader14.Text = "appears_count";
            // 
            // columnHeader13
            // 
            this.columnHeader13.Text = "reasons";
            // 
            // columnHeader15
            // 
            this.columnHeader15.Text = "words_X_title";
            // 
            // columnHeader18
            // 
            this.columnHeader18.Text = "words_X_desc";
            // 
            // columnHeader19
            // 
            this.columnHeader19.Text = "words_X_title_stemmed";
            // 
            // columnHeader20
            // 
            this.columnHeader20.Text = "words_X_desc_stemmed";
            // 
            // splitter2
            // 
            this.splitter2.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter2.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter2.Location = new System.Drawing.Point(0, 350);
            this.splitter2.Name = "splitter2";
            this.splitter2.Size = new System.Drawing.Size(774, 6);
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
            this.pnlURLs.Size = new System.Drawing.Size(774, 350);
            this.pnlURLs.TabIndex = 0;
            // 
            // pnlUrlTerms
            // 
            this.pnlUrlTerms.BackColor = System.Drawing.Color.Yellow;
            this.pnlUrlTerms.Controls.Add(this.pnlUrlAllTermCorrelations);
            this.pnlUrlTerms.Controls.Add(this.splitter4);
            this.pnlUrlTerms.Controls.Add(this.txtInfo);
            this.pnlUrlTerms.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlUrlTerms.Location = new System.Drawing.Point(353, 0);
            this.pnlUrlTerms.Name = "pnlUrlTerms";
            this.pnlUrlTerms.Size = new System.Drawing.Size(421, 350);
            this.pnlUrlTerms.TabIndex = 6;
            // 
            // pnlUrlAllTermCorrelations
            // 
            this.pnlUrlAllTermCorrelations.Controls.Add(this.label1);
            this.pnlUrlAllTermCorrelations.Controls.Add(this.ttUrlTerms);
            this.pnlUrlAllTermCorrelations.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlUrlAllTermCorrelations.Location = new System.Drawing.Point(0, 106);
            this.pnlUrlAllTermCorrelations.Name = "pnlUrlAllTermCorrelations";
            this.pnlUrlAllTermCorrelations.Size = new System.Drawing.Size(421, 244);
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
            this.ttUrlTerms.Size = new System.Drawing.Size(410, 214);
            this.ttUrlTerms.TabIndex = 8;
            // 
            // splitter4
            // 
            this.splitter4.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter4.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter4.Location = new System.Drawing.Point(0, 100);
            this.splitter4.Name = "splitter4";
            this.splitter4.Size = new System.Drawing.Size(421, 6);
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
            this.txtInfo.Size = new System.Drawing.Size(421, 100);
            this.txtInfo.TabIndex = 6;
            // 
            // splitter3
            // 
            this.splitter3.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter3.Location = new System.Drawing.Point(347, 0);
            this.splitter3.Name = "splitter3";
            this.splitter3.Size = new System.Drawing.Size(6, 350);
            this.splitter3.TabIndex = 4;
            this.splitter3.TabStop = false;
            // 
            // pnlURL_List
            // 
            this.pnlURL_List.Controls.Add(this.cboTop);
            this.pnlURL_List.Controls.Add(this.cmdWalk);
            this.pnlURL_List.Controls.Add(this.lvwUrls);
            this.pnlURL_List.Controls.Add(this.txtURLSearch);
            this.pnlURL_List.Controls.Add(this.cmdSearchURLs);
            this.pnlURL_List.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlURL_List.Location = new System.Drawing.Point(0, 0);
            this.pnlURL_List.Name = "pnlURL_List";
            this.pnlURL_List.Size = new System.Drawing.Size(347, 350);
            this.pnlURL_List.TabIndex = 1;
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
            this.columnHeader11});
            this.lvwUrls.FullRowSelect = true;
            this.lvwUrls.GridLines = true;
            this.lvwUrls.HideSelection = false;
            this.lvwUrls.Location = new System.Drawing.Point(3, 25);
            this.lvwUrls.MultiSelect = false;
            this.lvwUrls.Name = "lvwUrls";
            this.lvwUrls.Size = new System.Drawing.Size(344, 325);
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
            this.columnHeader11.Text = "MM_CAT";
            this.columnHeader11.Width = 296;
            // 
            // txtURLSearch
            // 
            this.txtURLSearch.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtURLSearch.Location = new System.Drawing.Point(227, 1);
            this.txtURLSearch.Name = "txtURLSearch";
            this.txtURLSearch.Size = new System.Drawing.Size(117, 21);
            this.txtURLSearch.TabIndex = 4;
            this.txtURLSearch.Text = "chess";
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
            // termList1
            // 
            this.termList1.FullRowSelect = true;
            this.termList1.HideSelection = false;
            this.termList1.Location = new System.Drawing.Point(345, 3);
            this.termList1.Name = "termList1";
            this.termList1.Size = new System.Drawing.Size(352, 111);
            this.termList1.TabIndex = 11;
            this.termList1.UseCompatibleStateImageBehavior = false;
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1312, 761);
            this.Controls.Add(this.pnlTestMode);
            this.Controls.Add(this.splitter1);
            this.Controls.Add(this.pnlTermTree);
            this.DoubleBuffered = true;
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "frmMain";
            this.Text = "wowmao";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.pnlTermTree.ResumeLayout(false);
            this.pnlTestMode.ResumeLayout(false);
            this.pnlDirectGoldenCorrelations.ResumeLayout(false);
            this.pnlDirectGoldenCorrelations.PerformLayout();
            this.panel1.ResumeLayout(false);
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
        private System.Windows.Forms.Panel pnlTermTree;
        private System.Windows.Forms.Button cmdRefresh;
        private System.Windows.Forms.Splitter splitter1;
        private System.Windows.Forms.Panel pnlTestMode;
        private System.Windows.Forms.Splitter splitter2;
        private System.Windows.Forms.Panel pnlURLs;
        private System.Windows.Forms.Splitter splitter3;
        private System.Windows.Forms.Panel pnlURL_List;
        private System.Windows.Forms.TextBox txtURLSearch;
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
        private System.Windows.Forms.ListView lvwUrlTerms;
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
        private TermTree ttDirectGoldens;
        private System.Windows.Forms.Label lblDirectGoldenCorrelations;
        private System.Windows.Forms.Splitter splitter5;
        private System.Windows.Forms.ColumnHeader columnHeader9;
        private System.Windows.Forms.ColumnHeader columnHeader10;
        private System.Windows.Forms.Button cmdWalk;
        private System.Windows.Forms.ComboBox cboTop;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Splitter splitter6;
        private TermList termList1;
    }
}

