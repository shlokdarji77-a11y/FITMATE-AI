using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;

namespace FitmateAI.Setup {
    public class SetupWizardForm : Form {
        private Panel headerPanel;
        private Label titleLabel;
        private Label subLabel;
        private Panel contentPanel;
        private ProgressBar progressBar;
        private Label statusLabel;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunch;
        private TextBox txtInstallPath;
        private Button btnBrowse;
        private Button btnAction;
        private Button btnCancel;
        private int currentStep = 1;
        private string installDir;

        public SetupWizardForm() {
            InitializeUI();
        }

        private void InitializeUI() {
            this.Text = "FITMATE AI Setup — Installation Wizard";
            this.Size = new Size(580, 420);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(14, 19, 29);
            this.ForeColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Default Install Path
            installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "FITMATE AI");

            // Header Banner
            headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 70;
            headerPanel.BackColor = Color.FromArgb(8, 10, 15);
            headerPanel.Padding = new Padding(20, 12, 20, 12);

            titleLabel = new Label();
            titleLabel.Text = "FITMATE AI Installation";
            titleLabel.Font = new Font("Segoe UI", 12.5f, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(0, 229, 153);
            titleLabel.AutoSize = true;
            titleLabel.Location = new Point(20, 12);
            headerPanel.Controls.Add(titleLabel);

            subLabel = new Label();
            subLabel.Text = "Your Adaptive AI Fitness Companion for a Healthier Student Lifestyle";
            subLabel.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            subLabel.ForeColor = Color.FromArgb(148, 163, 184);
            subLabel.AutoSize = true;
            subLabel.Location = new Point(20, 38);
            headerPanel.Controls.Add(subLabel);

            this.Controls.Add(headerPanel);

            // Content Panel
            contentPanel = new Panel();
            contentPanel.Location = new Point(20, 85);
            contentPanel.Size = new Size(525, 235);
            contentPanel.BackColor = Color.Transparent;
            this.Controls.Add(contentPanel);

            // Bottom Buttons
            btnAction = new Button();
            btnAction.Text = "Next >";
            btnAction.Size = new Size(110, 36);
            btnAction.Location = new Point(315, 332);
            btnAction.BackColor = Color.FromArgb(0, 229, 153);
            btnAction.ForeColor = Color.FromArgb(8, 10, 15);
            btnAction.FlatStyle = FlatStyle.Flat;
            btnAction.FlatAppearance.BorderSize = 0;
            btnAction.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
            btnAction.Cursor = Cursors.Hand;
            btnAction.Click += BtnAction_Click;
            this.Controls.Add(btnAction);

            btnCancel = new Button();
            btnCancel.Text = "Cancel";
            btnCancel.Size = new Size(95, 36);
            btnCancel.Location = new Point(435, 332);
            btnCancel.BackColor = Color.FromArgb(27, 36, 52);
            btnCancel.ForeColor = Color.FromArgb(248, 250, 252);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderSize = 0;
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);

            ShowStep(1);
        }

