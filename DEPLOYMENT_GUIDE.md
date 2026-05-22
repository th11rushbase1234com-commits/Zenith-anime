# 🚀 ZENITH | Deployment & Hosting Manual

This guide provides the exact technical protocols required to transition the Zenith Archival Nexus from development to a global production environment.

## 📦 Phase 1: Local Environment Setup
1. **Download**: Use the "Export" or "Download" feature in the Firebase Studio header to obtain the `project.zip`.
2. **Extraction**: Unzip the files into a dedicated directory on your hardware.
3. **Git Initialization**:
   ```bash
   git init
   git add .
   git commit -m "Initial Zenith Core Uplink"
   ```

## 🛰️ Phase 2: GitHub Synchronization
1. Create a new repository at [github.com/new](https://github.com/new).
2. Name it `zenith-anime-archive`.
3. Link your local files and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/zenith-anime-archive.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Phase 3: Global Hosting (Firebase App Hosting)
1. **Console Access**: Open the [Firebase Console](https://console.firebase.google.com/).
2. **Enable App Hosting**: Navigate to **Build > App Hosting** in the sidebar.
3. **Connect Repository**: 
   - Authorize GitHub access.
   - Select the `zenith-anime-archive` repository.
   - Select the `main` branch.
4. **Configuration**:
   - The project uses **Next.js 15**. Firebase will auto-detect the build settings.
   - Deployment will trigger automatically upon connection.

## 🔑 Phase 4: Environment Variables (Critical)
1. In the **App Hosting Dashboard**, navigate to the **Settings** or **Variables** tab.
2. Add the following secret:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: [Your Google AI API Key]
3. This is required for the **Zenith AI Recommendation Engine** to function in production.

---
**Zenith Archival Nexus V37.0** - Terminal Fix Point Reached. All systems are green for deployment.