# Cairn Landing Page

Static one-pager for the Cairn research project — a collaboration between Mila and Mozilla.

## Local preview

Open `index.html` directly in a browser, or serve locally:

```bash
npx serve .
```

Then visit `http://localhost:3000`.

## Structure

```
cairn-landing/
├── index.html
├── css/styles.css
└── assets/
    ├── video/        # Header background video (WebM + MP4 fallback)
    └── images/       # Logo, arrow, partner logos
```

## Before deploying

1. Replace the CTA `href="#"` in `index.html` with the actual GitHub repository URL.
2. Add legal notice content in the `#legal` section (currently hidden placeholder).

## Deploy

This is a static site — deploy to any static host (GitHub Pages, Netlify, Vercel, S3, etc.) by uploading the folder contents.
