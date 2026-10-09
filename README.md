# AEGIS 2.0 | Vercel presentation site and recorded demo

A public-facing **static** presentation of the original AEGIS cinematic website. This repository publishes to Vercel with **no Node.js installation and no build step**.

## What is here

| File | Purpose |
|---|---|
| `index.html` | Original cinematic AEGIS showcase, preserved with demo and optional live-app links |
| `demo.html` | Recorded demo page, supporting YouTube or Google Drive preview |
| `site-config.js` | **Only file you need to edit** to add links |
| `vercel.json` | Vercel static-site and basic security-header configuration |
| `favicon.svg` | AEGIS browser tab icon |
| `.gitignore` | Avoid accidental addition of local secrets, databases, and large videos |

## STEP 1: Make the final demo video accessible

Upload your recorded **final project demonstration** to **YouTube (Unlisted)**, or Google Drive (set sharing to *Anyone with the link → Viewer* if appropriate for faculty). Obtain its public share link. Obtain expert permission before publishing an expert interview publicly; the full interview can instead be submitted privately to the required Google Classroom.

> No actual recorded video was included with these website files. The demo page displays an honest placeholder until a video URL is provided.

## STEP 2: Insert video and (optionally) live Streamlit URL

Open `site-config.js` in GitHub's editor and replace the empty quotation marks with your URLs:

```js
window.AEGIS_SITE = Object.freeze({
  demoVideoUrl: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
  liveAppUrl: "" // Fill ONLY when your live Streamlit deployment works securely
});
```

Google Drive example: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`. The demo page supports either service and embeds the video when possible. Other HTTPS links will display a Watch Video link.

**Do not paste tokens, passwords, OpenRouter keys, or n8n credentials in this file. It is public.**

## STEP 3: Create a GitHub repository

1. Go to https://github.com/new and create `aegis-2-0-showcase` (Public or Private; Vercel Git integration supports either with suitable access).
2. On the repository page, choose **Add file → Upload files**.
3. Upload the **contents of this folder**, not the ZIP. The files `index.html`, `demo.html`, `site-config.js`, `vercel.json`, `favicon.svg`, `README.md`, and optionally `.gitignore` must be at the **repository root**.
4. Click **Commit changes**. Do not upload your 94 MB AEGIS backend archives or `.env`/token/database files to this website repository.

## STEP 4: Deploy from GitHub to Vercel

1. Open https://vercel.com/new and log in with GitHub.
2. Select **Add New → Project**, import `aegis-2-0-showcase`.
3. **Framework Preset:** `Other`.
4. **Root Directory:** `./` (project root).
5. **Build Command:** leave blank / override to empty.
6. **Output Directory:** leave at default. With no `public` folder Vercel serves root files.
7. Click **Deploy**. Your URLs will resemble `https://your-project.vercel.app` and `https://your-project.vercel.app/demo.html`.

Each GitHub update triggers a fresh deployment.

## STEP 5: Verify

- Main site opens, animations work, and navigation/diagrams display.
- **Watch recorded demo** opens the demo page. Add a real video link before claiming the recorded demo is published.
- YouTube or Drive video plays and is viewable on a second device without your personal account.
- If added, **Launch live AEGIS** points to a truly running, HTTPS-protected Streamlit instance.
- Update expert feedback only from the actual approved interview transcript.
- Paste your public website URL at the top of the AEGIS book chapter.

## What this repository does NOT deploy

**Vercel static hosting does not run a persistent Streamlit server, n8n execution engine, waiting callbacks, audit receiver, or SQLite state.** Your full local AEGIS workflow must remain separately hosted or demonstrated through the recorded video. The existing on-page *Interactive Walkthrough* is a visualization, not an active banking workflow. Never describe it as live n8n execution.
