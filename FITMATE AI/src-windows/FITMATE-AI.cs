using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Diagnostics;
using System.Windows.Forms;

namespace FitmateAI {
    public class Program {
        private static HttpListener listener;
        private static string appDir;
        private static int port;

        [STAThread]
        public static void Main(string[] args) {
            try {
                // Determine application root directory
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                if (Directory.Exists(Path.Combine(exeDir, "app"))) {
                    appDir = Path.Combine(exeDir, "app");
                } else if (File.Exists(Path.Combine(exeDir, "index.html"))) {
                    appDir = exeDir;
                } else {
                    appDir = exeDir;
                }

                // Pick a free local port
                port = GetAvailablePort();

                // Start lightweight embedded HTTP server for app files
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Prefixes.Add("http://localhost:" + port + "/");
                listener.Start();

                Thread serverThread = new Thread(RunServer);
                serverThread.IsBackground = true;
                serverThread.Start();

                // Find Edge or browser
                string edgePath = FindEdgeExecutable();
                string appUrl = "http://127.0.0.1:" + port + "/index.html";

                Process appProcess = null;
                if (!string.IsNullOrEmpty(edgePath) && File.Exists(edgePath)) {
                    string userData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FITMATE AI", "Data");
                    Directory.CreateDirectory(userData);

                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = edgePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,820 --user-data-dir=\"{1}\" --app-id=\"ai.fitmate.app\"", appUrl, userData);
                    psi.UseShellExecute = false;
                    appProcess = Process.Start(psi);
                } else {
                    // Fallback to default browser
                    Process.Start(appUrl);
                }

                if (appProcess != null) {
                    appProcess.WaitForExit();
                } else {
                    // Keep alive if launched in default browser
                    Thread.Sleep(5000);
                }
            } catch (Exception ex) {
                MessageBox.Show("Error starting FITMATE AI: " + ex.Message, "FITMATE AI", MessageBoxButtons.OK, MessageBoxIcon.Error);
            } finally {
                if (listener != null && listener.IsListening) {
                    try { listener.Stop(); } catch {}
                }
            }
        }

        private static int GetAvailablePort() {
            System.Net.Sockets.TcpListener l = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int p = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return p;
        }

        private static void RunServer() {
            while (listener.IsListening) {
                try {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c), context);
                } catch {
                    break;
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext context) {
            try {
                string rawUrl = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl) || rawUrl == "/") rawUrl = "index.html";

                string filePath = Path.Combine(appDir, rawUrl.Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(filePath)) {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLower();
                    string mime = "application/octet-stream";
                    if (ext == ".html") mime = "text/html; charset=utf-8";
                    else if (ext == ".css") mime = "text/css; charset=utf-8";
                    else if (ext == ".js") mime = "application/javascript; charset=utf-8";
                    else if (ext == ".svg") mime = "image/svg+xml";
                    else if (ext == ".png") mime = "image/png";
                    else if (ext == ".json") mime = "application/json";

                    context.Response.ContentType = mime;
                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                    context.Response.OutputStream.Close();
                } else {
                    context.Response.StatusCode = 404;
                    byte[] err = Encoding.UTF8.GetBytes("Not Found");
                    context.Response.OutputStream.Write(err, 0, err.Length);
                    context.Response.OutputStream.Close();
                }
            } catch {
                try { context.Response.Close(); } catch {}
            }
        }

        private static string FindEdgeExecutable() {
            string[] paths = new string[] {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Microsoft", "Edge", "Application", "msedge.exe")
            };
            foreach (string p in paths) {
                if (File.Exists(p)) return p;
            }
            return null;
        }
    }
}
