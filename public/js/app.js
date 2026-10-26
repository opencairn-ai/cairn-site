/*
 * Fills the page with the copy from copy/en.js or copy/fr.js, shows the
 * architecture pop-ups, and downloads the diagram as a PNG.
 */
(() => {
  "use strict";

  const ALL_COPY = window.CAIRN_COPY || {};
  const LANGUAGES = ["en", "fr"];
  const DEFAULT_LANGUAGE = "en";
  const STORAGE_KEY = "cairn-language";

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
  setUpTooltips();
  setUpDownload();

  // --- Language ------------------------------------------------------------

  // An explicit ?lang= wins and is remembered; otherwise the last choice,
  // then the browser's preferred languages.
  function pickLanguage() {
    const requested = new URLSearchParams(location.search).get("lang");
    if (LANGUAGES.includes(requested) && ALL_COPY[requested]) {
      remember(requested);
      return requested;
    }
    const saved = recall();
    if (LANGUAGES.includes(saved) && ALL_COPY[saved]) return saved;
    const preferred = (navigator.languages || [navigator.language || ""])
      .map((tag) => tag.slice(0, 2).toLowerCase())
      .find((code) => LANGUAGES.includes(code) && ALL_COPY[code]);
    return preferred || DEFAULT_LANGUAGE;
  }

  function remember(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* storage unavailable */ }
  }

  function recall() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
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
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    setContent('meta[name="description"]', t("meta.description"));
    setContent('meta[property="og:title"]', t("meta.title"));
    setContent('meta[property="og:description"]', t("meta.description"));

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(lang === DEFAULT_LANGUAGE ? "/" : `/?lang=${lang}`, canonical.href).href;

    for (const node of document.querySelectorAll("[data-text]")) node.textContent = t(node.dataset.text);
    for (const node of document.querySelectorAll("[data-href]")) node.href = t(node.dataset.href);
    for (const node of document.querySelectorAll("[data-aria-label]")) {
      node.setAttribute("aria-label", t(node.dataset.ariaLabel));
    }

    for (const link of document.querySelectorAll(".lang a")) {
      if (link.hreflang === lang) link.setAttribute("aria-current", "true");
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

  function setContent(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("content", value);
  }

  function footerText() {
    return t("footer.collaboration").replace(/\{(\w+)\}/g, (_, key) => t(`footer.${key}.name`));
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

    diagram.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "touch") show(targetOf(event));
    });
    diagram.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "touch") hide();
    });

    // Taps (and clicks) pin the pop-up until the next tap elsewhere.
    diagram.addEventListener("click", (event) => show(targetOf(event)));
    document.addEventListener("click", (event) => {
      if (!diagram.contains(event.target)) hide();
    });

    diagram.addEventListener("focusin", (event) => show(targetOf(event)));
    diagram.addEventListener("focusout", (event) => {
      if (!diagram.contains(event.relatedTarget)) hide();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hide();
    });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
  }

  // --- Download ------------------------------------------------------------

  function setUpDownload() {
    const button = document.getElementById("download");
    const label = button.querySelector("[data-text]");
    let resetTimer;

    button.addEventListener("click", async () => {
      if (button.getAttribute("aria-busy") === "true") return;
      clearTimeout(resetTimer);
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
        resetTimer = setTimeout(() => { label.textContent = t("header.download"); }, 4000);
      } finally {
        button.removeAttribute("aria-busy");
      }
    });
  }

  // Clones the diagram into a fixed-size, off-screen sheet with a title and
  // credits, so every download looks the same whatever the screen size.
  async function renderImage() {
    const logo = document.querySelector(".brand img").cloneNode();
    const clone = diagram.cloneNode(true);
    clone.removeAttribute("id");
    for (const node of clone.querySelectorAll(".is-active")) node.classList.remove("is-active");

    const sheet = el("div", "export-sheet", [
      el("div", "export-sheet__head", [logo, el("span", "export-sheet__site", t("image.site"))]),
      el("p", "export-sheet__title", t("intro.title")),
      clone,
      el("p", "export-sheet__foot", footerText()),
    ]);
    const stage = el("div", "export-stage", sheet);
    stage.setAttribute("aria-hidden", "true");
    document.body.append(stage);

    try {
      await document.fonts.ready;
      await logo.decode().catch(() => {});
      const options = {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      };
      // WebKit can leave images out of the first render; a warm-up pass fixes it.
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
