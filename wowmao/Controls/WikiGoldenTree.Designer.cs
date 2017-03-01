namespace wowmao.Controls
{
    partial class WikiGoldenTree
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

        #region Component Designer generated code

        /// <summary> 
        /// Required method for Designer support - do not modify 
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.mnuInfo = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuSep1 = new System.Windows.Forms.ToolStripSeparator();
            this.mnuSearchGoogle = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuMatchingUrls = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuToggleTopic = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuFindPathsContaining = new System.Windows.Forms.ToolStripMenuItem();
            this.toolTip1 = new System.Windows.Forms.ToolTip(this.components);
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.toolStripSeparator2 = new System.Windows.Forms.ToolStripSeparator();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuInfo,
            this.mnuSep1,
            this.mnuSearchGoogle,
            this.mnuMatchingUrls,
            this.toolStripSeparator1,
            this.mnuToggleTopic,
            this.toolStripSeparator2,
            this.mnuFindPathsContaining});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(217, 132);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuInfo
            // 
            this.mnuInfo.Enabled = false;
            this.mnuInfo.Name = "mnuInfo";
            this.mnuInfo.Size = new System.Drawing.Size(216, 22);
            this.mnuInfo.Text = "(info)";
            // 
            // mnuSep1
            // 
            this.mnuSep1.Name = "mnuSep1";
            this.mnuSep1.Size = new System.Drawing.Size(213, 6);
            // 
            // mnuSearchGoogle
            // 
            this.mnuSearchGoogle.Name = "mnuSearchGoogle";
            this.mnuSearchGoogle.Size = new System.Drawing.Size(216, 22);
            this.mnuSearchGoogle.Text = "Search Google...";
            this.mnuSearchGoogle.Click += new System.EventHandler(this.mnuSearchGoogle_Click);
            // 
            // mnuMatchingUrls
            // 
            this.mnuMatchingUrls.Name = "mnuMatchingUrls";
            this.mnuMatchingUrls.Size = new System.Drawing.Size(216, 22);
            this.mnuMatchingUrls.Text = "Find matching URLs...";
            // 
            // mnuToggleTopic
            // 
            this.mnuToggleTopic.Name = "mnuToggleTopic";
            this.mnuToggleTopic.Size = new System.Drawing.Size(216, 22);
            this.mnuToggleTopic.Text = "Topic!";
            this.mnuToggleTopic.Click += new System.EventHandler(this.mnuToggleTopic_Click);
            // 
            // mnuFindPathsContaining
            // 
            this.mnuFindPathsContaining.Name = "mnuFindPathsContaining";
            this.mnuFindPathsContaining.Size = new System.Drawing.Size(216, 22);
            this.mnuFindPathsContaining.Text = "View Paths Containing (50)";
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(213, 6);
            // 
            // toolStripSeparator2
            // 
            this.toolStripSeparator2.Name = "toolStripSeparator2";
            this.toolStripSeparator2.Size = new System.Drawing.Size(213, 6);
            // 
            // WikiGoldenTree
            // 
            this.LineColor = System.Drawing.Color.Black;
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem mnuSearchGoogle;
        private System.Windows.Forms.ToolStripMenuItem mnuMatchingUrls;
        private System.Windows.Forms.ToolStripMenuItem mnuInfo;
        private System.Windows.Forms.ToolStripSeparator mnuSep1;
        private System.Windows.Forms.ToolTip toolTip1;
        private System.Windows.Forms.ToolStripMenuItem mnuToggleTopic;
        private System.Windows.Forms.ToolStripMenuItem mnuFindPathsContaining;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator1;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator2;
    }
}
