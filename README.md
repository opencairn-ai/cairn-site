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

See the **Launch checklist** below for the exact go-live steps.

## Launch checklist

Steps 1–3 are safe to stage in advance — the Cloudflare Access gate keeps the site private until
step 4, which is the actual go-live switch. Do them in order.

1. Remove the indexing blocks (each marked with a `Pre-launch` comment):
   - [ ] `public/index.html` — delete the comment and the `<meta name="robots" content="noindex, nofollow">` line
   - [ ] `public/fr/index.html` — same two lines
   - [ ] `public/robots.txt` — replace the `Disallow: /` block with the launch version (below)
2. [ ] Redeploy with the markers gone: `npx wrangler deploy` (the site stays gated by Access)
3. [ ] Confirm the gate still holds — an unauthenticated request should redirect to Cloudflare Access, not serve the page. `curl -sI https://opencairn.ai/ | grep -i location` should return a `cloudflareaccess.com` login URL. If you get `200` and page HTML, stop and re-check Access before continuing.
4. [ ] Delete the Cloudflare Access application in the Zero Trust dashboard — this is the go-live switch that makes the site public. Nothing in this repo changes.
5. [ ] Verify it's live — in a fresh incognito window, `https://opencairn.ai/` and `/fr/` load without a login, and `https://opencairn.ai/robots.txt` shows `Allow: /`.

Launch version of `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://opencairn.ai/sitemap.xml
```

After launch:

- [ ] Validate the social cards with the Slack / X / LinkedIn link debuggers — scrapers could not reach `og-cover-*.png` while the site was gated.
- [ ] Optionally submit `https://opencairn.ai/sitemap.xml` in Google Search Console.

### Copy awaiting sign-off

Two edits were flagged during review but held for partner approval — decide on these before or at launch:

- [ ] `public/index.html` — "your data centre" → "your data center" (US spelling, per the style guide)
- [ ] The "eight layers" sentence in both pages uses em-dashes, which the style guide disallows; reword if the rule still holds.
