using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

namespace FitmateAI {
    public class Uninstaller {
        [STAThread]
        public static void Main() {
            DialogResult res = MessageBox.Show(
                "Are you sure you want to completely remove FITMATE AI and all its components from your computer?",
                "FITMATE AI Uninstall",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (res != DialogResult.Yes) return;

            try {
                // 1. Remove Desktop Shortcut
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string deskShortcut = Path.Combine(desktop, "FITMATE AI.lnk");
                if (File.Exists(deskShortcut)) File.Delete(deskShortcut);

                // 2. Remove Start Menu Shortcut
                string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "FITMATE AI");
                if (Directory.Exists(startMenu)) Directory.Delete(startMenu, true);

                // 3. Remove Registry Entry
                try {
                    Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\FITMATE AI", false);
                } catch {}

                MessageBox.Show(
                    "FITMATE AI was successfully removed from your computer.",
                    "FITMATE AI Uninstall",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );

                // Self-deletion via cmd
                string installDir = AppDomain.CurrentDomain.BaseDirectory;
                System.Diagnostics.ProcessStartInfo psi = new System.Diagnostics.ProcessStartInfo();
                psi.FileName = "cmd.exe";
                psi.Arguments = string.Format("/C choice /C Y /N /D Y /T 2 & rmdir /S /Q \"{0}\"", installDir.TrimEnd('\\'));
                psi.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
                psi.CreateNoWindow = true;
                System.Diagnostics.Process.Start(psi);
            } catch (Exception ex) {
                MessageBox.Show("Error during uninstall: " + ex.Message, "FITMATE AI", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
