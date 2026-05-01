# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free at vercel.com — sign in with GitHub)
- Anthropic API key (console.anthropic.com)

## 1. Push to your GitHub repository

Your repo: https://github.com/vidarsveen/conceptlib

```bash
# In the concept-library directory:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/vidarsveen/conceptlib.git
git push -u origin main
```

## 2. Create a GitHub personal access token

Go to: github.com/settings/tokens → "Fine-grained tokens" → Generate new token

- **Repository access**: Only the `conceptlib` repo
- **Permissions → Contents**: Read and write

Copy the token — you'll need it in step 4.

## 3. Connect to Vercel

1. Go to vercel.com → Add New Project
2. Import your `conceptlib` GitHub repo (vidarsveen/conceptlib)
3. Framework: Next.js (auto-detected)
4. Click **Deploy** (first deploy will succeed with missing env vars, just the generation won't work yet)

## 4. Add environment variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic key (sk-ant-...) |
| `ADMIN_PASSPHRASE` | A strong passphrase only you know |
| `GITHUB_TOKEN` | The fine-grained token from step 2 |
| `GITHUB_REPO` | `vidarsveen/conceptlib` |

After adding them, go to Deployments → Redeploy (to pick up the new env vars).

## 5. Install as a PWA on your phone

Open your Vercel URL in Safari (iOS) or Chrome (Android):
- **iOS Safari**: tap the Share button → "Add to Home Screen"
- **Android Chrome**: tap the three-dot menu → "Add to Home Screen" or "Install app"

The app will appear on your home screen and open without browser chrome.

## 6. Add your first concept from mobile

Open the app → tap "+ Add concept" at the bottom
- Enter your passphrase
- Type a concept name (e.g. "Hilbert's Hotel")
- Optionally add context
- Tap "Generate article"
- Review the preview, then tap "Commit to GitHub"
- Wait ~1–2 minutes for Vercel to rebuild
- Refresh the app — the new concept appears

## Local development

```bash
cp .env.local.example .env.local
# Fill in .env.local with your values

npm run dev
# Open http://localhost:3000
```

Note: In local dev, the "Commit to GitHub" button will commit directly to your repo's main branch (same as production). To avoid this during development, set `GITHUB_REPO` to empty in `.env.local` — the commit step will fail gracefully with a "GitHub not configured" error, but generation still works.

## Customizing the writing style

Edit `content/style-prompt.md` — this is the system prompt Claude uses for all article generation. After generating a few articles and seeing what you like or don't like, edit this file and commit it. The change takes effect immediately for the next article you generate.

## Adding optional PWA icons

For a custom icon on your home screen, add two PNG files:
- `public/icon-192.png` (192×192 px)
- `public/icon-512.png` (512×512 px)

Then add to `public/manifest.json`:
```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```
