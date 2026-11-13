/*
 * Fills each page with the copy from copy/en.js or copy/fr.js and marks the
 * current tab. On the stack page, it also shows the architecture pop-ups and
 * downloads the diagram as a PNG.
 */
(() => {
  "use strict";

  const ALL_COPY = window.CAIRN_COPY || {};
  const LANGUAGES = ["en", "fr"];
  // The language tag the page declares for each ?lang= value.
  const LOCALES = { en: "en", fr: "fr-CA" };
  const DEFAULT_LANGUAGE = "en";
  const LANGUAGE_KEY = "cairn-language";
  // Also read by the script in the page head, which sets the theme before the first paint.
  const THEME_KEY = "cairn-theme";

  const lang = pickLanguage();
  const copy = ALL_COPY[lang] || ALL_COPY[DEFAULT_LANGUAGE];
  if (!copy) {
    console.error("[copy] No copy file loaded. Check copy/en.js for a syntax error.");
    return;
  }

  // The page's tab: the data-page value on <body>, which is also its key under `nav`.
  const page = document.body.dataset.page;
  // Only the stack page has the diagram.
  const diagram = document.getElementById("architecture");
  const entries = new Map();

  renderPage();
  setUpTheme();
  if (diagram) {
    renderDiagram();
    setUpTooltips();
    setUpDownload();
  }

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

    for (const link of document.querySelectorAll(".lang a")) {
      if (link.hreflang === LOCALES[lang]) link.setAttribute("aria-current", "true");
    }

    renderNav();

    const goalPoints = document.getElementById("goal-points");
    if (goalPoints) {
      goalPoints.replaceChildren(
        ...(t("intro.points") || []).map((point) =>
          el("li", "goal__point", [
            el("span", "goal__point-title", point.title),
            el("span", "goal__point-text", point.text),
          ])
        )
      );
    }

    // "{mozilla}" and "{mila}" in the footer line become links.
    const parts = t("footer.collaboration").split(/(\{\w+\})/);
    document.getElementById("collaboration").replaceChildren(
      ...parts.map((part) => {
        const key = (part.match(/^\{(\w+)\}$/) || [])[1];
        if (!key) return document.createTextNode(part);
        const link = el("a", "ext-link", t(`footer.${key}.name`));
        link.href = t(`footer.${key}.url`);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(externalIcon());
        return link;
      })
    );
  }

  // Marks the current tab and prepares the links between pages (the tabs and the logo).
  function renderNav() {
    const nav = document.querySelector(".site-nav");
    const explicit = new URLSearchParams(location.search).has("lang");
    for (const link of document.querySelectorAll("a[data-page]")) {
      let href = link.getAttribute("href");
      // A page opened from disk has no server to turn "./" into index.html.
      if (href === "./" && location.protocol === "file:") href = "index.html";
      // A language chosen in the address stays in the address on the next page.
      if (explicit) href += `?lang=${lang}`;
      link.setAttribute("href", href);
    }
    if (!nav) return;
    const current = nav.querySelector(`a[data-page="${page}"]`);
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
  function setText(node, text) {
    node.replaceChildren(...text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? el("mark", "hl", part) : part)));
  }

  function setContent(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function footerText() {
    return t("footer.collaboration").replace(/\{(\w+)\}/g, (_, key) => t(`footer.${key}.name`));
  }

  // --- Theme ---------------------------------------------------------------

  // The header button switches theme and remembers the choice; until a visitor
  // makes one, the page follows the system setting, even while open.
  function setUpTheme() {
    const button = document.getElementById("theme-toggle");
    const system = matchMedia("(prefers-color-scheme: dark)");
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
      remember(THEME_KEY, next);
      apply(next);
    });
    system.addEventListener("change", (event) => {
      if (!recall(THEME_KEY)) apply(event.matches ? "dark" : "light");
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

    document.getElementById("status-legend").replaceChildren(...statusLegend());
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

  // Clones the diagram into an off-screen 16:9 slide with a title, a legend that
  // describes every layer and component, and the credits, so every download looks
  // the same whatever the screen size.
  async function renderImage() {
    const clone = diagram.cloneNode(true);
    clone.removeAttribute("id");
    for (const node of clone.querySelectorAll(".is-active")) node.classList.remove("is-active");

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