        private void ShowStep(int step) {
            currentStep = step;
            contentPanel.Controls.Clear();

            if (step == 1) {
                // Step 1: Welcome & Destination
                titleLabel.Text = "Select Destination Location";
                subLabel.Text = "Setup will install FITMATE AI into the following directory.";

                Label lblPrompt = new Label();
                lblPrompt.Text = "To continue, click Next. To select a different folder, click Browse.";
                lblPrompt.Location = new Point(0, 15);
                lblPrompt.AutoSize = true;
                contentPanel.Controls.Add(lblPrompt);

                txtInstallPath = new TextBox();
                txtInstallPath.Text = installDir;
                txtInstallPath.Location = new Point(0, 48);
                txtInstallPath.Size = new Size(415, 26);
                txtInstallPath.BackColor = Color.FromArgb(8, 12, 19);
                txtInstallPath.ForeColor = Color.White;
                txtInstallPath.BorderStyle = BorderStyle.FixedSingle;
                contentPanel.Controls.Add(txtInstallPath);

                btnBrowse = new Button();
                btnBrowse.Text = "Browse...";
                btnBrowse.Location = new Point(425, 47);
                btnBrowse.Size = new Size(95, 28);
                btnBrowse.BackColor = Color.FromArgb(27, 36, 52);
                btnBrowse.ForeColor = Color.White;
                btnBrowse.FlatStyle = FlatStyle.Flat;
                btnBrowse.FlatAppearance.BorderSize = 0;
                btnBrowse.Click += (s, e) => {
                    using (FolderBrowserDialog fbd = new FolderBrowserDialog()) {
                        fbd.SelectedPath = installDir;
                        if (fbd.ShowDialog() == DialogResult.OK) {
                            installDir = fbd.SelectedPath;
                            txtInstallPath.Text = installDir;
                        }
                    }
                };
                contentPanel.Controls.Add(btnBrowse);

                chkDesktop = new CheckBox();
                chkDesktop.Text = "Create a Desktop shortcut";
                chkDesktop.Checked = true;
                chkDesktop.Location = new Point(0, 110);
                chkDesktop.AutoSize = true;
                contentPanel.Controls.Add(chkDesktop);

                chkStartMenu = new CheckBox();
                chkStartMenu.Text = "Create a Windows Start Menu shortcut";
                chkStartMenu.Checked = true;
                chkStartMenu.Location = new Point(0, 140);
                chkStartMenu.AutoSize = true;
                contentPanel.Controls.Add(chkStartMenu);

                btnAction.Text = "Install";
            } else if (step == 2) {
                // Step 2: Installing Progress
                titleLabel.Text = "Installing FITMATE AI";
                subLabel.Text = "Please wait while Setup installs FITMATE AI on your computer...";

                btnAction.Enabled = false;
                btnCancel.Enabled = false;

                statusLabel = new Label();
                statusLabel.Text = "Extracting application components...";
                statusLabel.Location = new Point(0, 30);
                statusLabel.AutoSize = true;
                contentPanel.Controls.Add(statusLabel);

                progressBar = new ProgressBar();
                progressBar.Location = new Point(0, 60);
                progressBar.Size = new Size(520, 22);
                progressBar.Style = ProgressBarStyle.Marquee;
                contentPanel.Controls.Add(progressBar);

                // Run installation in background thread
                System.Threading.ThreadPool.QueueUserWorkItem(PerformInstall);
            } else if (step == 3) {
                // Step 3: Finished
                titleLabel.Text = "Installation Completed";
                subLabel.Text = "FITMATE AI has been installed on your computer.";

                Label lblDone = new Label();
                lblDone.Text = "FITMATE AI is ready to use!\n\nYou can launch the application from the Desktop or Start Menu.";
                lblDone.Location = new Point(0, 25);
                lblDone.AutoSize = true;
                contentPanel.Controls.Add(lblDone);

                chkLaunch = new CheckBox();
                chkLaunch.Text = "Launch FITMATE AI now";
                chkLaunch.Checked = true;
                chkLaunch.Location = new Point(0, 110);
                chkLaunch.AutoSize = true;
                chkLaunch.ForeColor = Color.FromArgb(0, 229, 153);
                chkLaunch.Font = new Font("Segoe UI", 10.5f, FontStyle.Bold);
                contentPanel.Controls.Add(chkLaunch);

                btnAction.Text = "Finish";
                btnAction.Enabled = true;
                btnCancel.Visible = false;
            }
        }

        private void BtnAction_Click(object sender, EventArgs e) {
            if (currentStep == 1) {
                installDir = txtInstallPath.Text.Trim();
                ShowStep(2);
            } else if (currentStep == 3) {
                if (chkLaunch != null && chkLaunch.Checked) {
                    string exePath = Path.Combine(installDir, "FITMATE-AI.exe");
                    if (File.Exists(exePath)) {
                        Process.Start(new ProcessStartInfo(exePath) { WorkingDirectory = installDir });
                    }
                }
                this.Close();
            }
        }

