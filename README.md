# cairn-landing

The public entry point for Cairn (project codename) — the sovereign, open source
AI inference stack. A static site: everything under `public/` is served as-is.

## Layout

```
public/
  index.html                              Page structure and the architecture diagram (no copy)
  copy/en.js, copy/fr.js                  All the text on the page, one file per language
  css/styles.css                          Styles; the color tokens at the top are placeholders
  js/app.js                               Fills in the copy, pop-ups, PNG download
  vendor/html-to-image.min.js             Renders the diagram to PNG (MIT, loaded on click)
  fonts/SpaceGrotesk-Variable.woff2       Brand typeface, from the design system (OFL)
  assets/cairn-logo.svg                   Wordmark, from the design system
  assets/cairn-ecosystem-roadmap-v3.pptx  Ecosystem Roadmap deck
  site.webmanifest, robots.txt, sitemap.xml
wrangler.jsonc                            Cloudflare Workers static assets -> opencairn.ai
```

## Editing the copy

Every word on the page, including each layer and component name and the text
of its pop-up, lives in `public/copy/en.js` (English) and `public/copy/fr.js`
(French). Both files share the same structure and list the diagram in reading
order. Edit the text between the quotes. Each file explains the few rules at its
top.

- French (Canada) is served at `/?lang=fr` and follows OQLF recommendations.
  Without `?lang=`, visitors get their last choice or their browser's language.
- A key missing from `fr.js` falls back to the English text and logs a warning
  in the browser console.
- Adding or removing a box in the diagram is a structure change: add the element
  in `index.html` (its `data-copy` value is the key path under `stack`), then the
  matching entry in both copy files.

The **Download image** button renders the diagram, with the title and credits,
to a fixed-size 3200 px PNG in the current language, whatever the visitor's
screen size.

## Develop

No build step. Serve the folder and open it:

```sh
npx wrangler dev          # or: python3 -m http.server -d public 8080
```

Opening `public/index.html` directly from disk also works for checking copy
edits, though the browser then blocks the web font, and the PNG download is less
reliable.

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
