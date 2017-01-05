using System.Web;
using System.Web.Optimization;

namespace web1
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            //
            // JS
            //
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            // don't know, don't want!
            //bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
            //            "~/Scripts/jquery.validate*"));

            // browser independence?
            //bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
            //            "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                //"~/Scripts/bootstrap.js" // UI library
                //, "~/Scripts/respond.js" // mobile/responsive layout -- probably also useful
            ));

            //
            // Styles
            //
            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/site.css"
            ));
        }
    }
}
