using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using mm_svc.Discovery;
using mm_svc.Images;
using mm_svc.Terms;
using mmdb_model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tests.Maintenance
{
    [TestClass]
    public class TopicTreeImages
    {
        [TestMethod]
        public void Maintain_TermImages_Test0()
        {
            TelemetryConfiguration.Active.DisableTelemetry = true;
            mm_svc.Maintenance.ImagesTerms.Maintain();
        }
    }
}
