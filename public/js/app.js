/*
 * Fills the page with the copy from copy/en.js or copy/fr.js, shows the
 * architecture pop-ups, and downloads the diagram as a PNG.
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

  const diagram = document.getElementById("architecture");
  const entries = new Map();

  renderPage();
  renderDiagram();
  setUpTheme();
  setUpTooltips();
  setUpDownload();

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
    document.title = t("meta.title");
    setContent('meta[name="description"]', t("meta.description"));
    setContent('meta[property="og:title"]', t("meta.title"));
    setContent('meta[property="og:description"]', t("meta.description"));

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(lang === DEFAULT_LANGUAGE ? "/" : `/?lang=${lang}`, canonical.href).href;

    for (const node of document.querySelectorAll("[data-text]")) setText(node, t(node.dataset.text));
    for (const node of document.querySelectorAll("[data-href]")) node.href = t(node.dataset.href);
    for (const node of document.querySelectorAll("[data-aria-label]")) {
      node.setAttribute("aria-label", t(node.dataset.ariaLabel));
    }

    for (const link of document.querySelectorAll(".lang a")) {
      if (link.hreflang === LOCALES[lang]) link.setAttribute("aria-current", "true");
    }

    const points = t("intro.points") || [];
    document.getElementById("goal-points").replaceChildren(
      ...points.map((point) =>
        el("li", "goal__point", [
          el("span", "goal__point-title", point.title),
          el("span", "goal__point-text", point.text),
        ])
      )
    );

    // "{mozilla}" and "{mila}" in the footer line become links.
    const parts = t("footer.collaboration").split(/(\{\w+\})/);
    document.getElementById("collaboration").replaceChildren(
      ...parts.map((part) => {
        const key = (part.match(/^\{(\w+)\}$/) || [])[1];
        if (!key) return document.createTextNode(part);
        const link = el("a", null, t(`footer.${key}.name`));
        link.href = t(`footer.${key}.url`);
        return link;
      })
    );
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
    for (const node of diagram.querySelectorAll("[data-copy]")) {
      const key = `stack.${node.dataset.copy}`;
      const entry = {
        kind: kindOf(node),
        name: t(`${key}.name`),
        detail: t(`${key}.detail`, { optional: true }),
        tooltip: t(`${key}.tooltip`),
      };

      // Screen readers get the pop-up text inline, right after the name.
      const label = el("span", "label", [el("span", "label__name", entry.name)]);
      if (entry.detail) label.append(el("span", "label__detail", entry.detail));
      label.append(el("span", "sr-only", `. ${entry.tooltip}`));

      node.prepend(label);
      node.tabIndex = 0;
      entries.set(node, entry);
    }
  }

  function kindOf(node) {
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
      el("p", "export-sheet__foot", footerText()),
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
  // with the same text as the pop-ups. Local and Server follow the SDK row.
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
      if (layer.dataset.copy === "sdk") {
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
})();
