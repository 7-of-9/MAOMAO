namespace wowmao
{
    partial class MmGoldenTree
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
            this.mnuSearchGoogle = new System.Windows.Forms.ToolStripMenuItem();
            this.mnuMatchingUrls = new System.Windows.Forms.ToolStripMenuItem();
            this.findAtL1MenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuSearchGoogle,
            this.mnuMatchingUrls,
            this.findAtL1MenuItem});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(181, 70);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuiCtxName
            // 
            this.mnuSearchGoogle.Name = "mnu0";
            this.mnuSearchGoogle.Size = new System.Drawing.Size(180, 22);
            this.mnuSearchGoogle.Text = "Search Google...";
            this.mnuSearchGoogle.Click += new System.EventHandler(this.mnuSearchGoogle_Click);
            // 
            // toggleGolden1ToolStripMenuItem
            // 
            this.mnuMatchingUrls.Name = "mnu1";
            this.mnuMatchingUrls.Size = new System.Drawing.Size(180, 22);
            this.mnuMatchingUrls.Text = "Find matching URLs...";
            this.mnuMatchingUrls.Click += new System.EventHandler(this.mnuMatchingUrls_Click);
            // 
            // findAtL1MenuItem
            // 
            this.findAtL1MenuItem.Name = "mnu2";
            this.findAtL1MenuItem.Size = new System.Drawing.Size(180, 22);
            this.findAtL1MenuItem.Text = "todo 2";
            this.findAtL1MenuItem.Click += new System.EventHandler(this.mnu2_Click);
            // 
            // TermTree
            // 
            this.LineColor = System.Drawing.Color.Black;
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem mnuSearchGoogle;
        private System.Windows.Forms.ToolStripMenuItem mnuMatchingUrls;
        private System.Windows.Forms.ToolStripMenuItem findAtL1MenuItem;
    }
}
