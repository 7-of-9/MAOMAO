using mm_global;
using mm_global.Extensions;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public static class dbContextExtensions
    {
        public static ObjectContext ObjectContext(this DbContext db)
        {
            return (db as IObjectContextAdapter).ObjectContext;
        }

        public static bool SaveChanges_IgnoreDupeKeyEx(this DbContext db, string info = null)
        {
            try
            {
                db.SaveChanges();
                return true;
            }
            //catch (DbEntityValidationException avex)
            //{
            //    Trace.WriteLine(avex.ToDetailedString());
            //    return g.HandleOptimisticConcurrencyExceptions(db, avex) > 0;
            //}
            catch (SqlException sqlex)
            {
                if (sqlex.Message.Contains("Cannot insert duplicate key"))
                {
                    //Trace.WriteLine($"ignoring dupe key insert 1 ({info})");
                    return false;
                }
                else
                    throw;
            }
            catch (DbUpdateException dbex)
            {
                Trace.WriteLine(g.LogAllExceptionsAndStack(dbex));
                Trace.Flush();

                if (dbex.InnerException != null && dbex.InnerException.InnerException != null &&
                    (dbex.InnerException.InnerException.Message.StartsWith("Cannot insert duplicate key")
                    || dbex.InnerException.InnerException.Message.StartsWith("Violation of UNIQUE KEY")
                    || dbex.InnerException.InnerException.Message.StartsWith("The INSERT statement conflicted")
                    )) {
                    return false;
                }
                else
                    throw;
            }
        }

        public static int SaveChangesTraceValidationErrors(this DbContext db)
        {
            //try
            {
                //return (int)thc.Global.RetryMaxOrThrow(() => db.SaveChanges(), 1, 3); 
                return db.SaveChanges();
            }
            //catch (Exception ex)
            //{
            //    return g.HandleOptimisticConcurrencyExceptions(db, ex);
            //}
        }
    }
}
