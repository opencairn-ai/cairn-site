# cairn-landing

The public entry point for Cairn (project codename) — the sovereign, open source
AI inference stack. A static site: everything under `public/` is served as-is.

## Layout

```
public/
  index.html                              Page structure and the architecture diagram (no copy)
  copy/en.js, copy/fr.js                  All the text on the page, one file per language
  css/styles.css                          Styles; light and dark color tokens at the top
  js/app.js                               Fills in the copy; pop-ups, theme switch, PNG download
  vendor/html-to-image.min.js             Renders the diagram to PNG (MIT, loaded on click)
  fonts/SpaceGrotesk-Variable.woff2       Brand typeface, from the design system (OFL)
  assets/cairn-logo*.svg                  Wordmark (deep purple and cream), from the design system
  site.webmanifest, robots.txt, sitemap.xml
reference/cairn-ecosystem-roadmap-v3.pptx Ecosystem Roadmap deck (internal, not deployed)
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
- Words wrapped in `*asterisks*` show in pink; none are highlighted now.
- A key missing from `fr.js` falls back to the English text and logs a warning
  in the browser console.
- Adding or removing a box in the diagram is a structure change: add the element
  in `index.html` (its `data-copy` value is the key path under `stack`), then the
  matching entry in both copy files.

The **Download image** button saves a 16:9 slide (a 3840 × 2160 PNG) in the
current language and theme: the title, the diagram, a legend that describes every
layer and component with the pop-up text, and the credits. The slide shrinks its
content to fit, so it keeps fitting after copy edits.

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
  (`reference/`). It stays out of `public/` so it is never deployed.
- Colors/tokens: [opencairn-ai/design-system](https://github.com/opencairn-ai/design-system)
  (`cairn-color-palette.md` is the source of truth).

## Deploy

```sh
npx wrangler deploy
```
