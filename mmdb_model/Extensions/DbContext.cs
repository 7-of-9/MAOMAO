using mm_global;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
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

        public static int SaveChangesTraceValidationErrors(this DbContext db)
        {
            try
            {
                //return (int)thc.Global.RetryMaxOrThrow(() => db.SaveChanges(), 1, 3); 
                return db.SaveChanges();
            }
            catch (Exception ex)
            {
                return g.HandleOptimisticConcurrencyExceptions(db, ex);
            }
        }
    }
}
