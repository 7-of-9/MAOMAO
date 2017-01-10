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
            this.tvw = new System.Windows.Forms.TreeView();
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.mnuiCtxName = new System.Windows.Forms.ToolStripMenuItem();
            this.toggleGolden1ToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.findAtL1MenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tvw
            // 
            this.tvw.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left)));
            this.tvw.CheckBoxes = true;
            this.tvw.ContextMenuStrip = this.contextMenuStrip1;
            this.tvw.Location = new System.Drawing.Point(12, 12);
            this.tvw.Name = "tvw";
            this.tvw.Size = new System.Drawing.Size(1166, 624);
            this.tvw.TabIndex = 0;
            this.tvw.BeforeCheck += new System.Windows.Forms.TreeViewCancelEventHandler(this.tvw_BeforeCheck);
            this.tvw.AfterCheck += new System.Windows.Forms.TreeViewEventHandler(this.tvw_AfterCheck);
            this.tvw.BeforeExpand += new System.Windows.Forms.TreeViewCancelEventHandler(this.tvw_BeforeExpand);
            this.tvw.AfterSelect += new System.Windows.Forms.TreeViewEventHandler(this.tvw_AfterSelect);
            this.tvw.Click += new System.EventHandler(this.tvw_Click);
            this.tvw.MouseClick += new System.Windows.Forms.MouseEventHandler(this.tvw_MouseClick);
            this.tvw.MouseUp += new System.Windows.Forms.MouseEventHandler(this.tvw_MouseUp);
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuiCtxName,
            this.toggleGolden1ToolStripMenuItem,
            this.findAtL1MenuItem});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(181, 92);
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
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1312, 658);
            this.Controls.Add(this.tvw);
            this.DoubleBuffered = true;
            this.Font = new System.Drawing.Font("Calibri", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.Name = "frmMain";
            this.Text = "wowmao";
            this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
            this.contextMenuStrip1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.TreeView tvw;
        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripMenuItem toggleGolden1ToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem mnuiCtxName;
        private System.Windows.Forms.ToolStripMenuItem findAtL1MenuItem;
    }
}

