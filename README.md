# cairn-landing

The public entry point for Cairn (project codename) — the sovereign, open source
AI inference stack. A static site: everything under `public/` is served as-is.

## Layout

```
public/
  index.html, stack.html,                 One page per tab: Hello World, Stack, Model Recipes, Roadmap.
  recipes.html, roadmap.html              Structure only, no copy. stack.html holds the architecture diagram,
                                          recipes.html the list of recipes
  copy/en.js, copy/fr.js                  All the text on the page, one file per language
  css/styles.css                          Styles; light and dark color tokens at the top
  js/app.js                               Fills in the copy; current tab, pop-ups, theme switch, PNG download
  js/recipes.js                           The Recipes page: filters, list, and the sheet of the selected recipe
  js/hello.js                             The Hello World page: the carousel of the four principles
  js/recipes-data.js                      The recipes. Generated from the stack repository; do not edit
  vendor/html-to-image.min.js             Renders the diagram to PNG (MIT, loaded on click)
  fonts/SpaceGrotesk-Variable.woff2       Brand typeface, from the design system (OFL)
  assets/cairn-logo-light.png, cairn-logo-dark.png  Header lockup, one file per theme
  assets/cairn-logo*.svg                  Wordmark used by the previous share card
  assets/og-card.png                      Share card for link previews (supplied image)
  site.webmanifest, robots.txt, sitemap.xml
reference/cairn-ecosystem-roadmap-v3.pptx Ecosystem Roadmap deck (internal, not deployed)
reference/og-card/og-card.html            Previous share card. Do not regenerate it over the PNG
tools/gen-recipes.mjs                     Writes public/js/recipes-data.js from a cairn-stack checkout (not deployed)
tools/use-cases.mjs                       The use cases of a recipe: the rules and the benchmark data they read
.github/workflows/pages.yml               Publishes public/ to GitHub Pages on every push to main
wrangler.jsonc                            Old Cloudflare Worker host, kept as the rollback during the move
```

## Pages and tabs

Each tab is one HTML file. All four files repeat the same header, with the
`<nav class="site-nav">` of the tabs inside it, after the codename: the header is
one row (two rows on narrow screens, three on phones). `<body data-page="…">`
names the page, and the script marks its tab as the current one. The tab names are under `nav` in the copy files.
To add a tab: copy `roadmap.html`, give it a new `data-page` value, add the link
to the nav of every page, and add the name under `nav` in both copy files.
Hello World is for business leaders; the stack page is for engineers. Hello World
has two columns. Left: the title of the site, the reason for Cairn, then three
points. Right: what Cairn is, with three links and a carousel of four principles
(each with a picture). Its texts are under `hello` in the copy files; the pictures
of the carousel are in `index.html`. Each picture has a motion that starts when its
slide shows: `css/styles.css` moves the parts, and `js/hello.js` makes the points
that move in the third picture. A visitor who asks the system for reduced motion
sees the pictures without motion. The stack page holds the goal and its three
points, above the schema.
Roadmap shows only its name for now.

## Recipes

The Recipes page shows the model server recipes of
[opencairn-ai/cairn-stack](https://github.com/opencairn-ai/cairn-stack)
(`recipes/<hardware>/<model>/<publisher>/<server>/`). The site holds no recipe
content of its own: `public/js/recipes-data.js` is a copy that a script writes
from a checkout of the stack repository. To update the copy:

```sh
AA_API_KEY=… HF_TOKEN=… node tools/gen-recipes.mjs ../cairn-stack     # the path to a cairn-stack checkout, on main
```

The script also gives each recipe the use cases that it fits best (Chat,
Coding, Documents). The rules are in `tools/use-cases.mjs`. They read
the facts of the recipe and two outside sources:

- [Hugging Face](https://huggingface.co): the original model of the recipe and
  its rank on benchmark leaderboards. `HF_TOKEN` is optional: the data is public.
- [Artificial Analysis](https://artificialanalysis.ai): the Intelligence Index
  of the model. `AA_API_KEY` is an API key of that service (the free tier is
  sufficient; one run uses 4 of the 100 requests a day).

The page names the two sources under the list. The terms of Artificial Analysis
require this credit.

Then commit `public/js/recipes-data.js`. The script needs Node.js 18 or later
and no packages. The first line of the data file gives the commit it came from.

- A new recipe folder shows on the page with no other change. Its filters, names
  and tags come from the folder path and the recipe files.
- The names ("GB10", "vLLM") come from the heading of the recipe `README.md`:
  `# <model> - <server> on <hardware>`. Without that heading, the page shows the
  folder names.
- The tags come from keys of `model-server-config.yaml`. Each model server names
  its keys differently, so `FACT_KEYS` in the script lists them. A new model
  server or a new kind of tag needs a new entry there, and a new tag also needs
  its text under `recipes.tags` in the copy files.
- A recipe has its own address:
  `recipes.html#<hardware>/<model>/<publisher>/<server>`.
- While the stack repository is private, the sheet does not show how to install
  a recipe and does not link to the repository. `STACK_IS_PUBLIC` in
  `public/js/recipes.js` turns both on.

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

The **Download schema** button is in the header of every page. It saves a 16:9
slide (a 3840 × 2160 PNG) in the current language and theme: the title, the
diagram, a legend that describes every layer and component with the pop-up text,
and the credits. The slide shrinks its content to fit, so it keeps fitting after
copy edits. On a page other than the stack page, the button gets the diagram from
`stack.html` when a visitor clicks it, so it needs a web server (it does not work
on a page opened from disk).

## Develop

No build step. Serve the folder and open it:

```sh
python3 -m http.server -d public 8080     # then open http://localhost:8080
```

Opening `public/index.html` directly from disk also works for checking copy
edits, though the browser then blocks the web font, and the PNG download is less
reliable.

## Content sources of truth

- Alpha facts (versions, limitations): the release notes shipped with
  [opencairn-ai/cairn-hoodoo](https://github.com/opencairn-ai/cairn-hoodoo).
- Recipes: the `recipes/` folder of
  [opencairn-ai/cairn-stack](https://github.com/opencairn-ai/cairn-stack). See
  [Recipes](#recipes).
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
