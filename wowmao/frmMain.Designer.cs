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
            this.addRootTermToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.contextMenuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tvw
            // 
            this.tvw.CheckBoxes = true;
            this.tvw.ContextMenuStrip = this.contextMenuStrip1;
            this.tvw.Location = new System.Drawing.Point(12, 12);
            this.tvw.Name = "tvw";
            this.tvw.Size = new System.Drawing.Size(557, 462);
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
            this.addRootTermToolStripMenuItem});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(155, 26);
            // 
            // addRootTermToolStripMenuItem
            // 
            this.addRootTermToolStripMenuItem.Name = "addRootTermToolStripMenuItem";
            this.addRootTermToolStripMenuItem.Size = new System.Drawing.Size(154, 22);
            this.addRootTermToolStripMenuItem.Text = "Add Root Term";
            this.addRootTermToolStripMenuItem.Click += new System.EventHandler(this.addRootTermToolStripMenuItem_Click);
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
        private System.Windows.Forms.ToolStripMenuItem addRootTermToolStripMenuItem;
    }
}

