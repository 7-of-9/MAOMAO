namespace wowmao.Controls
{
    partial class RootPathViewer
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
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.panel1 = new System.Windows.Forms.Panel();
            this.txtSearch = new System.Windows.Forms.TextBox();
            this.cmdClear = new System.Windows.Forms.Button();
            this.lblTermInfo = new System.Windows.Forms.Label();
            this.cmdRecalcPathsToRoot = new System.Windows.Forms.Button();
            this.pnkRecalcPtR = new System.Windows.Forms.Panel();
            this.chkPtR_Parallel = new System.Windows.Forms.CheckBox();
            this.txtPATH_MATCH_ABORT = new System.Windows.Forms.TextBox();
            this.lblPATH_MATCH_ABORT = new System.Windows.Forms.Label();
            this.txtSIG_NODE_MAX_PATH_COUNT = new System.Windows.Forms.TextBox();
            this.lblSIG_NODE_MAX_PATH_COUNT = new System.Windows.Forms.Label();
            this.lblSIG_NODE_MIN_NSCOUNT = new System.Windows.Forms.Label();
            this.txtSIG_NODE_MIN_NSCOUNT = new System.Windows.Forms.TextBox();
            this.chkPtR_IncludeSigNodes = new System.Windows.Forms.CheckBox();
            this.cmdPrevPage = new System.Windows.Forms.Button();
            this.cmdNextPage = new System.Windows.Forms.Button();
            this.lblPageInfo = new System.Windows.Forms.Label();
            this.lblPercTopics = new System.Windows.Forms.Label();
            this.pnkRecalcPtR.SuspendLayout();
            this.SuspendLayout();
            // 
            // panel1
            // 
            this.panel1.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.panel1.AutoScroll = true;
            this.panel1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(224)))), ((int)(((byte)(224)))), ((int)(((byte)(224)))));
            this.panel1.Location = new System.Drawing.Point(3, 77);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(780, 238);
            this.panel1.TabIndex = 0;
            // 
            // txtSearch
            // 
            this.txtSearch.Location = new System.Drawing.Point(38, 20);
            this.txtSearch.Name = "txtSearch";
            this.txtSearch.Size = new System.Drawing.Size(143, 21);
            this.txtSearch.TabIndex = 1;
            this.txtSearch.TextChanged += new System.EventHandler(this.txtSearch_TextChanged);
            // 
            // cmdClear
            // 
            this.cmdClear.Location = new System.Drawing.Point(3, 22);
            this.cmdClear.Name = "cmdClear";
            this.cmdClear.Size = new System.Drawing.Size(29, 19);
            this.cmdClear.TabIndex = 2;
            this.cmdClear.Text = "x";
            this.cmdClear.UseVisualStyleBackColor = true;
            this.cmdClear.Click += new System.EventHandler(this.cmdClear_Click);
            // 
            // lblTermInfo
            // 
            this.lblTermInfo.AutoSize = true;
            this.lblTermInfo.Location = new System.Drawing.Point(7, 4);
            this.lblTermInfo.Name = "lblTermInfo";
            this.lblTermInfo.Size = new System.Drawing.Size(16, 13);
            this.lblTermInfo.TabIndex = 3;
            this.lblTermInfo.Text = "...";
            // 
            // cmdRecalcPathsToRoot
            // 
            this.cmdRecalcPathsToRoot.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cmdRecalcPathsToRoot.Location = new System.Drawing.Point(213, 3);
            this.cmdRecalcPathsToRoot.Name = "cmdRecalcPathsToRoot";
            this.cmdRecalcPathsToRoot.Size = new System.Drawing.Size(87, 19);
            this.cmdRecalcPathsToRoot.TabIndex = 5;
            this.cmdRecalcPathsToRoot.Text = "recalc PtR";
            this.cmdRecalcPathsToRoot.UseVisualStyleBackColor = true;
            this.cmdRecalcPathsToRoot.Click += new System.EventHandler(this.cmdRecalcPathsToRoot_Click);
            // 
            // pnkRecalcPtR
            // 
            this.pnkRecalcPtR.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.pnkRecalcPtR.BackColor = System.Drawing.Color.Fuchsia;
            this.pnkRecalcPtR.Controls.Add(this.chkPtR_Parallel);
            this.pnkRecalcPtR.Controls.Add(this.txtPATH_MATCH_ABORT);
            this.pnkRecalcPtR.Controls.Add(this.lblPATH_MATCH_ABORT);
            this.pnkRecalcPtR.Controls.Add(this.txtSIG_NODE_MAX_PATH_COUNT);
            this.pnkRecalcPtR.Controls.Add(this.lblSIG_NODE_MAX_PATH_COUNT);
            this.pnkRecalcPtR.Controls.Add(this.lblSIG_NODE_MIN_NSCOUNT);
            this.pnkRecalcPtR.Controls.Add(this.txtSIG_NODE_MIN_NSCOUNT);
            this.pnkRecalcPtR.Controls.Add(this.chkPtR_IncludeSigNodes);
            this.pnkRecalcPtR.Controls.Add(this.cmdRecalcPathsToRoot);
            this.pnkRecalcPtR.Location = new System.Drawing.Point(481, 2);
            this.pnkRecalcPtR.Name = "pnkRecalcPtR";
            this.pnkRecalcPtR.Size = new System.Drawing.Size(302, 69);
            this.pnkRecalcPtR.TabIndex = 6;
            // 
            // chkPtR_Parallel
            // 
            this.chkPtR_Parallel.AutoSize = true;
            this.chkPtR_Parallel.Location = new System.Drawing.Point(114, 3);
            this.chkPtR_Parallel.Name = "chkPtR_Parallel";
            this.chkPtR_Parallel.Size = new System.Drawing.Size(83, 17);
            this.chkPtR_Parallel.TabIndex = 13;
            this.chkPtR_Parallel.Text = "Run Parallel";
            this.chkPtR_Parallel.UseVisualStyleBackColor = true;
            // 
            // txtPATH_MATCH_ABORT
            // 
            this.txtPATH_MATCH_ABORT.Location = new System.Drawing.Point(272, 37);
            this.txtPATH_MATCH_ABORT.Name = "txtPATH_MATCH_ABORT";
            this.txtPATH_MATCH_ABORT.Size = new System.Drawing.Size(27, 21);
            this.txtPATH_MATCH_ABORT.TabIndex = 12;
            this.txtPATH_MATCH_ABORT.Text = "3";
            // 
            // lblPATH_MATCH_ABORT
            // 
            this.lblPATH_MATCH_ABORT.AutoSize = true;
            this.lblPATH_MATCH_ABORT.Location = new System.Drawing.Point(198, 22);
            this.lblPATH_MATCH_ABORT.Name = "lblPATH_MATCH_ABORT";
            this.lblPATH_MATCH_ABORT.Size = new System.Drawing.Size(101, 13);
            this.lblPATH_MATCH_ABORT.TabIndex = 11;
            this.lblPATH_MATCH_ABORT.Text = "PATH_MATCH_ABORT";
            // 
            // txtSIG_NODE_MAX_PATH_COUNT
            // 
            this.txtSIG_NODE_MAX_PATH_COUNT.Enabled = false;
            this.txtSIG_NODE_MAX_PATH_COUNT.Location = new System.Drawing.Point(151, 40);
            this.txtSIG_NODE_MAX_PATH_COUNT.Name = "txtSIG_NODE_MAX_PATH_COUNT";
            this.txtSIG_NODE_MAX_PATH_COUNT.Size = new System.Drawing.Size(27, 21);
            this.txtSIG_NODE_MAX_PATH_COUNT.TabIndex = 10;
            this.txtSIG_NODE_MAX_PATH_COUNT.Text = "3";
            // 
            // lblSIG_NODE_MAX_PATH_COUNT
            // 
            this.lblSIG_NODE_MAX_PATH_COUNT.AutoSize = true;
            this.lblSIG_NODE_MAX_PATH_COUNT.Location = new System.Drawing.Point(3, 45);
            this.lblSIG_NODE_MAX_PATH_COUNT.Name = "lblSIG_NODE_MAX_PATH_COUNT";
            this.lblSIG_NODE_MAX_PATH_COUNT.Size = new System.Drawing.Size(143, 13);
            this.lblSIG_NODE_MAX_PATH_COUNT.TabIndex = 9;
            this.lblSIG_NODE_MAX_PATH_COUNT.Text = "SIG_NODE_MAX_PATH_COUNT";
            // 
            // lblSIG_NODE_MIN_NSCOUNT
            // 
            this.lblSIG_NODE_MIN_NSCOUNT.AutoSize = true;
            this.lblSIG_NODE_MIN_NSCOUNT.Location = new System.Drawing.Point(3, 22);
            this.lblSIG_NODE_MIN_NSCOUNT.Name = "lblSIG_NODE_MIN_NSCOUNT";
            this.lblSIG_NODE_MIN_NSCOUNT.Size = new System.Drawing.Size(126, 13);
            this.lblSIG_NODE_MIN_NSCOUNT.TabIndex = 8;
            this.lblSIG_NODE_MIN_NSCOUNT.Text = "SIG_NODE_MIN_NSCOUNT";
            // 
            // txtSIG_NODE_MIN_NSCOUNT
            // 
            this.txtSIG_NODE_MIN_NSCOUNT.Enabled = false;
            this.txtSIG_NODE_MIN_NSCOUNT.Location = new System.Drawing.Point(134, 18);
            this.txtSIG_NODE_MIN_NSCOUNT.Name = "txtSIG_NODE_MIN_NSCOUNT";
            this.txtSIG_NODE_MIN_NSCOUNT.Size = new System.Drawing.Size(27, 21);
            this.txtSIG_NODE_MIN_NSCOUNT.TabIndex = 7;
            this.txtSIG_NODE_MIN_NSCOUNT.Text = "5";
            // 
            // chkPtR_IncludeSigNodes
            // 
            this.chkPtR_IncludeSigNodes.AutoSize = true;
            this.chkPtR_IncludeSigNodes.Location = new System.Drawing.Point(9, 3);
            this.chkPtR_IncludeSigNodes.Name = "chkPtR_IncludeSigNodes";
            this.chkPtR_IncludeSigNodes.Size = new System.Drawing.Size(93, 17);
            this.chkPtR_IncludeSigNodes.TabIndex = 6;
            this.chkPtR_IncludeSigNodes.Text = "Inc. Sig. Nodes";
            this.chkPtR_IncludeSigNodes.UseVisualStyleBackColor = true;
            this.chkPtR_IncludeSigNodes.CheckedChanged += new System.EventHandler(this.chkPtR_IncludeSigNodes_CheckedChanged);
            // 
            // cmdPrevPage
            // 
            this.cmdPrevPage.Location = new System.Drawing.Point(4, 52);
            this.cmdPrevPage.Name = "cmdPrevPage";
            this.cmdPrevPage.Size = new System.Drawing.Size(29, 19);
            this.cmdPrevPage.TabIndex = 7;
            this.cmdPrevPage.Text = "<<";
            this.cmdPrevPage.UseVisualStyleBackColor = true;
            this.cmdPrevPage.Click += new System.EventHandler(this.cmdPrevPage_Click);
            // 
            // cmdNextPage
            // 
            this.cmdNextPage.Location = new System.Drawing.Point(152, 52);
            this.cmdNextPage.Name = "cmdNextPage";
            this.cmdNextPage.Size = new System.Drawing.Size(29, 19);
            this.cmdNextPage.TabIndex = 8;
            this.cmdNextPage.Text = ">>";
            this.cmdNextPage.UseVisualStyleBackColor = true;
            this.cmdNextPage.Click += new System.EventHandler(this.cmdNextPage_Click);
            // 
            // lblPageInfo
            // 
            this.lblPageInfo.AutoSize = true;
            this.lblPageInfo.Location = new System.Drawing.Point(77, 55);
            this.lblPageInfo.Name = "lblPageInfo";
            this.lblPageInfo.Size = new System.Drawing.Size(37, 13);
            this.lblPageInfo.TabIndex = 9;
            this.lblPageInfo.Text = "label1";
            this.lblPageInfo.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            // 
            // lblPercTopics
            // 
            this.lblPercTopics.AutoSize = true;
            this.lblPercTopics.Location = new System.Drawing.Point(187, 24);
            this.lblPercTopics.Name = "lblPercTopics";
            this.lblPercTopics.Size = new System.Drawing.Size(16, 13);
            this.lblPercTopics.TabIndex = 10;
            this.lblPercTopics.Text = "...";
            // 
            // RootPathViewer
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoScroll = true;
            this.BackColor = System.Drawing.Color.Pink;
            this.Controls.Add(this.lblPercTopics);
            this.Controls.Add(this.lblPageInfo);
            this.Controls.Add(this.cmdNextPage);
            this.Controls.Add(this.cmdPrevPage);
            this.Controls.Add(this.pnkRecalcPtR);
            this.Controls.Add(this.lblTermInfo);
            this.Controls.Add(this.cmdClear);
            this.Controls.Add(this.txtSearch);
            this.Controls.Add(this.panel1);
            this.DoubleBuffered = true;
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Name = "RootPathViewer";
            this.Size = new System.Drawing.Size(786, 318);
            this.pnkRecalcPtR.ResumeLayout(false);
            this.pnkRecalcPtR.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.TextBox txtSearch;
        private System.Windows.Forms.Button cmdClear;
        private System.Windows.Forms.Label lblTermInfo;
        private System.Windows.Forms.Button cmdRecalcPathsToRoot;
        private System.Windows.Forms.Panel pnkRecalcPtR;
        private System.Windows.Forms.TextBox txtSIG_NODE_MIN_NSCOUNT;
        private System.Windows.Forms.CheckBox chkPtR_IncludeSigNodes;
        private System.Windows.Forms.Label lblSIG_NODE_MIN_NSCOUNT;
        private System.Windows.Forms.Label lblSIG_NODE_MAX_PATH_COUNT;
        private System.Windows.Forms.TextBox txtSIG_NODE_MAX_PATH_COUNT;
        private System.Windows.Forms.Label lblPATH_MATCH_ABORT;
        private System.Windows.Forms.TextBox txtPATH_MATCH_ABORT;
        private System.Windows.Forms.CheckBox chkPtR_Parallel;
        private System.Windows.Forms.Button cmdPrevPage;
        private System.Windows.Forms.Button cmdNextPage;
        private System.Windows.Forms.Label lblPageInfo;
        private System.Windows.Forms.Label lblPercTopics;
    }
}
