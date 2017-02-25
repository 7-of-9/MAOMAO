using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using static mm_svc.Terms.GoldenPaths;
using mmdb_model;
using mm_global.Extensions;
using System.Runtime.InteropServices;

namespace wowmao.Controls
{
    public partial class RootPathViewer : UserControl
    {
        private List<Label> all_labels;

        //
        // next -- need to systematically get to to 100-200 evenly spread topics
        //
        //         will need an overall topic viewer for that; 
        //          can this viewer/data structure hold or calculate topic DISTANCES? we know this
        //          would be v. useful for the binary classifier...
        //  
        //  url_terms' paths to roots will then contain a number of topics
        //   topic distances from leaf terms (& repititions of topcis) will give standardized topic(s) for URLs
        //
        // url_set_classifier -> can now revisit 
        //
        [DllImport("user32.dll")]
        public static extern int SendMessage(IntPtr hWnd, Int32 wMsg, bool wParam, Int32 lParam);
        private const int WM_SETREDRAW = 11;

        public event EventHandler<OnTopicToggledEventArgs> OnTopicToggled = delegate { };
        public class OnTopicToggledEventArgs : EventArgs { public string term_name { get; set; } }

        public RootPathViewer()
        {
            InitializeComponent();
        }

        private void txtSearch_TextChanged(object sender, EventArgs e)
        {
            var s = txtSearch.Text.ltrim();
            this.SuspendLayout();
            SuspendDrawing(this);
            this.Cursor = Cursors.WaitCursor;
            int x = 0;
            foreach (var path_panel in this.panel1.Controls) {
                var panel = (path_panel as Panel);
                panel.SuspendLayout();

                var show = false;
                foreach (var obj in panel.Controls)
                    if ((obj as Label).Text.ltrim().Contains(s) || string.IsNullOrEmpty(s)) { show = true; break; }
                if (show) {
                    panel.Visible = true;
                    panel.Height = 20;
                    panel.Location = new Point(0, (++x) * panel.Height);
                    foreach (var term_label in (path_panel as Panel).Controls) {
                        var label = term_label as Label;
                        var tp = label.Tag as TermPath;

                        bool highlight = tp.t.name.ltrim().Contains(s);
                        if (!string.IsNullOrEmpty(s) )
                            FormatLabel(label, tp.t, highlight);
                        else
                            FormatLabel(label, tp.t);
                    }
                }
                else {
                    panel.Visible = false;
                    panel.Height = 0;
                }

                //foreach (var term_label in (path_panel as Panel).Controls) {
                //    var label = term_label as Label;
                //    var tp = label.Tag as TermPath;

                //    bool highlight = s.Length > 3 && tp.t.name.ltrim().Contains(s);
                //    //if (highlight)
                //    //    any_highlighed = true;

                //    if (!string.IsNullOrEmpty(s) && s.Length > 3)
                //        FormatLabel(label, tp.t, highlight);
                //    else
                //        FormatLabel(label, tp.t);
                //}
                //(path_panel as Panel).ResumeLayout();

                //(path_panel as Panel).Visible = string.IsNullOrEmpty(s) || any_highlighed;
                //if ((path_panel as Panel).Visible)
                //    (path_panel as Panel).Height = 20;
                //else
                //    (path_panel as Panel).Height = 0;
            }
            ResumeDrawing(this);
            this.ResumeLayout();
            this.Cursor = Cursors.Default;
        }

