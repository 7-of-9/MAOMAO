using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace wowmao
{
    internal class TextBoxTraceListener : TraceListener
    {
        private TextBoxBase output;

        public TextBoxTraceListener(TextBoxBase output)
        {
            this.Name = "TextBoxTraceListener";
            this.output = output;
        }

        public override void Write(string message)
        {

            Action append = delegate () {
                output.AppendText(string.Format("[{0}] ", DateTime.Now.ToString()));
                output.AppendText(message);
            };
            if (output.InvokeRequired)
            {
                output.BeginInvoke(append);
            }
            else
            {
                append();
            }
        }

        public override void WriteLine(string message)
        {
            Write(message + Environment.NewLine);
        }
    }
}
