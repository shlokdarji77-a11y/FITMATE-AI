import os
import subprocess
import zipfile
import hashlib

CSC_PATH = r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
BUILD_DIR = "build_temp"
DOWNLOADS_DIR = "downloads"
os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

assembly_info = os.path.join("src-windows", "AssemblyInfo.cs")

print("--- Step 1: Compiling FITMATE-AI.exe with metadata ---")
fitmate_exe = os.path.join(BUILD_DIR, "FITMATE-AI.exe")
cmd1 = [
    CSC_PATH,
    "/nologo",
    "/target:winexe",
    f"/out:{fitmate_exe}",
    "/r:System.dll",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    assembly_info,
    os.path.join("src-windows", "FITMATE-AI.cs")
]
res1 = subprocess.run(cmd1, capture_output=True, text=True)
if res1.returncode != 0:
    print("Error compiling FITMATE-AI.exe:")
    print(res1.stderr)
    exit(1)
print(f"Successfully compiled: {fitmate_exe} ({os.path.getsize(fitmate_exe)} bytes)")

print("\n--- Step 2: Compiling Uninstall.exe ---")
uninstall_exe = os.path.join(BUILD_DIR, "Uninstall.exe")
cmd2 = [
    CSC_PATH,
    "/nologo",
    "/target:winexe",
    f"/out:{uninstall_exe}",
    "/r:System.dll",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    assembly_info,
    os.path.join("src-windows", "Uninstall.cs")
]
res2 = subprocess.run(cmd2, capture_output=True, text=True)
if res2.returncode != 0:
    print("Error compiling Uninstall.exe:")
    print(res2.stderr)
    exit(1)
print(f"Successfully compiled: {uninstall_exe} ({os.path.getsize(uninstall_exe)} bytes)")

print("\n--- Step 3: Packaging application payload.zip ---")
payload_zip = os.path.join(BUILD_DIR, "payload.zip")
with zipfile.ZipFile(payload_zip, "w", zipfile.ZIP_DEFLATED) as z:
    z.write(fitmate_exe, "FITMATE-AI.exe")
    z.write(uninstall_exe, "Uninstall.exe")
    for root, dirs, files in os.walk("app"):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ".")
            z.write(full_path, rel_path)
print(f"Created payload: {payload_zip} ({os.path.getsize(payload_zip)} bytes)")

print("\n--- Step 4: Compiling Standalone FITMATE-AI-Setup.exe with metadata ---")
setup_exe = os.path.join(DOWNLOADS_DIR, "FITMATE-AI-Setup.exe")
cmd3 = [
    CSC_PATH,
    "/nologo",
    "/target:winexe",
    f"/out:{setup_exe}",
    "/r:System.dll",
    "/r:System.Windows.Forms.dll",
    "/r:System.Drawing.dll",
    "/r:System.IO.Compression.dll",
    "/r:System.IO.Compression.FileSystem.dll",
    f"/resource:{payload_zip},payload.zip",
    assembly_info,
    os.path.join("src-windows", "FITMATE-AI-Setup.cs")
]
res3 = subprocess.run(cmd3, capture_output=True, text=True)
if res3.returncode != 0:
    print("Error compiling FITMATE-AI-Setup.exe:")
    print(res3.stderr)
    exit(1)

setup_size = os.path.getsize(setup_exe)
with open(setup_exe, "rb") as f:
    setup_hash = hashlib.sha256(f.read()).hexdigest()

print(f"\n==========================================")
print(f"SUCCESSFULLY GENERATED REAL WINDOWS INSTALLER!")
print(f"Installer: {setup_exe}")
print(f"Size: {setup_size} bytes ({setup_size / (1024*1024):.2f} MB)")
print(f"SHA-256: {setup_hash}")
print(f"==========================================")