        public void AddTermPaths(List<List<TermPath>> paths)
        {
            var colors = Enum.GetNames(typeof(KnownColor));

            this.panel1.Controls.Clear();
            this.SuspendLayout();
            SuspendDrawing(this);
            this.panel1.SuspendLayout();
            all_labels = new List<Label>();
            var x = 0;
            var panels = new List<Panel>();
            if (paths != null) {
                foreach (var path in paths) {
                    var path_panel = new Panel() { BackColor = Color.Transparent, BorderStyle = BorderStyle.None, Height = 20 };
                    path_panel.Location = new Point(0, (++x) * path_panel.Height);
                    path_panel.AutoSize = true;
                    panels.Add(path_panel);

                    var i = 0;
                    var term_labels = new List<Label>();
                    foreach (var tp in path) {
                        double perc = Math.Max((double)i++ / path.Count, 0.1);
                        var term_label = new Label() {
                            Text = $" {tp.t.name} tt={tp.t.term_type_id} #NS={tp.t.wiki_nscount}",
                            BackColor = ColorFromString(tp.t.name),
                            Tag = tp,
                            Dock = DockStyle.Right,
                            Height = 20
                        };
                        term_label.TextAlign = ContentAlignment.MiddleCenter;
                        term_label.AutoSize = true;
                        FormatLabel(term_label, tp.t);
                        term_label.Click += Term_label_Click;
                        term_labels.Add(term_label);
                        all_labels.Add(term_label);
                    }
                    path_panel.Controls.AddRange(term_labels.ToArray());
                }
            }
            this.panel1.Controls.AddRange(panels.ToArray());
            this.panel1.ResumeLayout();
            ResumeDrawing(this);
            this.ResumeLayout();
        }

        private void FormatLabel(Label l, term t, bool? highlight = null)
        {
            l.SuspendLayout();
            if (highlight != null) {
                if (highlight == true) {
                    l.BorderStyle = BorderStyle.Fixed3D;
                    l.BackColor = Color.Blue;
                    l.ForeColor = Color.White;
                    l.Visible = true;
                }
                else {
                    l.BorderStyle = BorderStyle.FixedSingle;
                    l.BackColor = Color.Gray;
                    l.ForeColor = Color.White;
                    l.Visible = false;
                }
            }
            else {
                l.Visible = true;
                if (t.IS_TOPIC == true) {
                    l.Font = new Font("Courier", 10, FontStyle.Bold);
                    l.BorderStyle = BorderStyle.FixedSingle;
                    l.BackColor = ColorFromString(t.name);
                    l.ForeColor = InvertColor(l.BackColor);
                }
                else {
                    l.Font = new Font("Courier", 9, FontStyle.Regular);
                    l.BorderStyle = BorderStyle.FixedSingle;
                    l.ForeColor = Color.Gray; // Color.FromArgb(100, ColorFromString(t.name));
                    l.BackColor = Color.White;
                }
            }
            l.ResumeLayout();
        }

        private void Term_label_Click(object sender, EventArgs e)
        {
            var tp = (sender as Label).Tag as TermPath;
            var new_topic_flag = false;
            if (tp.t.is_topic == null || tp.t.is_topic == false)
                new_topic_flag = true;
            else
                new_topic_flag = false;

            var a = all_labels.Where(p => (p.Tag as TermPath).t.name == tp.t.name).ToList();
            a.ForEach(p => {
                var tp2 = p.Tag as TermPath;
                tp2.t.is_topic = new_topic_flag;
                FormatLabel((p), tp2.t);
            });

            using (var db = mm02Entities.Create()) {
                var terms = db.terms.Where(p => p.name == tp.t.name && (p.term_type_id == (int)mm_global.g.TT.WIKI_NS_0 || p.term_type_id == (int)mm_global.g.TT.WIKI_NS_14));
                foreach (var term in terms.ToListNoLock()) {
                    term.is_topic = tp.t.is_topic;
                    db.SaveChangesTraceValidationErrors();
                }
            }

            OnTopicToggled?.Invoke(this.GetType(), new OnTopicToggledEventArgs() { term_name = tp.t.name });
        }

        public static Color ColorFromString(string s) { return Color.FromArgb(s.GetHashCode()); }
        public static Color InvertColor(Color c)
        {
            //Color invertedColor = Color.FromArgb(
            //255 - c.R,
            //255 - c.G,
            //255 - c.B);
            //return invertedColor;

            var avg = (c.R + c.G + c.G) / 255.0;
            if (avg > 100) return Color.Black;
            else return Color.White;
        }

        private void SuspendDrawing(Control parent)
        {
            SendMessage(parent.Handle, WM_SETREDRAW, false, 0);
        }

        private void ResumeDrawing(Control parent)
        {
            SendMessage(parent.Handle, WM_SETREDRAW, true, 0);
            parent.Refresh();
        }

        private void cmdClear_Click(object sender, EventArgs e)
        {
            this.txtSearch.Text = "";
        }
    }
}
