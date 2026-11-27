/*
 * The Roadmap page: a list in three parts (now, next, later), one line for each
 * item, as an issue list in a repository.
 *
 * The parts are in roadmap.html. The items are under `roadmap.workstreams` in
 * the copy files. This script holds no roadmap content. It puts the items of
 * each time in its part, in the order of the workstreams, and makes the
 * buttons that show the items of one workstream.
 *
 * A line: a mark that tells how sure the item is, the title, one sentence (if
 * the item has one), the workstream, and the layer as a link to the stack page.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  const list = document.getElementById("roadmap");
  const filters = document.getElementById("roadmap-filters");
  if (!app || !list || !filters) return;

  // A language chosen in the address stays in the address on the next page.
  const language = new URLSearchParams(location.search).get("lang");
  // Looked up one time, so a text that is missing from the French file logs one warning.
  const layerLink = app.t("roadmap.layerLink");

  const workstreams = Object.entries(app.t("roadmap.workstreams") || {});
  const parts = [...list.querySelectorAll(".roadmap-part")];

  // The lines, in the order of the workstreams inside each part.
  const counts = new Map(workstreams.map(([id]) => [id, 0]));
  for (const part of parts) {
    const when = part.dataset.when;
    const items = part.querySelector(".roadmap-part__items");
    for (const [id, workstream] of workstreams) {
      const entries = workstream[when];
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) items.append(renderItem(entry, when, id, workstream.name));
      counts.set(id, counts.get(id) + entries.length);
    }
  }

  // The buttons: "All", then one for each workstream, each with its number of items.
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  filters.append(filterButton("", app.t("roadmap.all"), total));
  for (const [id, workstream] of workstreams) filters.append(filterButton(id, workstream.name, counts.get(id)));
  show("");

  function filterButton(id, name, count) {
    const button = el("button", "roadmap-filter");
    button.type = "button";
    button.dataset.workstream = id;
    button.append(el("span", "roadmap-filter__name", name), el("span", "roadmap-filter__count", String(count)));
    button.addEventListener("click", () => show(id));
    return button;
  }

  // Shows the items of one workstream, or of all ("") of them. A part with no
  // items for the selected workstream says so.
  function show(id) {
    for (const button of filters.children) button.setAttribute("aria-pressed", String(button.dataset.workstream === id));
    list.classList.toggle("is-filtered", id !== "");
    for (const part of parts) {
      let shown = 0;
      for (const item of part.querySelectorAll(".roadmap-item")) {
        item.hidden = id !== "" && item.dataset.workstream !== id;
        if (!item.hidden) shown += 1;
      }
      part.querySelector(".roadmap-part__empty").hidden = shown > 0;
    }
  }

  // An item can be a text alone (its title) or { title, text, layer }.
  function renderItem(entry, when, workstream, workstreamName) {
    const { title, text, layer } = typeof entry === "string" ? { title: entry } : entry;
    const node = el("li", `roadmap-item roadmap-item--${when}`);
    node.dataset.workstream = workstream;
    const mark = el("span", "roadmap-item__mark");
    mark.setAttribute("aria-hidden", "true");
    const body = el("span", "roadmap-item__body", [el("span", "roadmap-item__title", title)]);
    if (text) body.append(el("span", "roadmap-item__text", text));
    const meta = el("span", "roadmap-item__meta", [el("span", "roadmap-item__workstream", workstreamName)]);
    const tag = layerTag(layer);
    if (tag) meta.append(tag);
    node.append(mark, body, meta);
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

  // An element with a class, and a text or a list of children.
  function el(tag, className, content) {
    const node = document.createElement(tag);
    node.className = className;
    if (Array.isArray(content)) node.append(...content);
    else if (content != null) node.textContent = content;
    return node;
  }
})();
