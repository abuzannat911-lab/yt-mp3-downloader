# YouTube Video & Playlist to MP3 Downloader (Cloudflare Pages Edition)

A high-performance, responsive single-page web app for converting YouTube videos and playlists into high-quality MP3 audio files. Built to run 100% serverless on **Cloudflare Pages**.

## Features

- 🎵 **Single Video & Playlist MP3 Extraction**
- ⚡ **100% Client-side & Serverless** (Runs directly on Cloudflare Pages)
- 🎚️ **Bitrate Options** (320kbps, 256kbps, 128kbps)
- 💎 **Modern Dark Glassmorphism UI**
- 🔗 **Direct Temporary Audio Stream & Download URLs**

## Deployment to Cloudflare Pages via GitHub

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/yt-mp3-downloader.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** -> **Create Application** -> **Pages**.
3. Select **Connect to Git** and pick your `yt-mp3-downloader` repository.
4. Set build settings:
   - **Framework Preset:** `None`
   - **Build Command:** *(Leave blank)*
   - **Build Output Directory:** `.` (or leave as root `/`)
5. Click **Save and Deploy**.

Your app is now live on `https://<your-project>.pages.dev` with zero server hosting costs!
