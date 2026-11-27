# Templates

The shared pieces of the site. A new page builds with these instead of new styles,
so every page keeps the same sizes, colors and behavior. LaStack (`stack.html`) and
Model Recipes (`recipes.html`) use them; Model Recipes uses all of them.

Styles are in `public/css/styles.css` (the tokens and the page templates are
marked `TEMPLATE`; the others are found by their class names below), the shared
script in `public/js/app.js` (`window.CAIRN_APP`, section `Templates`). Texts always come from the copy files
(`copy/en.js`, `copy/fr.js`): a template never holds words of its own.

## Rules every template follows

- **Type scale.** Font sizes are whole, even pixels from one scale: 10, 12, 14,
  16, 18, 20, 24, 28, 32, 36, 48, 80. The root is 16px on every screen.
- **One button format.** 34px high: 14px medium text, 16px icons, 8 x 14px
  padding, 1px line, 6px corners. Filters are pills (round ends), so they never
  read as buttons.
- **Two link signs.** A solid underline is a link. An ⓘ after a word is an
  explanation (it opens a pop-up, it is not a link). An ↗ marks a link that leaves
  the site, and nothing else.
- **No beige text on dark.** Captions are the neutral grey (`--color-text-muted`).
- **Contrast.** Text is 4.5:1 or more on its ground; the one documented exception
  is "Server side" in the schema (light, 4.1:1).

## Tokens

Colors of the templates, at the root of `styles.css` (`TEMPLATE TOKENS`), light
and dark. Use the token, never the color.

| Token | Use |
|---|---|
| `--panel-bg`, `--panel-line` | The data panel (the ground of the page), its 1px line, the line under titles and tabs |
| `--panel-head-bg` | The band of column titles (light: #EBDFCF, between Sand and Cream; dark: #402C4C) |
| `--card-accent` | The rule over a card, its kind and its section titles (light: Mid purple; dark: Pale purple) |
| `--mark-yes` | The check of a yes (light: Moss #5C7065; dark: River #63BCC1) |
| `--mark-no` | The cross of a no (light: Stone #A08F79; dark: the caption grey) |
| `--field-bg` | A filter pill |
| `--select-band` | A filter pill with a choice (light: Beige #D0C2B1; dark: #614972) |
| `--row-hover-bg`, `--row-hover-ink` | The row or menu item under the pointer (dark: Pale purple 30%, white words) |
| `--row-selected-bg`, `--row-selected-ink` | The selected row or chosen menu item (dark: Pale purple, Deep purple words) |
| `--row-rule` | The line between two rows |
| `--scroll-shade` | The shade at the bottom of a panel that scrolls |
| `--menu-line` | The border of an open menu |
| `--menu-selected-bg` | The chosen item of a menu (light: Marshmallow #F5E8FF; dark: Pale purple); a ticked box is filled with the item's ink |
| `--code-bg` | The code block |

## 1. Page intro

The H1, then the lead text (16px regular, in the title ink).

```html
<section class="intro">
  <h1 data-text="page.title"></h1>
  <p class="page-lead" data-text="page.lead"></p>
</section>
```

## 2. Section bar

A section heading (28px medium) with a hint under it; 42px above it.

```html
<div class="section-bar">
  <div class="section-bar__text">
    <h2 class="section-heading" data-text="page.heading"></h2>
    <p class="hint" data-text="page.hint"></p>
  </div>
</div>
```

## 3. Toolbar

Filters on the left, the card button on the right, centered on one line. It spans
the page, so the button lines up with the right edge of the card.

```html
<div class="toolbar">
  <div class="filters" id="page-filters" role="group"></div>
  <button type="button" class="sheet-toggle" aria-controls="page-card" aria-expanded="true">
    <span class="sheet-toggle__label" data-text="page.card.title"></span>
    <span class="sheet-toggle__chevron" aria-hidden="true"></span>
  </button>
</div>
```

## 4. Filter pill and menu

A pill that opens a menu: "Name: Value". One choice, or several (`multiple`):
a box to tick before each choice, the menu stays open, the pill reads
"Chat (+2)". "All" clears the choice. Keyboard and screen readers: a select-only
combobox.

```js
filters.append(app.filterMenu({
  id: "page-filter-hardware",
  name: t("page.filters.hardware"),          // "Hardware"
  nameText: t("page.filters.hardwareColon"), // "Hardware:" (French: "Matériel :")
  all: t("page.filters.all"),
  options: [{ id: "cpu", label: "CPU" }],
  value: state.hardware,                     // "" for all; with multiple: []
  multiple: false,
  onChange: (value) => { state.hardware = value; drawFilters(); drawTable(); },
}));
```

`onChange` must draw the filters again: the template reopens a `multiple` menu
on the same choice by its `id`.

## 5. Data table

A rounded panel with the line of the schema boxes. Column titles are 12px spaced
capitals in the caption grey on a band; values after the first column are 14px.
Rows: hover and selection from the tokens; every row ends with a › arrow (a click
opens the item in the card). The panel ends at its last row and scrolls inside
past 70% of the window. The first column fits its content; the others share the
rest.

```html
<section class="data-panel">
  <div class="data-panel__scroll">
    <table class="data-table">
      <thead>…</thead>
      <tbody>
        <tr class="data-table__row is-selected">…</tr>
      </tbody>
    </table>
  </div>
</section>
```

A column title with an explanation: `<span class="explain">Context</span>`
(the ⓘ comes from CSS; the pop-up from the page script).

## 6. Yes / no marks

A check (yes) or a cross (no). In a table cell the word is for screen readers;
in a card the word follows the mark.

```js
cell.append(app.mark(on, { yes: t("yes"), no: t("no") }));
fact.append(app.mark(on, { yes: t("yes"), no: t("no"), word: true }));
```

## 7. Description card

The card beside the table or the schema: a Pale purple rule, the kind, the title,
the text, the facts (label above value), the × to close. Two columns of facts with
`card__facts--two`; one rule between two groups of facts (`is-group-start` on the
first fact of the second group).

```html
<aside class="card" id="page-card"></aside>
```

```js
const content = app.setUpCard(card, { closeLabel: t("page.card.close"), onClose: hideCard });
content.replaceChildren(/* .card__kind, .card__title, .card__text, dl.card__facts */);
```

## 8. Tabs

Classic tabs: one line under all of them, names in the body font 20px apart, the
open one in the title ink with a 2px Pink line.

```html
<div class="tabs">
  <button type="button" class="tab" aria-pressed="true">model-server-config.yaml</button>
  <button type="button" class="tab" aria-pressed="false">compose.yaml</button>
</div>
```

## 9. Code block and Copy

A dark panel in both themes. `code-block--file` has one height (26rem) so the card
keeps its size; long lines wrap. The Copy button has the button format with a copy
icon.

```js
const pre = document.createElement("pre");
pre.textContent = content;
const block = document.createElement("div");
block.className = "code-block code-block--file";
block.append(pre, app.copyButton(() => content, { copy: t("copy"), copied: t("copied"), failed: t("copyFailed") }));
```
