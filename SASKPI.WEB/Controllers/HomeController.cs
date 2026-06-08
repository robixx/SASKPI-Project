using Microsoft.AspNetCore.Mvc;
using SASKPI.WEB.Models;
using System.Diagnostics;

namespace SASKPI.WEB.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult CoreTerminal()
        {
            ViewData["Title"] = "Core Terminal";
            return View();
        }

        public IActionResult ServiceFolders()
        {
            ViewData["Title"] = "Service Folders";
            return View();
        }

        public IActionResult BillingsMatrix()
        {
            ViewData["Title"] = "Billings Matrix";
            return View();
        }

        public IActionResult ParameterTuner()
        {
            ViewData["Title"] = "Parameter Tuner";
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
