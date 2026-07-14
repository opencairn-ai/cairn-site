# Cairn Landing Page

Static one-pager for the Cairn research project, a collaboration between Mila and Mozilla. Hosted on Cloudflare Workers as static assets.

## Local preview

```bash
npx wrangler dev
```

Then visit `http://localhost:8787`. No build step; any static file server pointed at `public/` also works.

## Structure

```
cairn-landing/
├── public/               # Everything that gets served
│   ├── index.html
│   ├── robots.txt        # Pre-launch: blocks all crawlers
│   ├── .assetsignore     # Files wrangler should not upload
│   ├── css/styles.css
│   └── assets/
│       ├── video/        # Header background video (WebM + MP4 fallback)
│       └── images/       # Logo, arrow, partner logos
├── wrangler.jsonc        # Cloudflare Workers config
└── CLAUDE.md             # Project context for AI-assisted editing
```

## Deploy

```bash
npx wrangler deploy
```

Uploads `public/` and serves it at `opencairn.ai` via the custom domain route in `wrangler.jsonc`. The `workers.dev` and preview URLs are disabled, so the custom domain is the only route in.

## Pre-launch state

The site is intentionally unlisted until launch:

- `public/robots.txt` disallows all crawlers, and `index.html` carries a `noindex` meta tag. Both spots are marked with a `Pre-launch` comment.
- The domain is gated by Cloudflare Access (Zero Trust); visitors authenticate with an emailed one-time PIN. This is configured in the Cloudflare dashboard, not in this repo.

At launch: delete the Access application, remove the two `Pre-launch` markers, and redeploy.

## Before going public

1. Replace the CTA `href="#"` in `public/index.html` with the actual GitHub repository URL.
2. Add legal notice content in the `#legal` section (currently hidden placeholder).
