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
  assets/og-card.png                      Share card for link previews (from reference/og-card/)
  site.webmanifest, robots.txt, sitemap.xml
reference/cairn-ecosystem-roadmap-v3.pptx Ecosystem Roadmap deck (internal, not deployed)
reference/og-card/og-card.html            Share card source; how to regenerate it is inside
.github/workflows/pages.yml               Publishes public/ to GitHub Pages on every push to main
wrangler.jsonc                            Old Cloudflare Worker host, kept as the rollback during the move
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
python3 -m http.server -d public 8080     # then open http://localhost:8080
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

Merging to `main` publishes the site. The **Deploy to GitHub Pages** workflow
(`.github/workflows/pages.yml`) uploads `public/` and nothing else, so
`reference/` stays private. To publish again without a new commit, run the
workflow from the Actions tab. To undo a bad deploy, revert the commit on `main`.

opencairn.ai goes through the Cloudflare proxy (for analytics) to GitHub Pages.
Cloudflare and browsers can keep CSS, JS and images for up to 10 minutes, so a
change can take that long to show for every visitor.

**Move in progress:** until the opencairn.ai DNS records point to GitHub Pages,
the Cloudflare Worker in `wrangler.jsonc` still serves the site
(`npx wrangler deploy`). That file stays as the rollback until the move ends.