        private void PerformInstall(object state) {
            try {
                Directory.CreateDirectory(installDir);

                // Extract embedded payload zip
                Assembly asm = Assembly.GetExecutingAssembly();
                using (Stream stream = asm.GetManifestResourceStream("payload.zip")) {
                    if (stream != null) {
                        using (ZipArchive archive = new ZipArchive(stream)) {
                            archive.ExtractToDirectory(installDir);
                        }
                    } else {
                        // Fallback: copy from installer directory if payload is loose
                        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                        if (File.Exists(Path.Combine(baseDir, "FITMATE-AI.exe"))) {
                            File.Copy(Path.Combine(baseDir, "FITMATE-AI.exe"), Path.Combine(installDir, "FITMATE-AI.exe"), true);
                        }
                        if (File.Exists(Path.Combine(baseDir, "Uninstall.exe"))) {
                            File.Copy(Path.Combine(baseDir, "Uninstall.exe"), Path.Combine(installDir, "Uninstall.exe"), true);
                        }
                        if (Directory.Exists(Path.Combine(baseDir, "app"))) {
                            CopyDirectory(Path.Combine(baseDir, "app"), Path.Combine(installDir, "app"));
                        }
                    }
                }

                string targetExe = Path.Combine(installDir, "FITMATE-AI.exe");

                // 1. Desktop Shortcut
                if (chkDesktop.Checked) {
                    string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    CreateShortcut(Path.Combine(desktop, "FITMATE AI.lnk"), targetExe, installDir, "FITMATE AI — Your Adaptive Fitness Companion");
                }

                // 2. Start Menu Shortcut
                if (chkStartMenu.Checked) {
                    string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "FITMATE AI");
                    Directory.CreateDirectory(startMenu);
                    CreateShortcut(Path.Combine(startMenu, "FITMATE AI.lnk"), targetExe, installDir, "FITMATE AI — Your Adaptive Fitness Companion");
                    string uninstaller = Path.Combine(installDir, "Uninstall.exe");
                    if (File.Exists(uninstaller)) {
                        CreateShortcut(Path.Combine(startMenu, "Uninstall FITMATE AI.lnk"), uninstaller, installDir, "Uninstall FITMATE AI");
                    }
                }

                // 3. Register in Windows Add/Remove Programs (Registry)
                try {
                    using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\FITMATE AI")) {
                        key.SetValue("DisplayName", "FITMATE AI");
                        key.SetValue("DisplayVersion", "1.0.4");
                        key.SetValue("Publisher", "FITMATE AI Technologies Inc.");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("DisplayIcon", targetExe);
                        key.SetValue("UninstallString", Path.Combine(installDir, "Uninstall.exe"));
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                } catch {}

                System.Threading.Thread.Sleep(500);

                this.Invoke((MethodInvoker)delegate {
                    ShowStep(3);
                });
            } catch (Exception ex) {
                this.Invoke((MethodInvoker)delegate {
                    MessageBox.Show("Installation Error: " + ex.Message, "FITMATE AI Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    this.Close();
                });
            }
        }

        private static void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string description) {
            try {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null) {
                    dynamic shell = Activator.CreateInstance(shellType);
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetPath;
                    shortcut.WorkingDirectory = workingDir;
                    shortcut.Description = description;
                    shortcut.Save();
                }
            } catch {}
        }

        private static void CopyDirectory(string sourceDir, string destinationDir) {
            Directory.CreateDirectory(destinationDir);
            foreach (string file in Directory.GetFiles(sourceDir)) {
                File.Copy(file, Path.Combine(destinationDir, Path.GetFileName(file)), true);
            }
            foreach (string dir in Directory.GetDirectories(sourceDir)) {
                CopyDirectory(dir, Path.Combine(destinationDir, Path.GetFileName(dir)));
            }
        }

        [STAThread]
        public static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupWizardForm());
        }
    }
}
