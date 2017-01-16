namespace wowmao
{
    partial class TermTree
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
            this.mnuiCtxName = new System.Windows.Forms.ToolStripMenuItem();
            this.toggleGolden1ToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.findAtL1MenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuiCtxName,
            this.toggleGolden1ToolStripMenuItem,
            this.findAtL1MenuItem});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(181, 70);
            this.contextMenuStrip1.Opening += new System.ComponentModel.CancelEventHandler(this.contextMenuStrip1_Opening);
            // 
            // mnuiCtxName
            // 
            this.mnuiCtxName.Name = "mnuiCtxName";
            this.mnuiCtxName.Size = new System.Drawing.Size(180, 22);
            this.mnuiCtxName.Text = "toolStripMenuItem1";
            // 
            // toggleGolden1ToolStripMenuItem
            // 
            this.toggleGolden1ToolStripMenuItem.Name = "toggleGolden1ToolStripMenuItem";
            this.toggleGolden1ToolStripMenuItem.Size = new System.Drawing.Size(180, 22);
            this.toggleGolden1ToolStripMenuItem.Text = "Toggle Golden";
            this.toggleGolden1ToolStripMenuItem.Click += new System.EventHandler(this.addRootTermToolStripMenuItem_Click);
            // 
            // findAtL1MenuItem
            // 
            this.findAtL1MenuItem.Name = "findAtL1MenuItem";
            this.findAtL1MenuItem.Size = new System.Drawing.Size(180, 22);
            this.findAtL1MenuItem.Text = "Find @L1";
            this.findAtL1MenuItem.Click += new System.EventHandler(this.findAtL1_Click);
            // 
            // TermTree
            // 
            this.LineColor = System.Drawing.Color.Black;
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem mnuiCtxName;
        private System.Windows.Forms.ToolStripMenuItem toggleGolden1ToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem findAtL1MenuItem;
    }
}
