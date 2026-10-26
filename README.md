# cairn-landing

The public entry point for Cairn (project codename) — the sovereign, open source
AI inference stack. A static site: everything under `public/` is served as-is.

## Layout

```
public/
  assets/cairn-ecosystem-roadmap-v3.pptx  Ecosystem Roadmap deck
  site.webmanifest, robots.txt, sitemap.xml
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
  (`cairn-color-palette.md` is the source of truth).

## Deploy

```sh
npx wrangler deploy
```
