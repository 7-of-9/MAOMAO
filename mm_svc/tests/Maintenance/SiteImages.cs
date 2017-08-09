using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_global;
using mm_svc.SmartFinder;
using mm_svc.Images;
using mm_svc.Util.Utils;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace test.Maintenance
{
    [TestClass]
    public class SiteImages
    {
        [TestMethod]
        public void Maintain_AwisSiteImages_Test0()
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;
            mm_svc.Maintenance.ImagesSites.Maintain();
        }
    }
}
