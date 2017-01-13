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
            this.cmdRefresh = new System.Windows.Forms.Button();
            this.splitter1 = new System.Windows.Forms.Splitter();
            this.pnlTestMode = new System.Windows.Forms.Panel();
            this.splitter2 = new System.Windows.Forms.Splitter();
            this.pnlURLs = new System.Windows.Forms.Panel();
            this.splitter3 = new System.Windows.Forms.Splitter();
            this.pnlURL_List = new System.Windows.Forms.Panel();
            this.lvwUrls = new System.Windows.Forms.ListView();
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader11 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.txtURLSearch = new System.Windows.Forms.TextBox();
            this.cmdSearchURLs = new System.Windows.Forms.Button();
            this.ttAll = new wowmao.TermTree();
            this.pnlTermTree.SuspendLayout();
            this.pnlTestMode.SuspendLayout();
            this.pnlURLs.SuspendLayout();
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
            this.pnlTermTree.Size = new System.Drawing.Size(532, 658);
            this.pnlTermTree.TabIndex = 2;
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
            this.splitter1.Size = new System.Drawing.Size(6, 658);
            this.splitter1.TabIndex = 3;
            this.splitter1.TabStop = false;
            // 
            // pnlTestMode
            // 
            this.pnlTestMode.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.pnlTestMode.Controls.Add(this.splitter2);
            this.pnlTestMode.Controls.Add(this.pnlURLs);
            this.pnlTestMode.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlTestMode.Location = new System.Drawing.Point(538, 0);
            this.pnlTestMode.Name = "pnlTestMode";
            this.pnlTestMode.Size = new System.Drawing.Size(774, 658);
            this.pnlTestMode.TabIndex = 4;
            // 
            // splitter2
            // 
            this.splitter2.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter2.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter2.Location = new System.Drawing.Point(0, 159);
            this.splitter2.Name = "splitter2";
            this.splitter2.Size = new System.Drawing.Size(774, 6);
            this.splitter2.TabIndex = 4;
            this.splitter2.TabStop = false;
            // 
            // pnlURLs
            // 
            this.pnlURLs.BackColor = System.Drawing.SystemColors.AppWorkspace;
            this.pnlURLs.Controls.Add(this.splitter3);
            this.pnlURLs.Controls.Add(this.pnlURL_List);
            this.pnlURLs.Dock = System.Windows.Forms.DockStyle.Top;
            this.pnlURLs.Location = new System.Drawing.Point(0, 0);
            this.pnlURLs.Name = "pnlURLs";
            this.pnlURLs.Size = new System.Drawing.Size(774, 159);
            this.pnlURLs.TabIndex = 0;
            // 
            // splitter3
            // 
            this.splitter3.BackColor = System.Drawing.SystemColors.ButtonHighlight;
            this.splitter3.Location = new System.Drawing.Point(347, 0);
            this.splitter3.Name = "splitter3";
            this.splitter3.Size = new System.Drawing.Size(6, 159);
            this.splitter3.TabIndex = 4;
            this.splitter3.TabStop = false;
            // 
            // pnlURL_List
            // 
            this.pnlURL_List.Controls.Add(this.lvwUrls);
            this.pnlURL_List.Controls.Add(this.txtURLSearch);
            this.pnlURL_List.Controls.Add(this.cmdSearchURLs);
            this.pnlURL_List.Dock = System.Windows.Forms.DockStyle.Left;
            this.pnlURL_List.Location = new System.Drawing.Point(0, 0);
            this.pnlURL_List.Name = "pnlURL_List";
            this.pnlURL_List.Size = new System.Drawing.Size(347, 159);
            this.pnlURL_List.TabIndex = 1;
            // 
            // lvwUrls
            // 
            this.lvwUrls.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lvwUrls.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
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
            this.lvwUrls.Size = new System.Drawing.Size(344, 134);
            this.lvwUrls.TabIndex = 5;
            this.lvwUrls.UseCompatibleStateImageBehavior = false;
            this.lvwUrls.View = System.Windows.Forms.View.Details;
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
            this.txtURLSearch.Location = new System.Drawing.Point(93, 1);
            this.txtURLSearch.Name = "txtURLSearch";
            this.txtURLSearch.Size = new System.Drawing.Size(251, 21);
            this.txtURLSearch.TabIndex = 4;
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
            // ttAll
            // 
            this.ttAll.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ttAll.Location = new System.Drawing.Point(3, 25);
            this.ttAll.Name = "ttAll";
            this.ttAll.Size = new System.Drawing.Size(529, 630);
            this.ttAll.TabIndex = 3;
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1312, 658);
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
            this.pnlURLs.ResumeLayout(false);
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
    }
}

