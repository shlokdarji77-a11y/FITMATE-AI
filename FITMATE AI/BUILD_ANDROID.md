# FITMATE AI — Android Build & Compilation Guide

This document provides exact instructions to build and compile the official **FITMATE-AI.apk** from source code.

## Prerequisites
1. **JDK 17 or JDK 21**
2. **Android SDK** (API Level 34, Build Tools 34.0.0)
3. **Android Studio** (Hedgehog / Iguana or newer) or Command Line Tools

---

## Method 1: Building via Command Line (Gradle)

1. Open a terminal in the `android-project` directory:
   ```bash
   cd "android-project"
   ```

2. Build the Debug APK:
   ```bash
   ./gradlew assembleDebug
   ```
   Output APK location:
   `android-project/app/build/outputs/apk/debug/app-debug.apk`

3. Build the Release APK (Signed):
   ```bash
   ./gradlew assembleRelease
   ```
   Output APK location:
   `android-project/app/build/outputs/apk/release/app-release.apk`

4. Copy the generated APK to the website download folder:
   ```bash
   cp app/build/outputs/apk/release/app-release.apk ../downloads/FITMATE-AI.apk
   ```

---

## Method 2: Building via Android Studio GUI

1. Open **Android Studio**.
2. Click **File → Open...** and select the `android-project` folder.
3. Allow Gradle to sync dependencies.
4. From the top menu, select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
5. Once complete, click **locate** in the popup notification to find your APK.
6. Rename or copy to `downloads/FITMATE-AI.apk`.

---

## Package Details
- **Application ID**: `ai.fitmate.app`
- **Minimum SDK**: Android 7.0 (API 24)
- **Target SDK**: Android 14 (API 34)
- **Hardware Features**: Camera vision telemetry, WebGL acceleration, local storage persistence
