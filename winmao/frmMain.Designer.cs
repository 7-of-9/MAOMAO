namespace winmao
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frmMain));
            this.pnlOuter = new System.Windows.Forms.Panel();
            this.chkCrunch = new System.Windows.Forms.CheckBox();
            this.pnlInnerBottom = new System.Windows.Forms.Panel();
            this.tvwTermCorr = new System.Windows.Forms.TreeView();
            this.splitter3 = new System.Windows.Forms.Splitter();
            this.lvwUrlTerms = new System.Windows.Forms.ListView();
            this.columnHeader4 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader5 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader6 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader7 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader21 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader14 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader13 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader12 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader15 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader18 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader19 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader20 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.splitter2 = new System.Windows.Forms.Splitter();
            this.txtInfo = new System.Windows.Forms.TextBox();
            this.splitter1 = new System.Windows.Forms.Splitter();
            this.lvwUrls = new System.Windows.Forms.ListView();
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader11 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.pnlOuter.SuspendLayout();
            this.pnlInnerBottom.SuspendLayout();
            this.SuspendLayout();
            // 
            // pnlOuter
            // 
            this.pnlOuter.Controls.Add(this.chkCrunch);
            this.pnlOuter.Controls.Add(this.pnlInnerBottom);
            this.pnlOuter.Controls.Add(this.splitter1);
            this.pnlOuter.Controls.Add(this.lvwUrls);
            this.pnlOuter.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlOuter.Location = new System.Drawing.Point(0, 0);
            this.pnlOuter.Name = "pnlOuter";
            this.pnlOuter.Size = new System.Drawing.Size(1312, 658);
            this.pnlOuter.TabIndex = 0;
            // 
            // chkCrunch
            // 
            this.chkCrunch.AutoSize = true;
            this.chkCrunch.Checked = true;
            this.chkCrunch.CheckState = System.Windows.Forms.CheckState.Checked;
            this.chkCrunch.Location = new System.Drawing.Point(199, 6);
            this.chkCrunch.Name = "chkCrunch";
            this.chkCrunch.Size = new System.Drawing.Size(58, 17);
            this.chkCrunch.TabIndex = 5;
            this.chkCrunch.Text = "crunch";
            this.chkCrunch.UseVisualStyleBackColor = true;
            this.chkCrunch.CheckedChanged += new System.EventHandler(this.chkCrunch_CheckedChanged);
            // 
            // pnlInnerBottom
            // 
            this.pnlInnerBottom.BackColor = System.Drawing.SystemColors.ActiveCaption;
            this.pnlInnerBottom.Controls.Add(this.tvwTermCorr);
            this.pnlInnerBottom.Controls.Add(this.splitter3);
            this.pnlInnerBottom.Controls.Add(this.lvwUrlTerms);
            this.pnlInnerBottom.Controls.Add(this.splitter2);
            this.pnlInnerBottom.Controls.Add(this.txtInfo);
            this.pnlInnerBottom.Dock = System.Windows.Forms.DockStyle.Fill;
            this.pnlInnerBottom.Location = new System.Drawing.Point(606, 0);
            this.pnlInnerBottom.Name = "pnlInnerBottom";
            this.pnlInnerBottom.Size = new System.Drawing.Size(706, 658);
            this.pnlInnerBottom.TabIndex = 3;
            // 
            // tvwTermCorr
            // 
            this.tvwTermCorr.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tvwTermCorr.Location = new System.Drawing.Point(0, 367);
            this.tvwTermCorr.Name = "tvwTermCorr";
            this.tvwTermCorr.Size = new System.Drawing.Size(706, 291);
            this.tvwTermCorr.TabIndex = 9;
            this.tvwTermCorr.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.tvwTermCorr_AfterSelect);
            // 
            // splitter3
            // 
            this.splitter3.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter3.Location = new System.Drawing.Point(0, 361);
            this.splitter3.Name = "splitter3";
            this.splitter3.Size = new System.Drawing.Size(706, 6);
            this.splitter3.TabIndex = 8;
            this.splitter3.TabStop = false;
            // 
            // lvwUrlTerms
            // 
            this.lvwUrlTerms.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader4,
            this.columnHeader5,
            this.columnHeader6,
            this.columnHeader7,
            this.columnHeader21,
            this.columnHeader14,
            this.columnHeader13,
            this.columnHeader12,
            this.columnHeader15,
            this.columnHeader18,
            this.columnHeader19,
            this.columnHeader20});
            this.lvwUrlTerms.Dock = System.Windows.Forms.DockStyle.Top;
            this.lvwUrlTerms.FullRowSelect = true;
            this.lvwUrlTerms.HideSelection = false;
            this.lvwUrlTerms.Location = new System.Drawing.Point(0, 106);
            this.lvwUrlTerms.Name = "lvwUrlTerms";
            this.lvwUrlTerms.Size = new System.Drawing.Size(706, 255);
            this.lvwUrlTerms.TabIndex = 7;
            this.lvwUrlTerms.UseCompatibleStateImageBehavior = false;
            this.lvwUrlTerms.View = System.Windows.Forms.View.Details;
            this.lvwUrlTerms.SelectedIndexChanged += new System.EventHandler(this.lvwUrlTerms_SelectedIndexChanged);
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
            this.columnHeader14.DisplayIndex = 7;
            this.columnHeader14.Text = "appears_count";
            // 
            // columnHeader13
            // 
            this.columnHeader13.Text = "reasons";
            // 
            // columnHeader12
            // 
            this.columnHeader12.DisplayIndex = 5;
            this.columnHeader12.Text = "*TSS";
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
            this.splitter2.Dock = System.Windows.Forms.DockStyle.Top;
            this.splitter2.Location = new System.Drawing.Point(0, 100);
            this.splitter2.Name = "splitter2";
            this.splitter2.Size = new System.Drawing.Size(706, 6);
            this.splitter2.TabIndex = 4;
            this.splitter2.TabStop = false;
            // 
            // txtInfo
            // 
            this.txtInfo.Dock = System.Windows.Forms.DockStyle.Top;
            this.txtInfo.Font = new System.Drawing.Font("Calibri", 11.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtInfo.Location = new System.Drawing.Point(0, 0);
            this.txtInfo.Multiline = true;
            this.txtInfo.Name = "txtInfo";
            this.txtInfo.Size = new System.Drawing.Size(706, 100);
            this.txtInfo.TabIndex = 3;
            // 
            // splitter1
            // 
            this.splitter1.Location = new System.Drawing.Point(600, 0);
            this.splitter1.Name = "splitter1";
            this.splitter1.Size = new System.Drawing.Size(6, 658);
            this.splitter1.TabIndex = 1;
            this.splitter1.TabStop = false;
            // 
            // lvwUrls
            // 
            this.lvwUrls.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader1,
            this.columnHeader2,
            this.columnHeader3,
            this.columnHeader11});
            this.lvwUrls.Dock = System.Windows.Forms.DockStyle.Left;
            this.lvwUrls.FullRowSelect = true;
            this.lvwUrls.GridLines = true;
            this.lvwUrls.HideSelection = false;
            this.lvwUrls.Location = new System.Drawing.Point(0, 0);
            this.lvwUrls.MultiSelect = false;
            this.lvwUrls.Name = "lvwUrls";
            this.lvwUrls.Size = new System.Drawing.Size(600, 658);
            this.lvwUrls.TabIndex = 0;
            this.lvwUrls.UseCompatibleStateImageBehavior = false;
            this.lvwUrls.View = System.Windows.Forms.View.Details;
            this.lvwUrls.SelectedIndexChanged += new System.EventHandler(this.lvwUrls_SelectedIndexChanged);
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
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1312, 658);
            this.Controls.Add(this.pnlOuter);
            this.DoubleBuffered = true;
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "frmMain";
            this.Text = "winmao";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.pnlOuter.ResumeLayout(false);
            this.pnlOuter.PerformLayout();
            this.pnlInnerBottom.ResumeLayout(false);
            this.pnlInnerBottom.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Panel pnlOuter;
        private System.Windows.Forms.Splitter splitter1;
        private System.Windows.Forms.ListView lvwUrls;
        private System.Windows.Forms.ColumnHeader columnHeader1;
        private System.Windows.Forms.ColumnHeader columnHeader2;
        private System.Windows.Forms.Panel pnlInnerBottom;
        private System.Windows.Forms.Splitter splitter2;
        private System.Windows.Forms.TextBox txtInfo;
        private System.Windows.Forms.ColumnHeader columnHeader3;
        private System.Windows.Forms.TreeView tvwTermCorr;
        private System.Windows.Forms.Splitter splitter3;
        private System.Windows.Forms.ListView lvwUrlTerms;
        private System.Windows.Forms.ColumnHeader columnHeader4;
        private System.Windows.Forms.ColumnHeader columnHeader5;
        private System.Windows.Forms.ColumnHeader columnHeader6;
        private System.Windows.Forms.ColumnHeader columnHeader7;
        private System.Windows.Forms.ColumnHeader columnHeader11;
        private System.Windows.Forms.ColumnHeader columnHeader14;
        private System.Windows.Forms.ColumnHeader columnHeader13;
        private System.Windows.Forms.ColumnHeader columnHeader12;
        private System.Windows.Forms.ColumnHeader columnHeader15;
        private System.Windows.Forms.ColumnHeader columnHeader18;
        private System.Windows.Forms.ColumnHeader columnHeader19;
        private System.Windows.Forms.ColumnHeader columnHeader20;
        private System.Windows.Forms.ColumnHeader columnHeader21;
        private System.Windows.Forms.CheckBox chkCrunch;
    }
}

