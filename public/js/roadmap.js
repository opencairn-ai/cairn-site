/*
 * The Roadmap page: puts the items in the cells of the table.
 *
 * The table is in roadmap.html: one row for each workstream, one cell for each
 * time (now, next, later). The items are under `roadmap.workstreams` in the
 * copy files. This script holds no roadmap content.
 *
 * The detail of an item decreases with the distance. "Now" shows the title, one
 * sentence and the layer. "Next" shows the title and the layer. "Later" shows
 * the title only.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  const table = document.getElementById("roadmap");
  if (!app || !table) return;

  // A language chosen in the address stays in the address on the next page.
  const language = new URLSearchParams(location.search).get("lang");
  // Looked up one time, so a text that is missing from the French file logs one warning.
  const layerLink = app.t("roadmap.layerLink");

  for (const row of table.querySelectorAll("[data-workstream]")) {
    for (const cell of row.querySelectorAll("[data-when]")) {
      const when = cell.dataset.when;
      const items = app.t(`roadmap.workstreams.${row.dataset.workstream}.${when}`, { optional: true });
      // An empty cell gets no list.
      if (!Array.isArray(items) || !items.length) continue;
      const list = el("ul", "roadmap__items");
      for (const item of items) list.append(renderItem(item, when));
      cell.append(list);
    }
  }

  // The chosen column: the band moves behind it, its title turns Pink with the
  // cursor, its two buttons show. Nothing changes size. A click on its head (a button, for the keyboard) or
  // on one of its cells chooses it; a click on a link in a cell only follows it.
  const picks = [...table.querySelectorAll(".roadmap__pick")];
  function choose(when) {
    table.dataset.active = when;
    for (const node of table.querySelectorAll("[data-when]")) node.classList.toggle("is-active", node.dataset.when === when);
    for (const pick of picks) pick.setAttribute("aria-pressed", String(pick.parentElement.dataset.when === when));
  }
  for (const pick of picks) pick.addEventListener("click", () => choose(pick.parentElement.dataset.when));
  for (const cell of table.querySelectorAll(".roadmap__cell")) {
    cell.addEventListener("click", (event) => {
      if (!event.target.closest("a")) choose(cell.dataset.when);
    });
  }
  choose("now");

  // An item can be a text alone (its title) or { title, text, layer }.
  function renderItem(item, when) {
    const { title, text, layer } = typeof item === "string" ? { title: item } : item;
    const node = el("li", `roadmap-item roadmap-item--${when}`);
    node.append(el("span", "roadmap-item__title", title));
    if (when === "now" && text) node.append(el("span", "roadmap-item__text", text));
    const tag = when === "later" ? null : layerTag(layer);
    if (tag) node.append(tag);
    return node;
  }

  // The tag of a layer: its name on the stack page, and a link that opens the
  // pop-up of that layer (or of that component) on the stack page.
  function layerTag(path) {
    if (!path) return null;
    const name = app.t(`stack.${path.split(".")[0]}.name`, { optional: true });
    if (!name || !app.t(`stack.${path}.name`, { optional: true })) {
      console.warn(`[roadmap] "${path}" is not a layer or a component under "stack" in the copy files.`);
      return null;
    }
    const link = el("a", "roadmap-tag", name);
    link.href = `stack.html${language ? `?lang=${encodeURIComponent(language)}` : ""}#${path}`;
    link.title = layerLink.replace("{layer}", name);
    return link;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
})();
