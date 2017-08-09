using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management;
using System.Reflection;
using System.Threading;
using System.Linq.Expressions;
using Microsoft.ApplicationInsights.Extensibility;
using mm_global;
using mmdb_model;
using mm_global.Extensions;
using System.Windows.Forms;
using mm_svc.SmartFinder;
using System.Net;

namespace mm_jobs
{
    class Program
    {
        const string appName = "mm_jobs";
        static string logDir;
        static string logFullPath;
        static string logTimeStamp;
        static string exeDir;
        static string exeName;
        static string fullArgs;

        static int n_this = 1;
        static int n_of = 1;

        [STAThread]
        static int Main(string[] args)
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;
            Console.OutputEncoding = System.Text.Encoding.UTF8;

            // prevent re-entry
            GetProgramVariables(args);
            bool isSimilarProcessRunning = IsSameProgramAlreadyRunning(args);
            if (isSimilarProcessRunning) {
                g.LogLine(">>> RUNNING PID IS DUPLICATED ON CMDLINE [" + string.Join(",", args.Select(x => x.ToLower().Replace("-", ""))) + "]");
                if (!args.Contains("-Force")) {
                    g.LogLine(">>> ABORTING THIS PROCESS; NOP <<<");
                    return 0;
                }
                else {
                    g.LogLine("(-Force: allowing multiple instances)");
                }
            }
            g.LogLine("(none found, proceeding)");

            // setup
            CreateLogDirectory();
            SetupLogger();

            var ip = new WebClient().DownloadString(@"http://icanhazip.com").Trim();
            g.LogInfo($">> {ip}: RUNNING AS {n_this} OF {n_of}");
            Console.Title = $"{fullArgs} / {n_this} OF {n_of} ({ip})";

            Environment.CurrentDirectory = exeDir; 
            DateTime startupTime = DateTime.Now;
            bool completedWithoutError = true;
            var db = mm02Entities.Create();
            LogJobStartup(db);

            System.AppDomain.CurrentDomain.UnhandledException += UnhandledExceptionTrapper;
            g.LogInfo("Set System.AppDomain.CurrentDomain.UnhandledException OK.");

            Application.ThreadException += Application_ThreadException;
            g.LogInfo("Set Application_ThreadException OK.");

            try {

                // images
                if (args.Contains("-it")) { 
                    g.LogLine("-"); g.LogInfo("terms-images");
                    mm_svc.Maintenance.ImagesTerms.Maintain(n_this, n_of);
                }
                else if (args.Contains("-is")) {
                    g.LogLine("-"); g.LogInfo("sites-images");
                    mm_svc.Maintenance.ImagesSites.Maintain(n_this, n_of);
                }

                // discovery
                else if (args.Contains("-dtt")) {
                    g.LogLine("-"); g.LogInfo("discover-topic-tree");
                    SmartFinder.Find_TopicTree("singapore", "singapore", n_this, n_of);
                }
                else if (args.Contains("-du20")) {
                    g.LogLine("-"); g.LogInfo("discover-user");
                    SmartFinder.Find_UserAllTopics(20);
                }
                else if (args.Contains("-du15")) {
                    g.LogLine("-"); g.LogInfo("discover-user");
                    SmartFinder.Find_UserAllTopics(15);
                }

                if (console_present()) {
                    g.LogInfo($">> all done. Press any key...");
                    Console.ReadKey();
                }
                return 0;
            }
            catch (Exception ex) {
                g.LogError("EXCEPTION MAIN THREAD ### [" + ex.GetType().ToString() + "] " + ex.Message + " ###");
                g.LogError(g.LogAllExceptionsAndStack(ex));
                Trace.Flush();
                completedWithoutError = false;
                return 1;
            }
            finally {
                TimeSpan execTime = DateTime.Now.Subtract(startupTime);

                Trace.Close();
                if (completedWithoutError) {
                    File.Move(logFullPath, logFullPath.Replace("INPROCESS.", "OK.") + "_" + execTime.TotalMinutes.ToString("0") + ".MINS.LOG");
                }
                else {
                    File.Move(logFullPath, logFullPath.Replace("INPROCESS.", "FAILED.") + "_" + execTime.TotalMinutes.ToString("0") + ".MINS.LOG");
                }
            }
        }

        private static bool console_present() {
            try { int window_height = Console.WindowHeight; }
            catch { return false; }
            return true;
        }

        private static void Application_ThreadException(object sender, ThreadExceptionEventArgs e)
        {
            var ex = e.Exception;
            var exMsg = ex != null ? ex.Message : "ex==null";
            g.LogError($"MM_JOBS MAIN Application_ThreadException ### Exception={ex?.ToString()} ex={exMsg}");
            Trace.Flush();
            if (ex != null)
                g.LogException(ex);
            Environment.Exit(1);
        }

        static void UnhandledExceptionTrapper(object sender, UnhandledExceptionEventArgs e)
        {
            var ex = e.ExceptionObject as Exception;
            var exMsg = ex != null ? ex.Message : "ex==null";
            g.LogError($"MM_JOBS MAIN UnhandledExceptionTrapper ### ExceptionObject={e.ExceptionObject.ToString()} ex={exMsg} clrIsTerminating={e.IsTerminating}");
            Trace.Flush();
            if (ex != null)
                g.LogException(ex);
            Environment.Exit(1);
        }

