using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace MaomaoWeb.Controllers
{
    public class ExtensionController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Installed()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }
        
        public IActionResult Error()
        {
            return View();
        }
    }
}
