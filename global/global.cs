using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Web;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Data.Entity.Core;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Threading;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using mm_global.Extensions;

namespace mm_global
{
    public  static partial class g
    {
        public static bool is_console = false;
        public static TelemetryClient tel_client = new TelemetryClient();

        private static object log_locker = "42";

        private static ConcurrentDictionary<string, int> errorCounter = new ConcurrentDictionary<string, int>();
        private static ConcurrentDictionary<string, DateTime> errorTimeCounter = new ConcurrentDictionary<string, DateTime>();

        [MethodImpl(MethodImplOptions.NoInlining)]
        public static string LogLine(string s, int frame = 1, bool loggly = false)
        {
            Stopwatch sw = new Stopwatch(); sw.Start();

            if (string.IsNullOrEmpty(s)) return null;

            StackFrame sf = new StackFrame(frame);
            MethodBase mb = sf.GetMethod();
            if (mb == null) // has been seen (in debugger)!!!!
                return null;

            if (mb.Name == "lambda_method") {
                frame = frame - 1;
                sf = new StackFrame(frame);
                mb = sf.GetMethod();
            }

            string methodName = mb.Name + mb.ToString().Substring(mb.ToString().IndexOf('('));
            //bool sendEmail = false;

            var happenTimes = errorCounter.AddOrUpdate(methodName, 1, (key, existingValue) => existingValue + 1);
            var errorTime = errorTimeCounter.GetOrAdd(methodName, DateTime.Now);
            if (DateTime.Now - errorTime > TimeSpan.FromMinutes(30)) {
                //sendEmail = true;
                int result = 0;
                DateTime resultDate = DateTime.Now;
                errorCounter.TryRemove(methodName, out result);
                errorTimeCounter.TryRemove(methodName, out resultDate);
            }

            string build = "";
#if DEBUG
            build = "DEBUG";
#else
            build = "RELEASE";
#endif

            // HttpContext user
            string userStr = " ";
            if (HttpContext.Current != null && HttpContext.Current.User != null && HttpContext.Current.User.Identity != null)
                userStr = "<" + (HttpContext.Current.User.Identity.Name ?? "unknown") + "> ";

            // .exe process name + cmdline
            Process proc = System.Diagnostics.Process.GetCurrentProcess();
            string procName = proc != null ? proc.ProcessName : "";
            string[] cmdLine = null;
            string cmdLineStr = "";
            try { cmdLine = Environment.GetCommandLineArgs(); } catch { }; // yuck -- but this cannot fail!
            if (cmdLine != null && cmdLine.Length > 1)
                cmdLineStr = string.Join(" ", cmdLine.Skip(1));

            string logStr = (!Debugger.IsAttached
                          ? ("MM* {" + System.Environment.MachineName + ":" + procName + ":" + cmdLineStr.TruncateMax(20) + "} [" + build + "] @ " + DateTime.Now.ToString("dd-MMM-yyyy HH:mm:ss.fff") + " (" + (mb.ReflectedType != null ? (mb.ReflectedType.Name + ".") : "???.") + ") ") 
                          : "")
                          + $"[{mb.Name}]"
                          + userStr
                          + s
                          + " [" + sw.ElapsedMilliseconds + "ms]";

            if (s.StartsWith("### (info)") || s.StartsWith("# ")) // info
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.Blue;
                        Console.ForegroundColor = ConsoleColor.White;
                    }

                    Trace.TraceInformation(logStr);
                    //g.tel_client.TrackTrace(logStr, SeverityLevel.Information);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else if (s.StartsWith("###")) // error  
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.Red;
                        Console.ForegroundColor = ConsoleColor.White;
                    }

