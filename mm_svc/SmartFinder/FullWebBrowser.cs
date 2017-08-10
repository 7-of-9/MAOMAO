using mm_global;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace mm_svc.SmartFinder
{
    public class FullWebBrowser
    {
        private static string lockObj = "42";

        private string navUrl;
        private string lastDocComplete_Url;
        private string lastDocComplete_Html;
        private string lastDocComplete_Title;
        //private Stopwatch sw;

        [DllImport("wininet.dll", SetLastError = true)]
        private static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int lpdwBufferLength);
        private const int INTERNET_OPTION_END_BROWSER_SESSION = 42;

        private WebBrowser wb;
        private bool abortWait = false;

        /// <summary>
        /// Follows redirects using headless WinForms.WebBrowser; returns last redirected document HTML and browser URL after waiting a resonable time
        /// for all redirects to be completed. Identifies & ignores child frameset navigation events.
        /// </summary>
        /// <param name="url"></param>
        /// <param name="finalUrl"></param>
        /// <returns></returns>
        public void GetFinalHtml(string navUrl, out string finalUrl, out string finalHtml, out string finalTitle)
        {
            finalUrl = finalHtml = finalTitle = null;
            this.navUrl = navUrl;

            var th = new Thread(() => {
                using (wb = new WebBrowser()) {
                    //wb.Navigated += Wb_Navigated;
                    wb.DocumentCompleted += Wb_DocumentCompleted;
                    wb.ScriptErrorsSuppressed = true;

                    //lock (RedirectFollower.lockObj) {
                    // http://stackoverflow.com/questions/434469/how-to-clear-system-windows-forms-webbrowser-session-data
                    //wb.Document.ExecCommand("ClearAuthenticationCache", false, null);
                    //try {
                    InternetSetOption(IntPtr.Zero, INTERNET_OPTION_END_BROWSER_SESSION, IntPtr.Zero, 0);
                    //}
                    //catch(Exception ex) {
                    //    Debug.WriteLine($"{ex.Message}");
                    //}
                    lock (lockObj) {
                        Application.ThreadException += Application_ThreadException;
                        //Debug.WriteLine($"NAV: {this.navUrl}");
                        wb.Navigate(this.navUrl);
                    }

                    //Application.Run(); // blocking!! code below not running

                    try {
                        while (!abortWait) {
                            Application.DoEvents();
                            if (!string.IsNullOrEmpty(wb.DocumentTitle)) {
                                g.LogLine($"docTitle={wb.DocumentTitle}");
                                Thread.Sleep(1000);
                                Application.DoEvents();
                                lastDocComplete_Url = wb.Url?.ToString();
                                lastDocComplete_Html = wb.DocumentText;
                                lastDocComplete_Title = wb.DocumentTitle;
                                //g.LogLine($"lastDocComplete_Url={lastDocComplete_Url} / lastDocComplete_Html={lastDocComplete_Html} lastDocComplete_Title={lastDocComplete_Title}");
                                abortWait = true;
                            }
                            Thread.Sleep(100);
                        }

                        //g.LogLine("wb thread: Application.ExitThread...");
                        Application.ExitThread(); //**

                        //g.LogLine("wb thread: wb.Dispose...");
                        wb.Dispose(); //**
                    }
                    catch (Exception ex) {
                        g.LogException(ex);
                    }
                }
            });
            th.SetApartmentState(ApartmentState.STA);
            th.Start();
            var sw2 = new Stopwatch(); sw2.Start();
            while (th.IsAlive) { // (th.ThreadState != System.Threading.ThreadState.Stopped) {// || th.ThreadState == System.Threading.ThreadState.Suspended) {
                //g.LogLine($"th.ThreadState={th.ThreadState}");
                //g.LogLine($"th.IsAlive={th.IsAlive}");
                Thread.Sleep(100);
                if (sw2.ElapsedMilliseconds > 1000 * 15) {
                    g.LogWarn($"FORCE aborting STA thread (waited too long)");
                    break;
                }
            }
            try {
                //g.LogLine("setting abortWait...");
                this.abortWait = true;
                Thread.Sleep(100);

                //g.LogLine("disposing webbrowser...");
                //wb.Dispose(); //**
                Thread.Sleep(100);

                //g.LogLine("aborting wb thread...");
                th.Abort(); //**
                Thread.Sleep(100);
            }
            catch (Exception ex) {
                g.LogException(ex);
            }

            finalUrl = this.lastDocComplete_Url;
            finalHtml = this.lastDocComplete_Html;
            finalTitle = this.lastDocComplete_Title;
        }

        private void Application_ThreadException(object sender, ThreadExceptionEventArgs e)
        {
            var ex = e.Exception;
            var exMsg = ex != null ? ex.Message : "ex==null";
            g.LogError($"*** Application_ThreadException ### Exception={ex?.ToString()} ex={exMsg}");
            Trace.Flush();
            if (ex != null)
                g.LogLine(g.LogAllExceptionsAndStack(ex));
            Trace.Flush();
            //Environment.Exit(1);
        }

        private void Wb_DocumentCompleted(object sender, WebBrowserDocumentCompletedEventArgs e)
        {
            //lock (lockObj) {
            try {
                //g.LogLine($"Wb_DocumentCompleted: .Url.AbsolutePath={e.Url.AbsolutePath} / e.Url.AbsolutePath={e.Url.AbsolutePath} / (sender as WebBrowser).Url.AbsolutePath={(sender as WebBrowser).Url.AbsolutePath}");
        
                //var wb = sender as WebBrowser;
                //if (wb == null || e == null || e.Url == null)
                //    return;

                if (wb.Document != null)
                    wb.Document.ExecCommand("ClearAuthenticationCache", false, null);
                InternetSetOption(IntPtr.Zero, INTERNET_OPTION_END_BROWSER_SESSION, IntPtr.Zero, 0);

                // if is main frame/page (not child frameset which has document url != browser url)
                if (e.Url.AbsolutePath == wb.Url.AbsolutePath) {
                    lastDocComplete_Url = e.Url.ToString();
                    lastDocComplete_Html = wb.DocumentText;
                    lastDocComplete_Title = wb.DocumentTitle;
                    g.LogInfo($"Wb_DocumentCompleted 2: {lastDocComplete_Url} {lastDocComplete_Title}");// ({sw.ElapsedMilliseconds} ms)");
                }
            }
            catch (Exception ex) {
                g.LogException(ex);
            }
            //}
        }

        //private void Wb_Navigated(object sender, System.Windows.Forms.WebBrowserNavigatedEventArgs e)
        //{
        //    Debug.WriteLine($"Wb_Navigated: e.Url={e.Url.ToString()} / e.Url.AbsolutePath={e.Url.AbsolutePath} / (sender as WebBrowser).Url.AbsolutePath={(sender as WebBrowser).Url.AbsolutePath}");

        //    //if (e.Url.AbsolutePath == (sender as WebBrowser).Url.AbsolutePath)
        //    //    Debug.WriteLine($"Wb_Navigated: {e.Url.ToString()}");
        //}
    }
}

