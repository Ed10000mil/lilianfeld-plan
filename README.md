# Lilianfeld 30-Day Plan

A mobile-first web app to track the Lilianfeld Candles 30-day growth plan. Progress is saved in the browser (localStorage) and the app can be installed to your home screen on iPhone or Android.

## Files

- `index.html` — the full app (React + Babel, loaded from CDN)
- `manifest.json` — PWA manifest so it installs to your home screen
- `icon.svg` — source icon (export to `icon-192.png`, `icon-512.png`, `icon-180.png`)
- `.nojekyll` — tells GitHub Pages to serve files as-is

## Deploy to GitHub Pages

1. Create a new public repo on GitHub (e.g. `lilianfeld-plan`).
2. Upload these files to the root (web UI: Add file → Upload files → drag everything in → Commit).
3. Go to **Settings → Pages**.
4. Under **Source**, pick `Deploy from a branch`, set branch to `main` and folder to `/ (root)`, click Save.
5. Wait ~30 seconds, refresh. Your app is live at:
   `https://<your-github-username>.github.io/lilianfeld-plan/`

## Install on iPhone

1. Open the GitHub Pages URL in **Safari** (must be Safari, not Chrome, for "Add to Home Screen" to work properly).
2. Tap the Share icon → **Add to Home Screen** → **Add**.
3. The app opens fullscreen, no browser bars.

## Install on Android

1. Open the URL in Chrome.
2. Menu (⋮) → **Install app** (or **Add to Home Screen**).

## Icon export (optional but recommended)

`manifest.json` references `icon-192.png` and `icon-512.png`, and `index.html` references `icon-180.png` for iOS. The app still works without them, but the home-screen icon will look generic. Easiest way:

1. Open `icon.svg` in any browser or design tool.
2. Export PNGs at these exact sizes: **180×180**, **192×192**, **512×512**.
3. Drop them in the repo root as `icon-180.png`, `icon-192.png`, `icon-512.png` and commit.

Or use a free converter like cloudconvert.com — upload `icon.svg`, export at each size.