                    Trace.TraceError(logStr);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else if (s.StartsWith("**") || s.StartsWith("##")) // warning 
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.DarkRed;
                        Console.ForegroundColor = ConsoleColor.White;
                    }

                    Trace.TraceWarning(logStr);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else if (s.StartsWith("*G") || s.StartsWith("#G")) // green
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.Green;
                        Console.ForegroundColor = ConsoleColor.DarkBlue;
                    }

                    Trace.TraceInformation(logStr);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else if (s.StartsWith("*C") || s.StartsWith("#C")) // Cyan
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.Cyan;
                        Console.ForegroundColor = ConsoleColor.Black;
                    }

                    Trace.TraceInformation(logStr);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else if (s.StartsWith("*Y") || s.StartsWith("#Y")) // yellow
            {
                lock (log_locker) {
                    if (is_console) {
                        Console.BackgroundColor = ConsoleColor.DarkYellow;
                        Console.ForegroundColor = ConsoleColor.White;
                    }

                    Trace.TraceInformation(logStr);

                    if (is_console)
                        Console.ResetColor();
                }
                Trace.Flush();
            }
            else
            {
                lock (log_locker) {
                    if (is_console && s.Contains("!!!"))
                        Console.ForegroundColor = ConsoleColor.Red;

                    Trace.WriteLine(logStr); // verbose level, no email
                    //g.tel_client.TrackTrace(logStr, SeverityLevel.Verbose);

                    if (is_console && s.Contains("!!!"))
                        Console.ResetColor();
                }

                Trace.Flush();
            }

            /*
            if (s.StartsWith("###") && sendEmail) // email on ### -- can be for critical errors or email/info monitoring
            {
                // Thread.Start will produce a full foreground thread
                Thread t = new Thread(() =>
                {
                    try
                    {
                        MailSender sender = new MailSender();
                        logStr = "<h3>happened " + happenTimes + " times in last 30 minuets</h3>" + BeautifyLogText(logStr);
                        sender.SendInternalFromLogLine(logStr);
                    }
                    catch (Exception ex)
                    {
                        Trace.WriteLine("FAILED to send internal mail on crit (" + ex.Message + ")");
                    }
                });
                t.Name = "LogLine.SendInternalFromLogLine";
                thc.Global.ForegroundThreads.Add(t);
                t.Start();
            }*/

            return s;
        }

        public static void LogInfo(string msg)
        {
            g.LogLine($"# {msg}");
        }

        public static void LogWarn(string msg)
        {
            g.LogLine($"** {msg}");
        }

        public static void LogError(string msg)
        {
            g.LogLine($"### {msg}");
        }

        public static void LogGreen(string msg)
        {
            g.LogLine($"#G {msg}");
        }

        public static void LogCyan(string msg)
        {
            g.LogLine($"#C {msg}");
        }

        public static void LogYellow(string msg)
        {
            g.LogLine($"#Y {msg}");
        }
        

        public static string LogStack()
        {
            StringBuilder sb = new StringBuilder();
            var trace = new System.Diagnostics.StackTrace();
            if (trace != null)
            {
                StackFrame[] frames = trace.GetFrames();
                if (frames != null)
                {
                    foreach (var frame in frames)
                    {
                        var method = frame.GetMethod();
                        string fileName = frame.GetFileName();
                        int fileLineNumber = frame.GetFileLineNumber();
                        if (method != null)
                        {
                            if (method.Name.Equals("LogStack"))
                                continue;

                            sb.Append(string.Format("{0}::{1}{2} --> ",
                                method.ReflectedType != null ? method.ReflectedType.Name : string.Empty,
                                method.Name,
                                !string.IsNullOrEmpty(fileName) && fileLineNumber != 0 ? (" " + fileName + " line " + fileLineNumber) : ""
                                ));
                        }
                    }
                    return sb.ToString();
                }
            }
            return string.Empty;
        }

        public static void LogException(Exception ex, string traceInfo = null)
        {
            string detail = "";
            detail += "### CRITICAL ex. type=[" + ex.GetType().Name + "]\n\n"
                        + "TRACE_INFO: { " + traceInfo + "}\n"
                        + "INNER_EX_INFO: {" + g.LogAllExceptionsAndStack(ex) + "}\n "
                        + "ENTITY_ERR_INFO: {" + g.LogDbEntityValidationException(ex) + "}\n "
                        + "          STACK: {" + g.LogStack() + "}\n"
                        + "         EX_ALL: {" + g.LogAllExceptionsAndStack(ex) + "}\n"
                        ;

            g.LogLine(detail);
        }

        public static string LogAllExceptionsAndStack(Exception ex)
        {
            if (ex.InnerException != null)
            {
                return ex.Message + " / " + LogDbEntityValidationException(ex) + " / (Exception.StackTrace: " + ex.StackTrace + ") inner exceptions: " + LogAllExceptionsAndStack(ex.InnerException);
            }
            else
            {
                return ex.Message + " / " + LogDbEntityValidationException(ex) + " / (Exception.StackTrace: " + ex.StackTrace + ")";
            }
        }

        public static string LogDbEntityValidationException(Exception ex)
        {
            string traceInfo = "";
            DbEntityValidationException entityEx = ex as DbEntityValidationException;
            if (entityEx != null)
            {
                foreach (var validationErrors in entityEx.EntityValidationErrors)
                {
                    foreach (var validationError in validationErrors.ValidationErrors)
                    {
                        traceInfo += string.Format("prop: {0} error: {1} // ", validationError.PropertyName, validationError.ErrorMessage);
                    }
                }
            }
            return traceInfo;
        }

        public static int HandleOptimisticConcurrencyExceptions(DbContext db, Exception ex, int level = 1)
        {
            return 0;

            // diag
            /*if (ex is DbEntityValidationException)
            {
                LogException(ex);

                DbEntityValidationException entityEx = ex as DbEntityValidationException;
                throw new System.ApplicationException(g.LogDbEntityValidationException(entityEx), ex);
            }

            // explicitly handle OptimisticConcurrencyException
            if (ex is OptimisticConcurrencyException)
            {
                int objectCount = 0;
                OptimisticConcurrencyException conEx = ex as OptimisticConcurrencyException;
                foreach (ObjectStateEntry entry in conEx.StateEntries)
                {
                    if (entry.State != EntityState.Detached && entry.Entity != null)
                    {
                        string traceInfo = g.LogLine("## OptimisticConcurrencyException :: will refresh entity (ClientWins) & re-save object [" + entry.Entity.ToString() + "]... (stack: " + g.LogStack() + ") / " + g.LogAllExceptionsAndStack(ex));

                        (db as IObjectContextAdapter).ObjectContext.Refresh(RefreshMode.ClientWins, entry.Entity);
                        try
                        {
                            objectCount += db.SaveChanges();
                        }
                        catch (Exception ex2)
                        {
                            g.LogLine("## -- failed on SaveChanges after ObjectContext.Refresh: " + ex2.Message);
                            ;
                            //LogException(ex2);
                            //throw ex2;
                        }
                    }
                }
                return objectCount;
            }

            // recurse or throw if reach end of the chain
            if (ex.InnerException != null && level < 10) // shouldn't need this, but have seen OOM in this fn. suggesting infinite recursion??
            {
                return HandleOptimisticConcurrencyExceptions(db, ex.InnerException, ++level);
            }
            else
            {
                throw ex;
            }*/
        }

        public static T RetryMaxOrThrow<T>(Func<T> p, int sleepSeconds = 1, int retryMax = 3, bool verboseErrorLog = true)
        {
            int retryCount = 0;
            int currentSleepSeconds = sleepSeconds;
            for (;;)
            {
                try
                {
                    return p();
                }
                catch (Exception ex)
                {
                    if (verboseErrorLog)
                        Trace.Write("RetryMaxOrThrow: {" + LogAllExceptionsAndStack(ex) + "}... ");

                    // backoff exponentially when the DB is under load
                    if (IsDatabaseLoadRelated(ex))
                    {
                        if (verboseErrorLog)
                            Trace.Write("DB load exception detected, will back off exponentially... stack: [" + g.LogStack() + "] / " + g.LogAllExceptionsAndStack(ex));
                        currentSleepSeconds = Math.Min(currentSleepSeconds * 2, 60 * 10); // cap at max 10 minute wait
                        retryMax = 5;
                    }

                    if (++retryCount == retryMax)
                    {
                        if (verboseErrorLog)
                        {
                            g.LogLine(
                               "### exceeded retry count; throwing: [(type)=" + ex.GetType().Name + ": " + ex.Message + "] " +
                               LogAllExceptionsAndStack(ex) +
                               " stack: [" + g.LogStack() + "]");
                        }

                        throw new System.ApplicationException("exceed retry count: " + ex.Message, ex);
                    }

                    if (verboseErrorLog)
                        Trace.WriteLine("sleep " + currentSleepSeconds + "s...");

                    //#if !DEBUG
                    Thread.Sleep(1000 * currentSleepSeconds);
                    //#endif
                }
            }
        }

        private static bool IsDatabaseLoadRelated(Exception ex)
        {
            if (ex.Message.Contains("The wait operation timed out") ||
                ex.Message.Contains("The timeout period elapsed prior to completion of the operation"))
                return true;
            if (ex.InnerException != null)
                return IsDatabaseLoadRelated(ex.InnerException);
            return false;
        }
    }
}
