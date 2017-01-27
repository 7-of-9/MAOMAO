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
            this.toolTip1 = new System.Windows.Forms.ToolTip(this.components);
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuInfo,
            this.mnuSep1,
            this.mnuSearchGoogle,
            this.mnuMatchingUrls});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(190, 76);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuInfo
            // 
            this.mnuInfo.Enabled = false;
            this.mnuInfo.Name = "mnuInfo";
            this.mnuInfo.Size = new System.Drawing.Size(189, 22);
            this.mnuInfo.Text = "(info)";
            // 
            // mnuSep1
            // 
            this.mnuSep1.Name = "mnuSep1";
            this.mnuSep1.Size = new System.Drawing.Size(186, 6);
            // 
            // mnuSearchGoogle
            // 
            this.mnuSearchGoogle.Name = "mnuSearchGoogle";
            this.mnuSearchGoogle.Size = new System.Drawing.Size(189, 22);
            this.mnuSearchGoogle.Text = "Search Google...";
            // 
            // mnuMatchingUrls
            // 
            this.mnuMatchingUrls.Name = "mnuMatchingUrls";
            this.mnuMatchingUrls.Size = new System.Drawing.Size(189, 22);
            this.mnuMatchingUrls.Text = "Find matching URLs...";
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
    }
}
