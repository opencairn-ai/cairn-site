# cairn-landing

The public entry point for Cairn (project codename) — the sovereign, open source
AI inference stack. A static, read-only site: one HTML document, one stylesheet,
zero JavaScript, zero cookies, zero trackers.

## Layout

```
public/
  index.html                              the entire site (sections 01-10)
  css/styles.css                          Cairn design-system tokens, dark theme
  assets/cairn-ecosystem-roadmap-v3.pptx  Ecosystem Roadmap deck (referenced by 05/06/07)
  favicon.svg, site.webmanifest, robots.txt, sitemap.xml
wrangler.jsonc                            Cloudflare Workers static assets -> opencairn.ai
```

## Develop

No build step. Serve the folder and open it:

```sh
npx wrangler dev          # or: python3 -m http.server -d public 8080
```

## Content sources of truth

- Alpha facts (versions, recipes, limitations): the release notes shipped with
  [opencairn-ai/cairn-hoodoo](https://github.com/opencairn-ai/cairn-hoodoo).
- Narrative, architecture, roadmap, audiences: the Ecosystem Roadmap deck
  (`public/assets/`).
- Colors/tokens: [opencairn-ai/design-system](https://github.com/opencairn-ai/design-system)
  (`cairn-color-palette.md` is the source of truth; keep `styles.css` aligned).

Conventions:

- ASCII diagrams live in `<pre>` blocks; escape every `<` as `&lt;` or the
  browser eats it as a bogus tag.
- Section 09 is the press-release placeholder; fill it when the statement ships.
- Section 10 (Model Fingerprint) documents how this page was built. Update its
  numbers if you regenerate the page.

## Deploy

```sh
npx wrangler deploy
```

Before going public: remove the `Disallow` line from `public/robots.txt`.