        private static void LogJobStartup(mm02Entities db)
        {
            g.LogLine("***************************************************");
            g.LogLine("*** MM_JOBS STARTUP - (local) " + DateTime.Now.ToString("dd MMM yyyy HH:mm") + " ***");
            g.LogLine("***************************************************");
            g.LogLine("-");
            g.LogLine("this host: " + System.Environment.MachineName);
            g.LogLine("curdir: " + Environment.CurrentDirectory);
            g.LogLine("fullArgs: " + fullArgs);
            g.LogLine("-");
        }

        private static TimeSpan LogEndOfJob(TimeSpan execTime)
        {
            g.LogLine("-");
            g.LogLine("................................................................................");
            g.LogLine("   MM_JOBS FINISHED: @ (local) " + DateTime.Now.ToString("dd MMM yyyy HH:mm") + ", execTime was " + execTime.TotalMinutes.ToString("000.00") + " min(s) ...");
            g.LogLine("          (fullArgs: " + fullArgs + ")");
            g.LogLine("................................................................................");
            g.LogLine("-");
            return execTime;
        }


        private static void GetProgramVariables(string[] args)
        {
            Assembly exe = System.Reflection.Assembly.GetExecutingAssembly();
            string exeLocation = exe.Location;
            exeDir = System.IO.Path.GetDirectoryName(exeLocation);
            exeName = exe.ManifestModule.Name.ToUpper().Replace(".EXE", "");
            fullArgs = string.Concat(args);

            // e.g. mm_jobs-0.exe --> mm_jobs-N.exe 
            if (exeName.ToList().Any(c => char.IsNumber(c))) {
                var nn = exeName.Split('-');
                if (nn.Count() == 2) {
                    n_this = Convert.ToInt32(nn[1].Substring(0));
                    
                    var other_ns = new List<int>();
                    // get min and max N from exe names in dir
                    var mm_jobs = Directory.GetFiles(exeDir, "mm_jobs*.exe");
                    foreach (var mm_job_exe in mm_jobs) {
                        Debug.WriteLine(mm_job_exe);
                        if (mm_job_exe.ToList().Any(c => char.IsNumber(c))) {
                            nn = mm_job_exe.Split('-');
                            if (nn.Count() == 2) {
                                var n = Convert.ToInt32(nn[1].Substring(0, nn[1].IndexOf(".")));
                                other_ns.Add(n);
                            }
                        }
                    }
                    n_of = other_ns.Max();
                    if (n_this > n_of)
                        throw new ApplicationException("n_this > n_of");
                }
            }
        }

        private static void CreateLogDirectory()
        {
            logDir = exeDir + "\\LOG" + fullArgs.Replace(":", "");
            logDir = logDir.Trim(Path.GetInvalidFileNameChars());
            logDir = logDir.Trim(Path.GetInvalidPathChars());
            logDir = logDir.TruncateMax(150);// windows limitation - yay
            if (!Directory.Exists(logDir)) {
                Directory.CreateDirectory(logDir);
            }
        }

        private static void SetupLogger()
        {
            logTimeStamp = DateTime.Now.ToFileTime().ToString();
            logFullPath = logDir + "\\INPROCESS.start." + DateTime.Now.ToString("dd.MMM.HH.mm") + "_" + exeName + "." + /*fullArgs + "." +*/ logTimeStamp + ".log";
            TextWriterTraceListener twtl = new TextWriterTraceListener(logFullPath);
            Trace.Listeners.Add(twtl);
            TextWriterTraceListener twtl2 = new TextWriterTraceListener(Console.Out);
            Trace.Listeners.Add(twtl2);
            Trace.AutoFlush = true;
            g.is_console = true;
        }

        private static bool IsSameProgramAlreadyRunning(string[] args)
        {
            Process thisProcess = Process.GetCurrentProcess();
            g.LogInfo("prevent re-entrancy: scanning for already-running process name [" + exeName + "]...");
            foreach (Process p in Process.GetProcesses()) {
                //g.LogLine($"running process {p.ProcessName}");

                if (p.ProcessName.ToUpper() == exeName && p.Id != thisProcess.Id) {
                    g.LogInfo($"\t>> matching process {p.ProcessName} >>");

                    // allow multi-instance as long as the cmdlines don't clash
                    string externalProcessDuplicateCmdLine = null;
                    using (var mos = new ManagementObjectSearcher("SELECT CommandLine FROM Win32_Process WHERE ProcessId = " + p.Id.ToString())) {
                        using (var moc = mos.Get()) {
                            foreach (var mo in moc) {
                                string otherCmdLine = (string)mo["CommandLine"];
                                if (!string.IsNullOrEmpty(otherCmdLine)) {
                                    string[] ss = otherCmdLine.Split('-');
                                    var thisArgsJoined = string.Join(" ", args).Replace("-", "");
                                    foreach (string s in ss.Select(x => x.ToLower()).Where(x => x != "force")) {
                                        g.LogLine($"\t>> matching process {p.ProcessName}: this.args={thisArgsJoined} other.arg={s} >>");
                                        if (args.Select(x => x.ToLower().Replace("-", "").Replace(" ", "")).Contains(s) || thisArgsJoined.ToLower() == s.ToLower()) {
                                            g.LogWarn(">>> duplicate PID " + p.Id + " running for " + DateTime.Now.Subtract(p.StartTime).Minutes + " min(s), dupe'd on arg [" + s + "] !");
                                            externalProcessDuplicateCmdLine = s;
                                            return true;
                                        }
                                    }
                                }
                                else g.LogError($"\t>> matching process {p.ProcessName}: other.args == null.");
                            }
                        }
                    }
                }
            }
            return false;
        }
    }
}
