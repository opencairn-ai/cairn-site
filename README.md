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
│   ├── index.html        # English page
│   ├── fr/index.html     # French page (EN/FR toggle links the two)
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

- `public/robots.txt` disallows all crawlers, and both `index.html` and `fr/index.html` carry a `noindex` meta tag. All three spots are marked with a `Pre-launch` comment.
- The domain is gated by Cloudflare Access (Zero Trust); visitors authenticate with an emailed one-time PIN. This is configured in the Cloudflare dashboard, not in this repo.

At launch: delete the Access application, remove the three `Pre-launch` markers, and redeploy.

## Before going public

Export the social share cards to PNG so the `og:image` / `twitter:image` URLs resolve. The
source art lives in `public/assets/images/og-cover-en.svg` and `og-cover-fr.svg`; render each to
a 1200×630 PNG at the same path (the `<meta>` tags point at `og-cover-en.png` / `og-cover-fr.png`):

```bash
npx svgexport public/assets/images/og-cover-en.svg public/assets/images/og-cover-en.png 1200:630
npx svgexport public/assets/images/og-cover-fr.svg public/assets/images/og-cover-fr.png 1200:630
```

That renderer falls back to Arial (no Space Grotesk installed); for the exact typeface, open each
SVG in a browser that has Space Grotesk and export at 1200×630 instead. After launch, validate the
cards with the Slack / X / LinkedIn link debuggers — scrapers can't reach the image while the site
is gated.
