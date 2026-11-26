/*
 * The stack page: the sheet of the selected layer or component, beside the schema.
 *
 * A wide screen shows the sheet; a narrow screen keeps the pop-ups of the schema
 * (js/app.js). On a wide screen the sheet is hidden at first; a click, or Enter
 * and Space, selects a box and opens the sheet. The × of the sheet, the button
 * above it, or Escape, closes it. The sheet shows its kind, its name and its description,
 * then its facts: the layer of a component
 * and the other components of that layer, or the components of a layer. The
 * names in the facts are links to their boxes. The address names the selected
 * box: stack.html#modelAccess.modelGateway.
 *
 * window.CAIRN_STACK.select(node, { address, step }) selects a box from another
 * script; js/request-log.js gives the step of the request for that box.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  const diagram = document.getElementById("architecture");
  const sheet = document.getElementById("stack-sheet");
  if (!app || !diagram || !sheet) return;

  const t = app.t;
  const entries = app.entries();
  const byKey = new Map([...diagram.querySelectorAll("[data-copy]")].map((node) => [node.dataset.copy, node]));

  function el(tag, className, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children.filter(Boolean));
    return node;
  }

  // A link to another box of the schema: it selects that box. Pointing at the link,
  // or focusing it with the keyboard, gives its box the hover border in the schema,
  // so the reader sees where the link goes before clicking (linked views).
  function boxLink(node) {
    const button = el("button", "card__link", [entries.get(node).name]);
    button.type = "button";
    button.addEventListener("click", () => { hover(null); select(node); node.focus({ preventScroll: true }); });
    button.addEventListener("pointerenter", () => hover(node));
    button.addEventListener("pointerleave", () => hover(null));
    button.addEventListener("focus", () => hover(node));
    button.addEventListener("blur", () => hover(null));
    return button;
  }

  // The description card (js/app.js, setUpCard): its × closes the sheet and gives
  // the focus back to the selected box.
  const sheetContent = app.setUpCard(sheet, {
    closeLabel: t("diagram.sheet.close"),
    onClose: () => {
      setShown(false);
      if (selected) selected.focus({ preventScroll: true });
    },
  });

  function render(node, step) {
    const entry = entries.get(node);
    const facts = [];
    // One fact: its label above its value, in the shared card layout (.card__fact).
    const fact = (label, value, className) => facts.push(el("div", className ? `card__fact ${className}` : "card__fact", [el("dt", null, [label]), el("dd", null, [value])]));

    if (step) {
      fact(t("diagram.sheet.inRequest"), el("span", null, [el("code", null, [step.service]), " ", step.text]), "is-step");
    }
    if (entry.kind === "component") {
      const layer = node.closest(".layer");
      if (layer && entries.has(layer) && !layer.classList.contains("is-out-of-scope")) {
        // The branch with a dot before the label says "part of", as in a file tree.
        const branch = el("span", "card__branch");
        branch.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 5v9a3 3 0 0 0 3 3h6"/><circle cx="18" cy="17" r="2" fill="currentColor"/></svg>';
        fact(el("span", null, [branch, t("diagram.sheet.layer")]), boxLink(layer), "is-part-of");
        const others = [...layer.querySelectorAll(".comp")].filter((comp) => comp !== node);
        // One other component: singular, no count. Two or more: plural, with the count.
        const othersLabel = others.length === 1 ? t("diagram.sheet.alsoInLayerOne") : `${t("diagram.sheet.alsoInLayer")} (${others.length})`;
        if (others.length) fact(othersLabel, el("span", "card__links", others.map(boxLink)));
      }
    }
    if (entry.kind === "layer" || entry.kind === "crossCutting") {
      const comps = [...node.querySelectorAll(".comp")];
      // The label carries the count: "Components (4)".
      if (comps.length) fact(`${t("diagram.sheet.components")} (${comps.length})`, el("span", "card__links", comps.map(boxLink)));
      if (entry.kind === "crossCutting") fact(t("diagram.sheet.appliesTo"), t("diagram.sheet.allLayers"));
    }

    sheetContent.replaceChildren(...[
      el("p", "card__kind", [t(`diagram.kinds.${entry.kind}`)]),
      el("h2", "card__title", [entry.name]),
      el("p", "card__text", [entry.tooltip]),
      facts.length && el("dl", "card__facts", facts),
    ].filter(Boolean));
  }

  let selected = null;
  function select(node, { address = true, step = null } = {}) {
    if (!entries.has(node)) return;
    if (selected) selected.classList.remove("is-selected");
    selected = node;
    if (shown()) node.classList.add("is-selected");
    render(node, step);
    if (address) history.replaceState(null, "", `${location.pathname}${location.search}#${node.dataset.copy}`);
  }

  // The details are hidden at first: the schema takes the full width. A click
  // (or Enter and Space) on a box selects it and opens its details beside the
  // schema; Escape closes them. The button above the sheet opens or closes them
  // too. An address that names a box opens with its details.
  const toggle = document.getElementById("sheet-toggle");
  function shown() { return !document.documentElement.classList.contains("stack-sheet-hidden"); }
  function setShown(show) {
    document.documentElement.classList.toggle("stack-sheet-hidden", !show);
    sheet.hidden = !show;
    // The label of the button stays the same; the arrow turns (CSS, aria-expanded).
    if (toggle) toggle.setAttribute("aria-expanded", String(show));
    if (selected) selected.classList.toggle("is-selected", show);
    // Closed details: the address no longer names a box.
    if (!show && location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  if (toggle) toggle.addEventListener("click", () => setShown(!shown()));

  // Start: the box in the address, with its details; else Model Server, with the
  // details hidden. The button then opens the details on Model Server.
  const fromAddress = () => byKey.get(decodeURIComponent(location.hash.slice(1)));
  const start = fromAddress();
  select(start || byKey.get("modelAccess.modelServer"), { address: false });
  setShown(Boolean(start));
  window.addEventListener("hashchange", () => { const node = fromAddress(); if (node) { select(node, { address: false }); setShown(true); } });

  const targetOf = (event) => (event.target instanceof Element ? event.target.closest("[data-copy]") : null);
  const wide = () => app.sheetQuery.matches;

  // A click (or Enter and Space) on a box always selects it and opens its details,
  // even on the box already open: the × of the sheet and Escape close them.
  function open(node) {
    select(node);
    setShown(true);
  }
  diagram.addEventListener("click", (event) => {
    if (!wide()) return;
    const node = targetOf(event);
    if (node) open(node);
  });
  diagram.addEventListener("keydown", (event) => {
    if (!wide() || (event.key !== "Enter" && event.key !== " ")) return;
    const node = targetOf(event);
    if (node) { event.preventDefault(); open(node); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && wide() && shown()) setShown(false);
  });

  // Hover: the box under the pointer gets the Magenta border, with no pop-up.
  let hovered = null;
  function hover(node) {
    if (hovered === node) return;
    if (hovered) hovered.classList.remove("is-hovered");
    hovered = node;
    if (node) node.classList.add("is-hovered");
  }
  diagram.addEventListener("pointerover", (event) => { if (wide() && event.pointerType !== "touch") hover(targetOf(event)); });
  diagram.addEventListener("pointerleave", () => hover(null));

  window.CAIRN_STACK = { select, node: (key) => byKey.get(key) };
})();
