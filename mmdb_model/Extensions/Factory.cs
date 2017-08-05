using mm_global;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace mmdb_model
{
    public partial class mm02Entities : DbContext
    {
        public mm02Entities(string conStr) : base(conStr) {}

        public static string con_str = null;

        public static mm02Entities Create(bool log = false)
        {
            string connectionString = con_str == null ? GetDbConnectionString("mm02Entities") : con_str;
            var db = new mm02Entities(connectionString);

            if (Debugger.IsAttached)
                db.Database.CommandTimeout = 120;

            //db.ObjectContext().ContextOptions.ProxyCreationEnabled = false;
            //db.ObjectContext().ContextOptions.LazyLoadingEnabled = false;

            if (log && Debugger.IsAttached)
                db.Database.Log = s => Debug.WriteLine(s);

            //db.Configuration.UseDatabaseNullSemantics = UseDatabaseNullSemantics;
            //db.ObjectContext().ContextOptions.LazyLoadingEnabled = false; // to provide reliable serialization

            if (log)
                g.LogLine("created object-context for main DB [" + db.Database.Connection.Database + "]");

            return db;
        }

        public static string GetDbConnectionString(string configConStrKey)
        {
            //if (RoleEnvironment.IsAvailable)
            //{
            //    return RoleEnvironment.GetConfigurationSettingValue(configConStrKey);
            //}
            //else
            {
                return ConfigurationManager.ConnectionStrings[configConStrKey].ConnectionString;
            }
        }
    }
}
