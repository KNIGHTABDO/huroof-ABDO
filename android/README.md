# Android Build Guide (APK/AAB) — حروف مع عبدو

This project uses a **single codebase** strategy:

- Web app (Next.js on Vercel) stays the source of truth.
- Android app is packaged as **TWA** (Trusted Web Activity) and opens the same production URL.

> ملاحظة مهمة: ملفات مشروع Android الناتجة عن Bubblewrap يتم حفظها داخل `android/twa` لتجنب تعارض المسارات مع `src/app` الخاصة بـ Next.js.

## 1) Fixed Production URL

Use only a stable production URL (not preview URLs):

- `https://huroof-abdo.vercel.app/`

## 2) Branding (already in project)

- App name: `حروف مع عبدو`
- Launcher display name: `حروف مع عبدو`
- Icons:
  - `public/assets/icon-192.png`
  - `public/assets/icon-512.png`

## 3) Requirements (local machine)

- Node.js + npm
- Java JDK 17+
- Android SDK + Android Studio
- Bubblewrap CLI (via npx in scripts below)

## 4) Initialize TWA project

From repo root:

```bash
npm run android:twa:init
```

This command uses:

- Manifest URL: `https://huroof-abdo.vercel.app/site.webmanifest`

Bubblewrap will ask for:

- Android package id (example: `com.huroof.abdo`)
- App display name
- Signing key details

## 5) Generate Digital Asset Links file

After you have your release certificate SHA-256 fingerprint:

```bash
# Windows PowerShell example
$env:ANDROID_PACKAGE_NAME="com.huroof.abdo"
$env:ANDROID_SHA256_FINGERPRINT="AA:BB:CC:..."
npm run android:assetlinks
```

This generates:

- `public/.well-known/assetlinks.json`

Deploy so Android can verify association at:

- `https://huroof-abdo.vercel.app/.well-known/assetlinks.json`

## 6) Build Android app

```bash
npm run android:twa:build
```

You can produce debug/release artifacts depending on your Bubblewrap config.

## 7) Verify cross-platform gameplay

Test both directions:

1. Web host → Android player join
2. Android host → Web player join

Also verify:

- QR join
- Reconnect behavior
- Rotation/fullscreen prompts

## 8) Play Store release

- Upload signed AAB
- Use privacy URL: `https://huroof-abdo.vercel.app/privacy`
- Use terms URL: `https://huroof-abdo.vercel.app/terms`

## 9) End-user install links

- In-app install page: `https://huroof-abdo.vercel.app/install`
- GitHub Releases (APK/AAB distribution): `https://github.com/KNIGHTABDO/huroof-ABDO/releases`

## 10) Automatic build on GitHub (CI/CD)

Workflow file:

- `.github/workflows/android-release.yml`

What it does:

- On push to `main`:
  - With signing secrets: builds release APK + AAB and uploads them as artifacts.
  - Without signing secrets: builds debug APK and uploads it as artifact (no failure).
- On tag `v*`: requires signing secrets, builds release APK + AAB, then publishes to GitHub Releases.

Required GitHub Actions secrets:

- `ANDROID_KEYSTORE_BASE64` (base64 content of your `.jks` file)
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

How to create `ANDROID_KEYSTORE_BASE64` locally:

```bash
# Linux/macOS
base64 -w 0 /path/to/huroof-release.jks

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\android\keys\huroof-release.jks"))
```

Release trigger example:

```bash
git tag v2.1.0
git push origin v2.1.0
```

---

## Useful Scripts

- `npm run android:twa:init`
- `npm run android:twa:build`
- `npm run android:assetlinks`
- `npm run android:assetlinks:dry`
