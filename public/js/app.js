/*
 * Fills each page with the copy from copy/en.js or copy/fr.js and marks the
 * current tab. On every page, the download button saves the diagram of the stack
 * page as a PNG. On the stack page, it also shows the architecture pop-ups. The Hello World page and the Recipes page have
 * their own scripts (js/hello.js, js/recipes.js), which use the copy lookup that
 * this script shares.
 */
(() => {
  "use strict";

  const ALL_COPY = window.CAIRN_COPY || {};
  const LANGUAGES = ["en", "fr"];
  // The language tag the page declares for each ?lang= value.
  const LOCALES = { en: "en", fr: "fr-CA" };
  const DEFAULT_LANGUAGE = "en";
  const LANGUAGE_KEY = "cairn-language";
  // The pages that have no content yet. Each link to one of them (its tab, a button)
  // shows as disabled and does not open the page. Remove a name to open its page.
  const PAGES_TO_COME = ["roadmap"];

  const lang = pickLanguage();
  const copy = ALL_COPY[lang] || ALL_COPY[DEFAULT_LANGUAGE];
  if (!copy) {
    console.error("[copy] No copy file loaded. Check copy/en.js for a syntax error.");
    return;
  }

  // The page's tab: the data-page value on <body>, which is also its key under `nav`.
  const page = document.body.dataset.page;
  // Only the stack page has the diagram. On another page, the download button
  // gets the diagram from the stack page (see ensureDiagram).
  let diagram = document.getElementById("architecture");
  const entries = new Map();

  // For the script of a single page (js/hello.js, js/recipes.js): the copy lookup, the
  // language tag of the page, and the mark of an external link.
  // The stack page shows the selected box in a sheet beside the schema on a wide
  // screen (js/stack.js). Then the pop-ups of the schema stay off.
  const SHEET_QUERY = matchMedia("(min-width: 901px) and (min-aspect-ratio: 1/1)");
  const usesSheet = () => Boolean(document.getElementById("stack-sheet")) && SHEET_QUERY.matches;

  // The description card of the stack and Recipes pages (class .card): the × in its
  // top right corner, and a live region for its content. The × stays outside the
  // live region, so a screen reader reads the new content, not the name of the ×.
  // Each page fills the content and decides what closing does.
  function setUpCard(card, { closeLabel, onClose }) {
    const close = document.createElement("button");
    close.type = "button";
    close.className = "card__close";
    close.setAttribute("aria-label", closeLabel);
    close.title = closeLabel;
    close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.758 17.243 12 12m5.243-5.243L12 12m0 0L6.758 6.757M12 12l5.243 5.243"/></svg>';
    close.addEventListener("click", onClose);
    const content = document.createElement("div");
    content.className = "card__content";
    content.setAttribute("aria-live", "polite");
    card.replaceChildren(close, content);
    return content;
  }

  // --- Templates (see TEMPLATES.md) -------------------------------------------
  // Shared pieces any page can build with. Each returns an element; the page puts
  // it in place and gives the texts in its own language.

  // An element with a class and children, skipping empty children.
  function make(tag, className, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children.filter(Boolean));
    return node;
  }

  // A 24-unit line icon, painted in the text color.
  function strokeIcon(d, className) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", className);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.append(path);
    return svg;
  }

  const CHECK = "M5 12.5 10 17.5 19.5 7";
  const CROSS = "M7 7l10 10M17 7 7 17";

  // Yes or no: a check or a cross (class .mark, .is-on for yes). With `word`, the
  // word follows the mark (the card); without, the word is for screen readers only
  // (the table).
  function mark(on, { yes, no, word = false }) {
    const label = on ? yes : no;
    return make("span", `mark${word ? " card__yesno" : ""}${on ? " is-on" : ""}`, [
      strokeIcon(on ? CHECK : CROSS, "mark__icon"),
      word ? label : make("span", "sr-only", [label]),
    ]);
  }

  // The Copy button of a code block: a copy icon, then the word; after a click
  // only the word changes ("Copied"), so the icon stays.
  function copyButton(getText, { copy, copied, failed }) {
    const word = make("span", null, [copy]);
    const button = make("button", "copy-button", [strokeIcon("M9 9h10v10H9zM5 15V5h10", "copy-button__icon"), word]);
    button.type = "button";
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(getText()); word.textContent = copied; }
      catch { word.textContent = failed; }
      setTimeout(() => { word.textContent = copy; }, 1600);
    });
    return button;
  }

  // A filter: a pill that opens a menu (the design system's dropdown menu). For
  // screen readers and the keyboard it is a select-only combobox: the pill keeps
  // the focus and the arrow keys move the active choice. One choice, or with
  // `multiple` a box to tick before each choice, several at once, the menu staying
  // open; "All" clears the choice. The pill reads "Name: Value", "Name: First (+2)".
  //   id        the id of the pill; the menu is `${id}-list`
  //   name      the name of the filter ("Hardware"); nameText the same with its colon
  //   all       the word for no choice ("All")
  //   options   [{ id, label }]
  //   value     the chosen id ("" for all), or with `multiple` the chosen ids ([])
  //   onChange  (value) => the page saves the value and draws its filters again
  let reopenFilter = null;
  function filterMenu({ id, name, nameText, all, options, value, multiple = false, onChange }) {
    const items = [{ id: "", label: all }, ...options];
    const ticked = multiple ? value : (value ? [value] : []);
    const chosen = options.filter((option) => ticked.includes(option.id));
    const isSelected = (item) => (item.id ? ticked.includes(item.id) : !ticked.length);
    let active = reopenFilter && reopenFilter.id === id ? reopenFilter.active : Math.max(0, items.findIndex(isSelected));

    const list = make("ul", `filter-menu${multiple ? " filter-menu--multiple" : ""}`, [
      make("li", "filter-menu__label", [name]),
      ...items.map((item, index) => {
        const selected = isSelected(item);
        const box = multiple && item.id && make("span", `filter-menu__box${selected ? " is-ticked" : ""}`, [selected && strokeIcon(CHECK, "filter-menu__tick")]);
        const option = make("li", "filter-menu__item", [box, item.label, selected && !multiple && strokeIcon(CHECK, "filter-menu__check")]);
        option.id = `${id}-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(selected));
        option.addEventListener("click", () => choose(index));
        option.addEventListener("pointermove", () => setActive(index));
        return option;
      }),
    ]);
    list.id = `${id}-list`;
    list.hidden = true;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", name);
    if (multiple) list.setAttribute("aria-multiselectable", "true");
    list.firstChild.setAttribute("role", "presentation");
    // A press on the menu must not take the focus from the pill: the menu closes when the pill loses it.
    list.addEventListener("pointerdown", (event) => event.preventDefault());

    const shown = chosen.length ? `${chosen[0].label}${chosen.length > 1 ? ` (+${chosen.length - 1})` : ""}` : all;
    const button = make("button", "filter-pill", [
      make("span", "filter-pill__name", [nameText]),
      make("span", "filter-pill__value", [shown]),
      strokeIcon("m6 9 6 6 6-6", "filter-pill__caret"),
    ]);
    button.type = "button";
    button.id = id;
    button.dataset.chosen = String(chosen.length > 0);
    button.setAttribute("role", "combobox");
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-controls", list.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `${name}: ${chosen.length ? chosen.map((option) => option.label).join(", ") : all}`);

    const optionNodes = () => [...list.querySelectorAll('[role="option"]')];
    const isOpen = () => !list.hidden;
    function setActive(index) {
      active = (index + items.length) % items.length;
      optionNodes().forEach((option, i) => option.classList.toggle("is-active", i === active));
      button.setAttribute("aria-activedescendant", optionNodes()[active].id);
      optionNodes()[active].scrollIntoView({ block: "nearest" });
    }
    function open() { list.hidden = false; button.setAttribute("aria-expanded", "true"); setActive(active); }
    function close() { list.hidden = true; button.setAttribute("aria-expanded", "false"); button.removeAttribute("aria-activedescendant"); }
    function choose(index) {
      const itemId = items[index].id;
      const next = !multiple ? itemId : !itemId ? [] : ticked.includes(itemId) ? ticked.filter((t) => t !== itemId) : [...ticked, itemId];
      // Several choices: the menu stays open on the same choice after the page draws it again.
      reopenFilter = multiple ? { id, active: index } : null;
      onChange(next);
      const again = document.getElementById(id);
      if (again) { again.focus(); if (reopenFilter) again.dispatchEvent(new CustomEvent("filter-reopen")); }
      reopenFilter = null;
    }

    button.addEventListener("click", () => (isOpen() ? close() : open()));
    button.addEventListener("filter-reopen", open);
    button.addEventListener("blur", close);
    button.addEventListener("keydown", (event) => {
      const { key } = event;
      if (key === "Escape") { if (isOpen()) { event.preventDefault(); close(); } return; }
      if (key === "Tab") return;
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
        event.preventDefault();
        if (!isOpen()) return open();
        return setActive(key === "ArrowDown" ? active + 1 : key === "ArrowUp" ? active - 1 : key === "Home" ? 0 : items.length - 1);
      }
      if (key === "Enter" || key === " ") { event.preventDefault(); return isOpen() ? choose(active) : open(); }
      // A letter goes to the next choice that starts with it.
      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const order = items.map((_, i) => (active + 1 + i) % items.length);
        const match = order.find((i) => items[i].label.toLowerCase().startsWith(key.toLowerCase()));
        if (match !== undefined) { if (!isOpen()) open(); setActive(match); }
      }
    });
    return make("div", "filter", [button, list]);
  }

  window.CAIRN_APP = { t, locale: LOCALES[lang], externalIcon, entries: () => entries, sheetQuery: SHEET_QUERY, setUpCard, filterMenu, mark, copyButton };

  renderPage();
  setUpTheme();
  if (diagram) {
    renderDiagram();
    setUpTooltips();
  }
  if (document.getElementById("download")) setUpDownload();

  // --- Language ------------------------------------------------------------

  // An explicit ?lang= wins and is remembered; otherwise the last choice,
  // then the browser's preferred languages.
  function pickLanguage() {
    const requested = new URLSearchParams(location.search).get("lang");
    if (LANGUAGES.includes(requested) && ALL_COPY[requested]) {
      remember(LANGUAGE_KEY, requested);
      return requested;
    }
    const saved = recall(LANGUAGE_KEY);
    if (LANGUAGES.includes(saved) && ALL_COPY[saved]) return saved;
    const preferred = (navigator.languages || [navigator.language || ""])
      .map((tag) => tag.slice(0, 2).toLowerCase())
      .find((code) => LANGUAGES.includes(code) && ALL_COPY[code]);
    return preferred || DEFAULT_LANGUAGE;
  }

  function remember(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
  }

  function recall(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  // --- Copy lookup ---------------------------------------------------------

  function lookup(source, path) {
    return path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), source);
  }

  // Missing French text falls back to English, with a console warning so the
  // gap is easy to spot. `optional` silences the warning when neither has it.
  function t(path, { optional = false } = {}) {
    const value = lookup(copy, path);
    if (value !== undefined) return value;
    const fallback = lookup(ALL_COPY[DEFAULT_LANGUAGE], path);
    if (fallback !== undefined) {
      console.warn(`[copy] "${path}" is missing from copy/${lang}.js; showing the English text.`);
      return fallback;
    }
    if (!optional) console.warn(`[copy] "${path}" is missing from the copy files.`);
    return "";
  }

  // --- Page ----------------------------------------------------------------

  function renderPage() {
    document.documentElement.lang = LOCALES[lang];
    // The stack page has its own title. The other pages use the name of their tab.
    const title = page === "stack" ? t("meta.title") : t("meta.pageTitle").replace("{page}", t(`nav.${page}`));
    document.title = title;
    setContent('meta[name="description"]', t("meta.description"));
    setContent('meta[property="og:title"]', title);
    setContent('meta[property="og:description"]', t("meta.description"));

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && lang !== DEFAULT_LANGUAGE) {
      const url = new URL(canonical.href);
      url.searchParams.set("lang", lang);
      canonical.href = url.href;
    }

    for (const node of document.querySelectorAll("[data-text]")) setText(node, t(node.dataset.text));
    for (const node of document.querySelectorAll("[data-href]")) node.href = t(node.dataset.href);
    for (const node of document.querySelectorAll("[data-aria-label]")) {
      node.setAttribute("aria-label", t(node.dataset.ariaLabel));
    }

    // One language button: only the link to the other language shows.
    for (const link of document.querySelectorAll(".lang a")) link.hidden = link.hreflang === LOCALES[lang];

    renderNav();

    // The three points under the title: the goal on the stack page (`intro.points`),
    // or the copy that the page names in data-points.
    const goalPoints = document.getElementById("goal-points");
    if (goalPoints) {
      goalPoints.replaceChildren(
        ...(t(goalPoints.dataset.points || "intro.points") || []).map((point) =>
          el("li", "goal__point", [
            el("span", "goal__point-title", point.title),
            el("span", "goal__point-text", point.text),
          ])
        )
      );
    }

    // Footer lockup (Figma 28:11885 / 28:12003): text and SVG marks on one row.
    const brand = document.getElementById("collaboration");
    if (brand) {
      const logoLink = (key) => {
        const link = el("a", "footer-brand__logo");
        link.href = t(`footer.${key}.url`);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", t(`footer.${key}.name`));
        return link;
      };
      const image = (file, width, height) => {
        const img = document.createElement("img");
        img.src = `assets/hello/${file}`;
        img.alt = "";
        img.width = width;
        img.height = height;
        return img;
      };
      const mozilla = logoLink("mozilla");
      mozilla.classList.add("footer-brand__mozilla");
      mozilla.append(image("footer-mozilla.svg", 87.992, 21.05));
      const mila = logoLink("mila");
      mila.classList.add("footer-brand__mila");
      const mark = image("footer-mila-mark.svg", 19.249, 18.756);
      const word = image("footer-mila-word.svg", 42.568, 18.755);
      mark.classList.add("footer-brand__mila-mark");
      word.classList.add("footer-brand__mila-word");
      mila.append(mark, word);

      const logos = el("span", "footer-logos");
      logos.append(mozilla, el("span", "footer-brand__x", "x"), mila);

      brand.className = `footer-brand footer-brand--${lang}`;
      brand.setAttribute("role", "group");
      brand.setAttribute("aria-label", t("footer.collaboration"));
      brand.replaceChildren(
        el("span", "footer-brand__a", t("footer.a")),
        logos,
        el("span", "footer-brand__role", t("footer.role"))
      );
    }
  }

  // Marks the current tab and prepares the links between pages (the tabs and the logo).
  function renderNav() {
    const nav = document.querySelector(".site-nav");
    const explicit = new URLSearchParams(location.search).has("lang");
    for (const link of document.querySelectorAll("a[data-page]")) {
      // A page to come: the link keeps its name, but has no address, so it does not
      // take a click or the keyboard focus. Its tab is disabled on every page,
      // its own page included.
      if (PAGES_TO_COME.includes(link.dataset.page)) {
        link.removeAttribute("href");
        link.setAttribute("role", "link");
        link.setAttribute("aria-disabled", "true");
        continue;
      }
      let href = link.getAttribute("href");
      // A page opened from disk has no server to turn "./" into index.html.
      if (href === "./" && location.protocol === "file:") href = "index.html";
      // A language chosen in the address stays in the address on the next page.
      if (explicit) href += `?lang=${lang}`;
      link.setAttribute("href", href);
    }
    if (!nav) return;
    // A disabled tab is never the current one, not even on its own page.
    const current = nav.querySelector(`a[data-page="${page}"]:not([aria-disabled="true"])`);
    if (!current) return;
    current.setAttribute("aria-current", "page");
    // On a phone the tabs scroll sideways: bring the current tab into view, and
    // again when the web font arrives, because it changes the width of the tabs.
    const reveal = () => {
      const tab = current.getBoundingClientRect();
      const row = nav.getBoundingClientRect();
      const gutter = parseFloat(getComputedStyle(nav).paddingRight);
      nav.scrollLeft += Math.max(0, tab.right - row.right + gutter);
    };
    reveal();
    if (document.fonts) document.fonts.ready.then(reveal);
  }

  // Words wrapped in *asterisks* in the copy become a pink highlight.
  // Words wrapped in _underscores_ are in italic.
  function setText(node, text) {
    const italic = (part) => part.split(/_([^_]+)_/).map((piece, i) => (i % 2 ? el("em", null, piece) : piece));
    node.replaceChildren(...text.split(/\*([^*]+)\*/).flatMap((part, i) => (i % 2 ? [el("mark", "hl", part)] : italic(part))));
  }

  function setContent(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function footerText() {
    return t("footer.collaboration").replace(/\{(\w+)\}/g, (_, key) => t(`footer.${key}.name`));
  }

  // --- Theme ---------------------------------------------------------------

  // The page opens in dark (set in the head). The header button switches theme
  // for the current visit; it no longer remembers a choice or follows the system.
  function setUpTheme() {
    const button = document.getElementById("theme-toggle");
    const themeColor = document.querySelector('meta[name="theme-color"]');

    function apply(theme) {
      document.documentElement.dataset.theme = theme;
      const label = t(theme === "dark" ? "header.themeToLight" : "header.themeToDark");
      button.setAttribute("aria-label", label);
      button.title = label;
      if (themeColor) themeColor.content = getComputedStyle(document.body).backgroundColor;
    }

    apply(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      apply(next);
    });
  }

  // --- Diagram -------------------------------------------------------------

  function renderDiagram() {
    // A layer gets the Alpha mark when one of its components has it.
    for (const layer of diagram.querySelectorAll(".layer")) {
      if (layer.querySelector('.comp[data-status="alpha"]')) layer.dataset.status = "alpha";
    }

    for (const node of diagram.querySelectorAll("[data-copy]")) {
      const key = `stack.${node.dataset.copy}`;
      const entry = {
        kind: kindOf(node),
        name: t(`${key}.name`),
        detail: t(`${key}.detail`, { optional: true }),
        tooltip: t(`${key}.tooltip`),
        status: node.dataset.status,
      };

      // Screen readers get the status and the pop-up text inline, right after the name.
      const name = entry.status ? nameWithMark(entry.name, entry.status) : entry.name;
      const label = el("span", "label", [el("span", "label__name", name)]);
      if (entry.detail) label.append(el("span", "label__detail", entry.detail));
      const status = entry.status ? `. ${t(`diagram.status.${entry.status}`)}` : "";
      label.append(el("span", "sr-only", `${status}. ${entry.tooltip}`));

      node.prepend(label);
      node.tabIndex = 0;
      entries.set(node, entry);
    }

    // The legend above the schema is on the stack page only.
    const legend = document.getElementById("status-legend");
    if (legend) legend.replaceChildren(...statusLegend());
  }

  // One item per status shown on the diagram: its mark and its label. Empty when
  // no box has a status. Also used in the downloaded image.
  function statusLegend() {
    const statuses = new Set([...entries.values()].map((entry) => entry.status).filter(Boolean));
    return [...statuses].map((status) => el("li", null, [statusMark(status), t(`diagram.status.${status}`)]));
  }

  // Joins the mark to the last word of the name, so a line break cannot leave
  // the mark alone on a line.
  function nameWithMark(name, status) {
    const at = name.lastIndexOf(" ") + 1;
    return [name.slice(0, at), el("span", "label__tail", [name.slice(at), statusMark(status)])];
  }

  function statusMark(status) {
    const mark = el("span", "status-mark");
    mark.dataset.status = status;
    mark.setAttribute("aria-hidden", "true");
    return mark;
  }

  function kindOf(node) {
    if (node.classList.contains("local-api")) return "endpoint";
    if (node.classList.contains("comp")) return "component";
    if (node.classList.contains("layer--cross")) return "crossCutting";
    if (node.classList.contains("layer")) return "layer";
    return "boundary";
  }

  // --- Pop-ups -------------------------------------------------------------

  function setUpTooltips() {
    const tip = document.getElementById("tip");
    const tipKind = tip.querySelector(".tip__kind");
    const tipName = tip.querySelector(".tip__name");
    const tipText = tip.querySelector(".tip__text");
    const tipStatus = tip.querySelector(".tip__status");
    const tipBadge = tipStatus.querySelector(".pill");
    let active = null;

    // Phones show the pop-up as a panel along the bottom of the screen (.tip--sheet).
    const sheetQuery = matchMedia("(max-width: 640px), (max-height: 500px)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    const targetOf = (event) => (event.target instanceof Element ? event.target.closest("[data-copy]") : null);

    function show(node) {
      if (usesSheet()) return hide();
      if (!node) return hide();
      if (node === active) return;
      if (active) active.classList.remove("is-active");
      active = node;
      node.classList.add("is-active");

      const entry = entries.get(node);
      tipKind.textContent = t(`diagram.kinds.${entry.kind}`);
      tipName.textContent = entry.name;
      tipText.textContent = entry.tooltip;
      tipStatus.hidden = !entry.status;
      if (entry.status) {
        tipBadge.dataset.status = entry.status;
        tipBadge.textContent = t(`diagram.status.${entry.status}`);
      }
      place(node);
      tip.classList.add("is-visible");
    }

    function hide() {
      if (active) active.classList.remove("is-active");
      active = null;
      tip.classList.remove("is-visible");
    }

    // Above the box when there is room, otherwise below; always on screen.
    // Layers anchor on their name, components on their whole box.
    function place(node) {
      const anchor = node.classList.contains("layer") ? node.querySelector(":scope > .label") : node;
      if (sheetQuery.matches) {
        tip.classList.add("tip--sheet");
        tip.style.transform = "";
        return;
      }
      tip.classList.remove("tip--sheet");

      const box = anchor.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const margin = 8;
      const gap = 8;

      tip.style.transform = "translate(0, 0)";
      const { width, height } = tip.getBoundingClientRect();

      let top = box.top - height - gap;
      if (top < margin) top = box.bottom + gap;
      top = Math.max(margin, Math.min(top, viewportHeight - height - margin));

      let left = box.left + box.width / 2 - width / 2;
      left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

      tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    }

    // Scrolls the tapped item up when the panel would cover it.
    function revealAboveSheet(node) {
      const anchor = node.classList.contains("layer") ? node.querySelector(":scope > .label") : node;
      const panelTop = document.documentElement.clientHeight - tip.offsetHeight;
      const covered = anchor.getBoundingClientRect().bottom - panelTop + 12;
      if (covered > 0) window.scrollBy({ top: covered, behavior: reducedMotion.matches ? "auto" : "smooth" });
    }

    diagram.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "touch") show(targetOf(event));
    });
    diagram.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "touch") hide();
    });

    // Taps (and clicks) pin the pop-up until the next tap elsewhere. The panel
    // scrolls the page only once the tap is over, so the click cannot land on
    // whatever moved under the finger.
    diagram.addEventListener("click", (event) => {
      tapping = false;
      const node = targetOf(event);
      show(node);
      if (node && sheetQuery.matches) setTimeout(() => revealAboveSheet(node), 0);
    });

    // A tap focuses the box before its click arrives. Leave the opening to the
    // click, or the panel could slide in under the finger and catch the click.
    let tapping = false;
    diagram.addEventListener("pointerdown", (event) => { tapping = event.pointerType === "touch"; });
    diagram.addEventListener("pointercancel", () => { tapping = false; });
    document.addEventListener("click", (event) => {
      if (!diagram.contains(event.target)) hide();
    });

    diagram.addEventListener("focusin", (event) => {
      if (!tapping) show(targetOf(event));
    });
    diagram.addEventListener("focusout", (event) => {
      if (!diagram.contains(event.relatedTarget)) hide();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
    });
    // The bottom panel stays open while the page scrolls; mobile browsers also
    // resize the page as their toolbars show and hide.
    const hideUnlessSheet = () => { if (!sheetQuery.matches) hide(); };
    window.addEventListener("scroll", hideUnlessSheet, { passive: true });
    window.addEventListener("resize", hideUnlessSheet);
  }

  // --- Download ------------------------------------------------------------

  function setUpDownload() {
    const button = document.getElementById("download");
    const label = button.querySelector("[data-text]");
    let resetTimer;

    button.addEventListener("click", async () => {
      if (button.getAttribute("aria-busy") === "true") return;
      clearTimeout(resetTimer);
      button.classList.remove("is-error");
      button.setAttribute("aria-busy", "true");
      label.textContent = t("header.downloadBusy");

      try {
        await ensureDiagram();
        await loadScript("vendor/html-to-image.min.js");
        const blob = await renderImage();
        saveFile(blob, `${t("image.fileName")}-${lang}.png`);
        label.textContent = t("header.download");
      } catch (error) {
        console.error("[download]", error);
        label.textContent = t("header.downloadFailed");
        button.classList.add("is-error");
        resetTimer = setTimeout(() => {
          label.textContent = t("header.download");
          button.classList.remove("is-error");
        }, 4000);
      } finally {
        button.removeAttribute("aria-busy");
      }
    });
  }

  // The diagram is on the stack page. The other pages have the same download
  // button: they get the diagram from the stack page only when a visitor clicks
  // the button, and keep it hidden.
  async function ensureDiagram() {
    if (diagram) return;
    const response = await fetch(new URL("stack.html", location.href));
    if (!response.ok) throw new Error("The stack page could not be loaded.");
    const stackPage = new DOMParser().parseFromString(await response.text(), "text/html");
    const source = stackPage.getElementById("architecture");
    if (!source) throw new Error("The diagram is missing from the stack page.");
    const host = el("div", "diagram-source");
    host.hidden = true;
    host.append(document.importNode(source, true));
    document.body.append(host);
    diagram = host.firstElementChild;
    // The texts that the stack page fills when it loads.
    for (const node of diagram.querySelectorAll("[data-text]")) setText(node, t(node.dataset.text));
    for (const node of diagram.querySelectorAll("[data-aria-label]")) {
      node.setAttribute("aria-label", t(node.dataset.ariaLabel));
    }
    renderDiagram();
  }

  // Clones the diagram into an off-screen 16:9 slide with a title, a legend that
  // describes every layer and component, and the credits, so every download looks
  // the same whatever the screen size.
  async function renderImage() {
    const clone = diagram.cloneNode(true);
    clone.removeAttribute("id");
    // The image shows the schema at rest: no hover, no selection.
    for (const node of clone.querySelectorAll(".is-active, .is-selected, .is-hovered")) node.classList.remove("is-active", "is-selected", "is-hovered");

    const groups = legendGroups();
    const legend = el("div", "export-legend");
    const sheet = el("div", "export-sheet", [
      el("div", "export-sheet__head", [
        el("p", "export-sheet__title", t("intro.title")),
        el("span", "export-sheet__site", t("image.site")),
      ]),
      clone,
      legend,
      el("div", "export-sheet__foot", [
        el("ul", "legend", statusLegend()),
        el("p", null, footerText()),
      ]),
    ]);
    const stage = el("div", "export-stage", sheet);
    stage.setAttribute("aria-hidden", "true");
    document.body.append(stage);

    try {
      await document.fonts.ready;
      fitSlide(sheet, legend, groups);
      const options = {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        // Copy every computed style except heights: text can wrap slightly differently
        // in the image, and fixed heights would then leave gaps or clip it. The slide
        // itself keeps its height.
        includeStyleProperties: [...getComputedStyle(document.documentElement)].filter((name) => name !== "height" && name !== "block-size"),
        style: { height: `${sheet.offsetHeight}px` },
      };
      // WebKit can leave fonts out of the first render; a warm-up pass fixes it.
      if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        await window.htmlToImage.toBlob(sheet, options);
      }
      const blob = await window.htmlToImage.toBlob(sheet, options);
      if (!blob) throw new Error("The image could not be created.");
      return blob;
    } finally {
      stage.remove();
    }
  }

  // One group per layer, in reading order: the layer, then each of its components,
  // with the same text as the pop-ups. Local and Server follow the client row.
  function legendGroups() {
    const item = (node) => {
      const entry = entries.get(node);
      return el("p", "export-legend__item", [el("strong", null, entry.name), ` ${entry.tooltip}`]);
    };
    const groups = [];
    for (const layer of diagram.querySelectorAll(".layer")) {
      const entry = entries.get(layer);
      groups.push(el("section", "export-legend__group", [
        el("h3", null, entry.name),
        el("p", "export-legend__about", entry.tooltip),
        ...[...layer.querySelectorAll(".comp")].map(item),
      ]));
      if (layer.dataset.copy === "application") {
        const api = diagram.querySelector(".local-api");
        if (api) groups.push(el("section", "export-legend__group", [
          el("h3", null, entries.get(api).name),
          el("p", "export-legend__about", entries.get(api).tooltip),
        ]));
        const sides = [...diagram.querySelectorAll(".boundary__label")];
        groups.push(el("section", "export-legend__group", [
          el("h3", null, sides.map((node) => entries.get(node).name).join(" / ")),
          ...sides.map(item),
        ]));
      }
    }
    return groups;
  }

  // Shrinks the diagram and the legend together until the slide holds them, so it
  // still fits after copy edits and in the longer French.
  function fitSlide(sheet, legend, groups) {
    for (let scale = 1; scale >= 0.6; scale -= 0.04) {
      sheet.style.setProperty("--export-scale", scale.toFixed(2));
      balanceColumns(legend, groups);
      if (sheet.scrollHeight <= sheet.clientHeight) return;
    }
  }

  // Measures each group at the column width, then splits them, in reading order,
  // into columns of similar height. Plain columns render reliably in the image,
  // where CSS multi-column layout does not.
  function balanceColumns(legend, groups, count = 5) {
    const probe = el("div", "export-legend__column", groups);
    legend.replaceChildren(probe);
    const heights = groups.map((group) => group.offsetHeight + parseFloat(getComputedStyle(group).marginBottom));
    legend.replaceChildren(...splitInOrder(heights, count).map(([from, to]) => el("div", "export-legend__column", groups.slice(from, to))));
  }

  // Splits the heights, in order, into `count` runs whose tallest run is as short as
  // possible. Returns [from, to) index pairs.
  function splitInOrder(heights, count) {
    const n = heights.length;
    const prefix = heights.reduce((sums, h) => [...sums, sums[sums.length - 1] + h], [0]);
    const best = Array.from({ length: count + 1 }, () => Array(n + 1).fill(Infinity));
    const cut = Array.from({ length: count + 1 }, () => Array(n + 1).fill(0));
    best[0][0] = 0;
    for (let c = 1; c <= count; c++) {
      for (let j = 0; j <= n; j++) {
        for (let i = 0; i <= j; i++) {
          const tallest = Math.max(best[c - 1][i], prefix[j] - prefix[i]);
          if (tallest < best[c][j]) { best[c][j] = tallest; cut[c][j] = i; }
        }
      }
    }
    const runs = [];
    for (let c = count, j = n; c > 0; c--) { runs.unshift([cut[c][j], j]); j = cut[c][j]; }
    return runs;
  }

  function saveFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = el("a");
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const scripts = new Map();
  function loadScript(src) {
    if (!scripts.has(src)) {
      scripts.set(src, new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
          scripts.delete(src);
          reject(new Error(`Could not load ${src}`));
        };
        document.head.append(script);
      }));
    }
    return scripts.get(src);
  }

  // --- Helpers -------------------------------------------------------------

  function el(tag, className, children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (children != null) node.append(...[].concat(children));
    return node;
  }

  // Small arrow-out mark shown after external links.
  function externalIcon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "ext-link__icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    for (const d of ["M7 17 17 7", "M7 7h10v10"]) {
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      svg.append(path);
    }
    return svg;
  }
})();
