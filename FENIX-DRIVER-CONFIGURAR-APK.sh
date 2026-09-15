#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo "🔥 FÉNIX DRIVER — CONFIGURAR APK"
echo "======================================"

# Entrar al repositorio de forma segura
if [ -d "FENIX-DRIVER/.git" ]; then
  cd FENIX-DRIVER
elif git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  :
else
  echo "❌ No encuentro el repositorio FENIX-DRIVER."
  echo "Clonándolo desde GitHub..."
  git clone https://github.com/pabloaccordino-hub/FENIX-DRIVER.git
  cd FENIX-DRIVER
fi

echo ""
echo "1/5 — Actualizando repositorio..."
git pull origin main

echo ""
echo "2/5 — Creando workflow de compilación Android..."
mkdir -p .github/workflows

cat > .github/workflows/android-apk.yml <<'YAML'
name: Build Fenix Driver APK

on:
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Verify application
        run: npm test

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install Capacitor
        run: npm install --no-save @capacitor/core @capacitor/cli @capacitor/android

      - name: Prepare web build
        run: |
          rm -rf dist
          mkdir -p dist
          cp index.html styles.css app.js manifest.webmanifest sw.js dist/
          cp icon-192.png icon-512.png dist/
          cp -r src dist/src

      - name: Create Capacitor config
        run: |
          cat > capacitor.config.json <<'JSON'
          {
            "appId": "com.fenixdriver.app",
            "appName": "Fénix Driver",
            "webDir": "dist",
            "bundledWebRuntime": false,
            "server": {
              "androidScheme": "https"
            }
          }
          JSON

      - name: Add Android platform
        run: npx cap add android

      - name: Sync Android project
        run: npx cap sync android

      - name: Build debug APK
        working-directory: android
        run: ./gradlew assembleDebug --no-daemon

      - name: Rename APK
        run: cp android/app/build/outputs/apk/debug/app-debug.apk FENIX-DRIVER-V2.9.apk

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: FENIX-DRIVER-V2.9-APK
          path: FENIX-DRIVER-V2.9.apk
          if-no-files-found: error
YAML

echo "✅ Workflow creado."

echo ""
echo "3/5 — Guardando configuración..."
git add .github/workflows/android-apk.yml
git commit -m "ci: build Fenix Driver Android APK" || echo "ℹ️ No había cambios para commit."

echo ""
echo "4/5 — Subiendo a GitHub..."
git push origin main

echo ""
echo "5/5 — LISTO"
echo "======================================"
echo "🚀 GitHub Actions comenzará a compilar la APK."
echo ""
echo "Abrí:"
echo "https://github.com/pabloaccordino-hub/FENIX-DRIVER/actions"
echo ""
echo "Cuando termine en verde:"
echo "Actions → Build Fenix Driver APK → último run → Artifacts"
echo "→ FENIX-DRIVER-V2.9-APK"
echo "======================================"
