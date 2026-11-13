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

  // The hardware types and the model servers, in the order of the repository.
  const HARDWARE = unique(RECIPES.map((r) => r.hardware)).map((id) => ({ id, label: RECIPES.find((r) => r.hardware === id).hardwareLabel }));
  const SERVERS = unique(RECIPES.map((r) => r.server)).map((id) => ({ id, label: RECIPES.find((r) => r.server === id).serverLabel }));

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
    server: "",
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

  window.addEventListener("hashchange", () => {
    const id = fromAddress();
    if (id && id !== state.selected) { state.selected = id; renderResults(); }
  });

  renderFilters();
  renderResults();

  // --- Filters -------------------------------------------------------------

  function renderFilters() {
    // The search field stays in place while the chips are drawn again, so it keeps the focus.
    const search = filters.querySelector(".recipe-filter--search") || searchField();
    filters.replaceChildren(
      chipGroup("hardware", HARDWARE, state.hardware, (id) => { state.hardware = id; }),
      chipGroup("server", SERVERS, state.server, (id) => { state.server = id; }),
      search,
    );
  }

  function chipGroup(name, options, current, set) {
    const label = el("span", "recipe-name", [text(`filters.${name}`)]);
    label.id = `recipe-filter-${name}`;
    // A choice is a switch: a click selects it, and a second click removes the filter.
    // With no choice selected, the list shows all the recipes and no box is marked.
    const chips = el("div", "recipe-chips", options.map((option) => {
      const chip = el("button", "recipe-chip", [option.label]);
      chip.type = "button";
      chip.setAttribute("aria-pressed", String(option.id === current));
      chip.addEventListener("click", () => { set(option.id === current ? "" : option.id); renderFilters(); renderResults(); });
      return chip;
    }));
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-labelledby", label.id);
    return el("div", "recipe-filter", [label, chips]);
  }

  function searchField() {
    const input = el("input", "recipe-input");
    input.type = "search";
    input.id = "recipe-filter-model";
    input.placeholder = text("filters.modelPlaceholder");
    input.addEventListener("input", () => { state.query = input.value.trim(); renderResults(); });
    const label = el("label", "recipe-name", [text("filters.model")]);
    label.htmlFor = input.id;
    return el("div", "recipe-filter recipe-filter--search", [label, input]);
  }

  // --- Results -------------------------------------------------------------

  function renderResults() {
    const query = state.query.toLowerCase();
    const matches = (r) =>
      (!state.server || r.server === state.server) &&
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

    renderSheet();
  }

  function resultRow(r) {
    const row = el("button", "recipe-row", [
      el("span", "recipe-row__name", [r.model, el("span", "recipe-row__publisher", [r.publisher])]),
      el("span", "recipe-row__where", [text("where", { server: r.serverLabel, hardware: r.hardwareLabel })]),
      el("span", "recipe-tags", tags(r, { short: true })),
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

    sheet.replaceChildren(...[
      // Each fact one time: the model with its publisher, then the server and the hardware.
      el("div", "recipe-sheet__head", [
        el("h2", "recipe-sheet__title", [el("span", "recipe-sheet__publisher", [`${r.publisher}/`]), r.model]),
        el("p", "recipe-sheet__where", [text("where", { server: r.serverLabel, hardware: r.hardwareLabel })]),
        el("div", "recipe-tags", tags(r)),
      ]),

      STACK_IS_PUBLIC && useThisRecipe(r),

      el("section", "recipe-panel recipe-files", [
        el("h3", "recipe-name", [text("sheet.files")]),
        tabs,
        codeBlock(file.text, "recipe-code--file"),
        r.image && el("p", "recipe-sheet__image", [text("sheet.image"), " ", el("code", null, [r.image])]),
      ]),

      el("p", "recipe-links", [
        STACK_IS_PUBLIC && link(text("sheet.github"), `${data.repo}/tree/${data.branch}/recipes/${r.id}`),
        link(text("sheet.modelCard"), `https://huggingface.co/${r.publisher}/${r.model}`),
        r.source && link(text("sheet.source"), r.source),
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

  // The facts that the recipe files state. A fact that the files do not state shows no tag.
  function tags(r, { short = false } = {}) {
    const facts = r.facts;
    const count = (value) => value.toLocaleString(app.locale);
    const list = [];
    if (r.example) list.push([text("tags.example"), "recipe-tag--example"]);
    if (facts.context) list.push([text(short ? "tags.contextShort" : "tags.context", { count: count(facts.context) })]);
    if (facts.tools) list.push([text("tags.tools")]);
    if (facts.reasoning) list.push([text("tags.reasoning")]);
    // The list shows the short set of tags. The sheet shows all of them.
    if (!short && facts.speculative) list.push([text("tags.speculative")]);
    if (!short && facts.parallel) list.push([text("tags.parallel", { count: count(facts.parallel) })]);
    if (facts.gpus > 1) list.push([text("tags.gpus", { count: count(facts.gpus) })]);
    return list.map(([label, modifier]) => el("span", `recipe-tag ${modifier || ""}`.trim(), [label]));
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

  function unique(values) { return [...new Set(values)]; }

  // Makes an element. Empty children (null, false, "") are left out.
  function el(tag, className, children = []) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.append(...children.filter(Boolean));
    return node;
  }
})();
