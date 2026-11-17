/*
 * The Recipes page: a list of the model server recipes with filters, and a
 * sheet that shows the files of the selected recipe.
 *
 * The recipes come from js/recipes-data.js, which tools/gen-recipes.mjs writes
 * from the stack repository. This script holds no recipe content: a new recipe
 * shows here when the data file is generated again. The words around the
 * recipes are under `recipes` in the copy files.
 */
(() => {
  "use strict";

  // The public announcement comes before the stack is available. Until the stack
  // repository is public, the sheet does not tell the visitor how to install a
  // recipe and does not link to the repository. Set to true when it is public.
  const STACK_IS_PUBLIC = false;

  const app = window.CAIRN_APP;
  const data = window.CAIRN_RECIPES;
  const filters = document.getElementById("recipe-filters");
  const results = document.getElementById("recipe-results");
  const sheet = document.getElementById("recipe-sheet");
  if (!app || !filters || !results || !sheet) return;
  if (!data || !data.recipes || !data.recipes.length) {
    console.error("[recipes] No recipe data loaded. Check js/recipes-data.js.");
    return;
  }

  const RECIPES = data.recipes;
  const byId = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

  // The hardware types, in the order of the repository.
  const HARDWARE = unique(RECIPES.map((r) => r.hardware)).map((id) => ({ id, label: RECIPES.find((r) => r.hardware === id).hardwareLabel }));

  // A "<vendor>-any" folder holds the generic recipes of a vendor. They also run
  // on each specific hardware type of that vendor (for example nvidia-any on nvidia-gb10).
  const genericFor = (hardware) => {
    const generic = `${hardware.split("-")[0]}-any`;
    return generic !== hardware && HARDWARE.some((h) => h.id === generic) ? generic : null;
  };

  // The address can name a recipe: recipes.html#<hardware>/<model>/<publisher>/<server>.
  const fromAddress = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    return byId.has(id) ? id : null;
  };

  const state = {
    selected: fromAddress() || data.defaultId,
    hardware: "",
    useCase: "",
    query: "",
    file: "model-server-config.yaml",
  };

  // The copy of this page. Each text is looked up one time, so a text that is
  // missing from the French file logs one warning, not one for each render.
  const texts = new Map();
  function text(key, values = {}) {
    if (!texts.has(key)) texts.set(key, app.t(`recipes.${key}`));
    return texts.get(key).replace(/\{(\w+)\}/g, (match, name) => (name in values ? values[name] : match));
  }

  // The use cases that one recipe or more has, in the order of the data.
  // The generator gives them to each recipe (tools/use-cases.mjs).
  const USE_CASES = unique(RECIPES.flatMap((r) => r.useCases || [])).map((id) => ({ id, label: text(`useCases.${id}`) }));

  window.addEventListener("hashchange", () => {
    const id = fromAddress();
    if (id && id !== state.selected) { state.selected = id; renderResults(); }
  });

  renderColumns();
  renderFilters();
  renderResults();
  renderCredit();

  // --- Filters -------------------------------------------------------------

  // One row: a menu for the hardware, a menu for the use case, and the search
  // on the model name. A menu takes the same space for 5 choices or for 50.
  function renderFilters() {
    // The search field stays in place while the menu is drawn again, so it keeps its text.
    const search = filters.querySelector(".recipe-search") || searchField();
    filters.replaceChildren(...[
      menu("hardware", HARDWARE, state.hardware, (id) => { state.hardware = id; }),
      USE_CASES.length && menu("useCase", USE_CASES, state.useCase, (id) => { state.useCase = id; }),
      search,
    ].filter(Boolean));
  }

  // A menu with one choice: the design system's dropdown menu. For screen readers
  // and the keyboard it is a select-only combobox: the button keeps the focus, and
  // the arrow keys move the active choice.
  function menu(name, options, current, set) {
    const label = text(`filters.${name}`);
    const items = [{ id: "", label: text("filters.all") }, ...options];
    const chosen = options.find((option) => option.id === current);
    let active = Math.max(0, items.findIndex((item) => item.id === current));

    const list = el("ul", "recipe-menu", [
      el("li", "recipe-menu__label", [label]),
      ...items.map((item, index) => {
        const selected = item.id === current;
        const option = el("li", "recipe-menu__item", [item.label, selected && icon("M5 12.5 10 17.5 19.5 7", "recipe-menu__check")]);
        option.id = `recipe-filter-${name}-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(selected));
        option.addEventListener("click", () => choose(index));
        option.addEventListener("pointermove", () => mark(index));
        return option;
      }),
    ]);
    list.id = `recipe-filter-${name}-list`;
    list.hidden = true;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", label);
    list.firstChild.setAttribute("role", "presentation");
    // A press on the menu must not take the focus from the button: the menu closes when the button loses it.
    list.addEventListener("pointerdown", (event) => event.preventDefault());

    // At rest the button shows the name of the filter. With a choice, it shows the choice.
    const button = el("button", "recipe-select", [
      el("span", "recipe-select__value", [chosen ? chosen.label : label]),
      icon("m6 9 6 6 6-6", "recipe-select__caret"),
    ]);
    button.type = "button";
    button.id = `recipe-filter-${name}`;
    button.dataset.chosen = String(Boolean(chosen));
    button.setAttribute("role", "combobox");
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-controls", list.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", chosen ? `${label}: ${chosen.label}` : label);

    const optionNodes = () => [...list.querySelectorAll('[role="option"]')];
    const isOpen = () => !list.hidden;

    function mark(index) {
      active = (index + items.length) % items.length;
      optionNodes().forEach((option, i) => option.classList.toggle("is-active", i === active));
      button.setAttribute("aria-activedescendant", optionNodes()[active].id);
      optionNodes()[active].scrollIntoView({ block: "nearest" });
    }

    function open() {
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
      mark(active);
    }

    function close() {
      list.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-activedescendant");
    }

    function choose(index) {
      set(items[index].id);
      renderFilters();
      renderResults();
      // The menus are new elements: give the focus back to this one.
      document.getElementById(`recipe-filter-${name}`).focus();
    }

    button.addEventListener("click", () => (isOpen() ? close() : open()));
    button.addEventListener("blur", close);
    button.addEventListener("keydown", (event) => {
      const { key } = event;
      if (key === "Escape") { if (isOpen()) { event.preventDefault(); close(); } return; }
      if (key === "Tab") return;
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
        event.preventDefault();
        if (!isOpen()) return open();
        return mark(key === "ArrowDown" ? active + 1 : key === "ArrowUp" ? active - 1 : key === "Home" ? 0 : items.length - 1);
      }
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        return isOpen() ? choose(active) : open();
      }
      // A letter goes to the next choice that starts with it.
      if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const order = items.map((_, i) => (active + 1 + i) % items.length);
        const match = order.find((i) => items[i].label.toLowerCase().startsWith(key.toLowerCase()));
        if (match !== undefined) { if (!isOpen()) open(); mark(match); }
      }
    });

    return el("div", "recipe-dropdown", [button, list]);
  }

  function searchField() {
    const input = el("input", "recipe-input");
    input.type = "search";
    input.id = "recipe-filter-model";
    input.placeholder = text("filters.modelPlaceholder");
    input.addEventListener("input", () => { state.query = input.value.trim(); renderResults(); });
    // The placeholder names the field for the eye; the label names it for screen readers.
    const label = el("label", "sr-only", [text("filters.model")]);
    label.htmlFor = input.id;
    return el("div", "recipe-search", [label, input]);
  }

  // --- Results -------------------------------------------------------------

  function renderResults() {
    const query = state.query.toLowerCase();
    const matches = (r) =>
      (!state.useCase || (r.useCases || []).includes(state.useCase)) &&
      (!query || `${r.publisher}/${r.model}`.toLowerCase().includes(query));

    // With a hardware type selected: its recipes, then the generic recipes of its vendor.
    // Each recipe names its hardware, so the two sets need no heading.
    const generic = state.hardware && genericFor(state.hardware);
    const visible = (state.hardware
      ? [...RECIPES.filter((r) => r.hardware === state.hardware), ...RECIPES.filter((r) => r.hardware === generic)]
      : RECIPES
    ).filter(matches);

    // The sheet always shows a recipe of the list: when the filters hide the
    // selected recipe, the first recipe of the list takes its place.
    if (!visible.some((r) => r.id === state.selected)) state.selected = visible.length ? visible[0].id : "";

    results.replaceChildren(...(visible.length ? visible.map(resultRow) : [el("p", "recipe-empty", [text("empty")])]));
    fitAllTags();

    renderSheet();
  }

  // The column headings, over the list. They are hidden from screen readers:
  // each recipe gives the names of its columns to screen readers.
  function renderColumns() {
    const columns = document.getElementById("recipe-columns");
    if (!columns) return;
    columns.replaceChildren(...["model", "hardware", "server", "tags"].map((name) => el("span", "", [text(`columns.${name}`)])));
  }

  function resultRow(r) {
    // A cell with the name of its column for screen readers, for example "Hardware: GB10".
    const cell = (name, value) => el("span", "recipe-row__where", [el("span", "sr-only", [`${text(`columns.${name}`)}: `]), value]);
    const row = el("button", "recipe-row", [
      el("span", "recipe-row__name", [r.model, el("span", "recipe-row__publisher", [r.publisher])]),
      cell("hardware", r.hardwareLabel),
      cell("server", r.serverLabel),
      el("span", "recipe-tags", tags(r, { context: false })),
    ]);
    row.type = "button";
    row.setAttribute("aria-pressed", String(r.id === state.selected));
    row.addEventListener("click", () => {
      state.selected = r.id;
      renderResults();
      // On a narrow screen the sheet is under the list: bring it into view.
      if (matchMedia("(max-width: 900px), (max-aspect-ratio: 1/1)").matches) sheet.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return row;
  }

  // In the list, the tags of a recipe stay on one line. The tags that do not
  // fit are hidden, and a last tag gives their number: "+2". The sheet shows all the tags.
  function fitTags(container) {
    container.querySelector(".recipe-tag--more")?.remove();
    const all = [...container.children];
    all.forEach((tag) => { tag.hidden = false; });
    if (container.scrollWidth <= container.clientWidth) return;

    const more = el("span", "recipe-tag recipe-tag--more");
    container.append(more);
    // Hide tags from the end until the line fits. The use case tags are first, so they stay the longest.
    for (let shown = all.length - 1; shown >= 0; shown -= 1) {
      all[shown].hidden = true;
      const hiddenTags = all.slice(shown);
      more.textContent = `+${hiddenTags.length}`;
      // The pop-up and screen readers get the names of the hidden tags.
      const names = hiddenTags.map((hiddenTag) => hiddenTag.textContent).join(", ");
      const count = text(hiddenTags.length === 1 ? "tags.moreOne" : "tags.more", { count: hiddenTags.length });
      setTip(more, text("tips.kinds.more"), count, names);
      more.setAttribute("aria-label", `${count}: ${names}`);
      if (container.scrollWidth <= container.clientWidth) break;
    }
  }

  function fitAllTags() {
    results.querySelectorAll(".recipe-tags").forEach(fitTags);
  }

  // The space for the tags changes with the width of the list, and the width
  // of a tag changes when the font is loaded.
  new ResizeObserver(fitAllTags).observe(results);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAllTags);

  // --- Pop-ups ---------------------------------------------------------------

  // A tag shows its description in a pop-up when the pointer is on it: the
  // same pop-up as on the stack page. A touch screen has no hover, so it shows no pop-up.
  setUpTips();
  function setUpTips() {
    const tip = document.getElementById("tip");
    const body = document.querySelector(".recipe-body");
    if (!tip || !body) return;
    const [kind, name, description] = ["kind", "name", "text"].map((part) => tip.querySelector(`.tip__${part}`));
    let active = null;

    function show(node) {
      if (node === active) return;
      active = node;
      kind.textContent = node.dataset.tipKind;
      name.textContent = node.dataset.tipName;
      description.textContent = node.dataset.tipText;

      // Above the tag when there is room, otherwise below; always on screen.
      const box = node.getBoundingClientRect();
      const margin = 8;
      tip.style.transform = "translate(0, 0)";
      const { width, height } = tip.getBoundingClientRect();
      let top = box.top - height - margin;
      if (top < margin) top = box.bottom + margin;
      const left = Math.max(margin, Math.min(box.left + box.width / 2 - width / 2, document.documentElement.clientWidth - width - margin));
      tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
      tip.classList.add("is-visible");
    }

    function hide() {
      active = null;
      tip.classList.remove("is-visible");
    }

    body.addEventListener("pointerover", (event) => {
      const node = event.pointerType !== "touch" && event.target instanceof Element && event.target.closest("[data-tip-text]");
      if (node) show(node); else hide();
    });
    body.addEventListener("pointerleave", hide);
    // A click draws the list again, so the tag under the pointer is a new element.
    body.addEventListener("click", hide);
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") hide(); });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
  }

  // --- The recipe sheet ----------------------------------------------------

  function renderSheet() {
    const r = byId.get(state.selected);
    // The address follows the selected recipe, so a visitor can share it.
    history.replaceState(null, "", r ? `#${r.id}` : location.pathname + location.search);
    if (!r) {
      sheet.replaceChildren(el("p", "recipe-empty", [text("noSelection")]));
      return;
    }

    const file = r.files.find((f) => f.name === state.file) || r.files.find((f) => f.name === "model-server-config.yaml") || r.files[0];
    const tabs = el("div", "recipe-tabs", r.files.map((f) => {
      const tab = el("button", "recipe-tab", [f.name]);
      tab.type = "button";
      tab.setAttribute("aria-pressed", String(f === file));
      tab.addEventListener("click", () => { state.file = f.name; renderSheet(); });
      return tab;
    }));

    // Each link sits beside what it documents: the model card beside the model
    // name, the recipe on GitHub beside the name of the files panel.
    sheet.replaceChildren(...[
      // Each fact one time: the model with its publisher, then the server and the hardware.
      el("div", "recipe-sheet__head", [
        el("div", "recipe-sheet__top", [
          el("h2", "recipe-sheet__title", [el("span", "recipe-sheet__publisher", [`${r.publisher}/`]), r.model]),
          link(text("sheet.modelCard"), `https://huggingface.co/${r.publisher}/${r.model}`),
        ]),
        el("p", "recipe-sheet__where", [text("where", { server: r.serverLabel, hardware: r.hardwareLabel })]),
        el("div", "recipe-tags", tags(r)),
      ]),

      STACK_IS_PUBLIC && useThisRecipe(r),

      el("section", "recipe-panel recipe-files", [
        el("div", "recipe-panel__top", [
          el("h3", "recipe-name", [text("sheet.files")]),
          STACK_IS_PUBLIC && link(text("sheet.github"), `${data.repo}/tree/${data.branch}/recipes/${r.id}`),
        ]),
        tabs,
        codeBlock(file.text, "recipe-code--file"),
        r.image && el("p", "recipe-sheet__image", [text("sheet.image"), " ", el("code", null, [r.image])]),
      ]),
    ].filter(Boolean));
  }

  // The steps to install the recipe. Shown only when the stack repository is public.
  function useThisRecipe(r) {
    const env = [`HARDWARE_TARGET=${r.hardware}`, `MODEL_NAME=${r.model}`, `MODEL_ORG=${r.publisher}`, `MODEL_SERVER=${r.server}`].join("\n");
    return el("section", "recipe-panel", [
      el("h3", "recipe-name", [text("sheet.use.title")]),
      el("ol", "recipe-use", [
        el("li", null, [text("sheet.use.select"), codeBlock(env)]),
        el("li", null, [text("sheet.use.start"), codeBlock("docker compose up -d")]),
      ]),
    ]);
  }

  // The use cases of the recipe, then the facts that the recipe files state.
  // A fact that the files do not state shows no tag.
  // The list shows no context length: only the sheet shows it.
  // A use case tag has its own color: it says what the recipe is for. The other tags are facts.
  function tags(r, { context = true } = {}) {
    const facts = r.facts;
    const useCases = (r.useCases || []).map((id) => tag(text(`useCases.${id}`), "useCase", text(`tips.useCases.${id}`), "recipe-tag--use"));
    const list = [];
    if (context && facts.context) list.push(tag(text("tags.context", { count: facts.context.toLocaleString(app.locale) }), "fact", text("tips.tags.context")));
    if (facts.tools) list.push(tag(text("tags.tools"), "fact", text("tips.tags.tools")));
    if (facts.reasoning) list.push(tag(text("tags.reasoning"), "fact", text("tips.tags.reasoning")));
    return [...useCases, ...list];
  }

  // A tag, with the content of its pop-up: the kind of tag and its description.
  function tag(label, kind, description, modifier) {
    const node = el("span", `recipe-tag ${modifier || ""}`.trim(), [label]);
    setTip(node, text(`tips.kinds.${kind}`), label, description);
    return node;
  }

  function setTip(node, kind, name, description) {
    node.dataset.tipKind = kind;
    node.dataset.tipName = name;
    node.dataset.tipText = description;
  }

  // The sources of the benchmark data that the use cases read, under the list.
  function renderCredit() {
    const credit = document.getElementById("recipe-credit");
    const sources = (data.benchmarks && data.benchmarks.sources) || [];
    if (!credit || !sources.length || !USE_CASES.length) return;
    const links = sources.flatMap((source, i) => [i ? ` ${text("useCases.creditAnd")} ` : " ", link(source.name, source.url)]);
    credit.replaceChildren(text("useCases.credit"), ...links);
  }

  function codeBlock(content, modifier) {
    const copy = el("button", "recipe-copy", [text("sheet.copy")]);
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(content); copy.textContent = text("sheet.copied"); }
      catch { copy.textContent = text("sheet.copyFailed"); }
      setTimeout(() => { copy.textContent = text("sheet.copy"); }, 1600);
    });
    return el("div", `recipe-code ${modifier || ""}`.trim(), [el("pre", null, [content]), copy]);
  }

  function link(label, href) {
    const a = el("a", "recipe-link", [label, app.externalIcon()]);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  // --- Helpers -------------------------------------------------------------

  // A small line icon: the caret of a menu, the check of the selected choice.
  function icon(path, className) {
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
    const line = document.createElementNS(ns, "path");
    line.setAttribute("d", path);
    svg.append(line);
    return svg;
  }

  function unique(values) { return [...new Set(values)]; }

  // Makes an element. Empty children (null, false, "") are left out.
  function el(tag, className, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children.filter(Boolean));
    return node;
  }
})();
