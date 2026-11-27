/*
 * The Recipes page: a table of the model server recipes with filters, and a
 * sheet that shows the facts and the files of the selected recipe.
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
  // The search on the model name, after the two filter menus. Hidden for now: set
  // to true to show it again (its code and copy stay in place).
  const SHOW_MODEL_SEARCH = false;

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
    // The use cases ticked in the menu: several at once; none means all.
    useCases: [],
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

  // The menu to open again after a click in a menu with several choices: the
  // menus are drawn again, and that one stays open on the same choice.
  let reopen = null;

  // The button above the sheet, as on the stack page: its label stays the same and
  // its arrow turns. The sheet is open at first. Closed, the table takes the full
  // width (wide screens only: a narrow screen always shows the sheet under the
  // table, and hides the button). A click on a recipe opens the sheet again.
  const sheetToggle = document.getElementById("recipe-sheet-toggle");
  function setSheetShown(show) {
    document.documentElement.classList.toggle("recipe-sheet-hidden", !show);
    if (sheetToggle) sheetToggle.setAttribute("aria-expanded", String(show));
  }
  if (sheetToggle) {
    sheetToggle.addEventListener("click", () => setSheetShown(sheetToggle.getAttribute("aria-expanded") !== "true"));
  }
  const sheetShown = () => !document.documentElement.classList.contains("recipe-sheet-hidden");

  // The description card (js/app.js, setUpCard), as on the stack page. On a wide
  // screen its × and Escape close it, and the focus goes back to the card button.
  // A narrow screen keeps the card under the table: there the × is hidden (CSS).
  const sheetContent = app.setUpCard(sheet, {
    closeLabel: text("sheet.close"),
    onClose: () => { setSheetShown(false); if (sheetToggle) sheetToggle.focus(); },
  });
  document.addEventListener("keydown", (event) => {
    // A menu or a pop-up that handles Escape first keeps it.
    if (event.key !== "Escape" || event.defaultPrevented) return;
    if (app.sheetQuery.matches && sheetShown()) setSheetShown(false);
  });

  window.addEventListener("hashchange", () => {
    const id = fromAddress();
    // Back and Forward select a recipe as a click does: they open the sheet again.
    if (id && id !== state.selected) { state.selected = id; setSheetShown(true); renderResults(); }
  });

  renderColumns();
  renderFilters();
  renderResults();

  // --- Filters -------------------------------------------------------------

  // One row: a menu for the hardware, a menu for the use case, and the search
  // on the model name. A menu takes the same space for 5 choices or for 50.
  function renderFilters() {
    // The search field stays in place while the menu is drawn again, so it keeps its text.
    const search = SHOW_MODEL_SEARCH && (filters.querySelector(".recipe-search") || searchField());
    filters.replaceChildren(...[
      menu("hardware", HARDWARE, state.hardware, (id) => { state.hardware = id; }),
      USE_CASES.length && menu("useCase", USE_CASES, state.useCases, (ids) => { state.useCases = ids; }, { multiple: true }),
      search,
    ].filter(Boolean));
  }

  // A filter menu: the design system's dropdown menu. For screen readers and the
  // keyboard it is a select-only combobox: the button keeps the focus, and the
  // arrow keys move the active choice. With `multiple`, each choice has a box to
  // tick, several can be ticked, and the menu stays open; "All" clears them.
  function menu(name, options, current, set, { multiple = false } = {}) {
    const label = text(`filters.${name}`);
    const items = [{ id: "", label: text("filters.all") }, ...options];
    const ticked = multiple ? current : (current ? [current] : []);
    const chosen = options.filter((option) => ticked.includes(option.id));
    const isSelected = (item) => (item.id ? ticked.includes(item.id) : !ticked.length);
    let active = reopen && reopen.name === name ? reopen.active : Math.max(0, items.findIndex(isSelected));

    const list = el("ul", `recipe-menu${multiple ? " recipe-menu--multiple" : ""}`, [
      el("li", "recipe-menu__label", [label]),
      ...items.map((item, index) => {
        const selected = isSelected(item);
        // Several choices: a box before each use case (ticked or empty); "All" has none.
        const box = multiple && item.id && el("span", `recipe-menu__box${selected ? " is-ticked" : ""}`, [selected && icon("M5 12.5 10 17.5 19.5 7", "recipe-menu__tick")]);
        const option = el("li", "recipe-menu__item", [box, item.label, selected && !multiple && icon("M5 12.5 10 17.5 19.5 7", "recipe-menu__check")]);
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
    if (multiple) list.setAttribute("aria-multiselectable", "true");
    list.firstChild.setAttribute("role", "presentation");
    // A press on the menu must not take the focus from the button: the menu closes when the button loses it.
    list.addEventListener("pointerdown", (event) => event.preventDefault());

    // A pill with the name of the filter and its value: "Hardware: All", then the
    // choice ("Hardware: CPU"). The pill shape tells a filter from the card button.
    const button = el("button", "recipe-select", [
      el("span", "recipe-select__name", [text("filters.name", { name: label })]),
      // Several ticked: the first one, then how many more, so the pill keeps its
      // size: "Chat (+2)". The full list stays in the name for screen readers.
      el("span", "recipe-select__value", [chosen.length ? `${chosen[0].label}${chosen.length > 1 ? ` (+${chosen.length - 1})` : ""}` : text("filters.all")]),
      icon("m6 9 6 6 6-6", "recipe-select__caret"),
    ]);
    button.type = "button";
    button.id = `recipe-filter-${name}`;
    button.dataset.chosen = String(chosen.length > 0);
    button.setAttribute("role", "combobox");
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-controls", list.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `${label}: ${chosen.length ? chosen.map((option) => option.label).join(", ") : text("filters.all")}`);

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
      const id = items[index].id;
      if (!multiple) set(id);
      else set(!id ? [] : ticked.includes(id) ? ticked.filter((t) => t !== id) : [...ticked, id]);
      // Several choices: the menu stays open on the same choice after the redraw.
      reopen = multiple ? { name, active: index } : null;
      renderFilters();
      renderResults();
      // The menus are new elements: give the focus back to this one.
      document.getElementById(`recipe-filter-${name}`).focus();
      if (reopen) document.getElementById(`recipe-filter-${name}`).dispatchEvent(new CustomEvent("recipe-reopen"));
      reopen = null;
    }

    button.addEventListener("click", () => (isOpen() ? close() : open()));
    button.addEventListener("recipe-reopen", open);
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
      // A recipe shows when it fits at least one of the ticked use cases.
      (!state.useCases.length || (r.useCases || []).some((id) => state.useCases.includes(id))) &&
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

    if (visible.length) results.replaceChildren(...visible.map(resultRow));
    else {
      const cell = el("td", "recipe-empty", [text("empty")]);
      cell.colSpan = 7;
      results.replaceChildren(el("tr", null, [cell]));
    }
    revealSelected();

    renderSheet();
  }

  // The list scrolls inside its box: the selected recipe stays in view there,
  // without a move of the page.
  function revealSelected() {
    const box = results.closest(".recipe-scroll");
    const row = results.querySelector(".recipe-row.is-selected");
    if (!box || !row) return;
    const head = box.querySelector("thead").offsetHeight;
    const top = row.offsetTop - head;
    const bottom = row.offsetTop + row.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;
  }

  // The column headings of the table. The headings of the facts have a pop-up
  // with their description.
  function renderColumns() {
    const columns = document.getElementById("recipe-columns");
    if (!columns) return;
    // A column title. The table shows the short title when there is one
    // (columnsShort); the full name (columns) stays for screen readers, for the
    // hover text, for the pop-up and for the facts of the card.
    const heading = (key, tip, className) => {
      const label = text(`columns.${key}`);
      const shown = shortTitle(key);
      const cell = el("th", className, [shown]);
      cell.scope = "col";
      if (shown !== label) { cell.setAttribute("aria-label", label); cell.title = label; }
      if (tip) {
        const name = el("span", "recipe-tip", [shown]);
        setTip(name, text("tips.kinds.fact"), label, tip);
        cell.replaceChildren(name);
      }
      return cell;
    };
    columns.replaceChildren(el("tr", null, [
      heading("model"),
      heading("hardware"),
      heading("server"),
      heading("context", text("tips.tags.context"), "recipe-col-context"),
      heading("tools", text("tips.tags.tools"), "recipe-col-mark"),
      heading("reasoning", text("tips.tags.reasoning"), "recipe-col-mark"),
      useCaseHeading(),
    ]));
  }

  // The heading of the use cases, with a "?" button. The button opens a pop-up
  // with the sources of the benchmark data that the use cases read, and their
  // links. It is a popover: a click or a tap opens it, Escape or a click outside
  // closes it, and the keyboard reaches its links after the button.
  // The short title of a column, or its full name when it has none.
  function shortTitle(key) {
    return app.t(`recipes.columnsShort.${key}`, { optional: true }) || text(`columns.${key}`);
  }

  function useCaseHeading() {
    const label = text("columns.useCase");
    const shown = shortTitle("useCase");
    // The title carries the ⓘ: its pop-up explains each use case, one per line
    // ("Conversation: …"). The words in the rows have no ⓘ of their own.
    const name = el("span", "recipe-tip", [shown]);
    setTip(name, text("tips.kinds.useCase"), label, USE_CASES
      .map((useCase) => `${text("filters.name", { name: useCase.label })} ${text(`tips.useCases.${useCase.id}`)}`)
      .join("\n"));
    const cell = el("th", null, [name]);
    cell.scope = "col";
    if (shown !== label) { cell.setAttribute("aria-label", label); cell.title = label; }
    return cell;
  }

  // One row for each recipe. The row takes a click; the model name is a button,
  // for the keyboard and for screen readers.
  function resultRow(r) {
    const selected = r.id === state.selected;
    const pick = el("button", "recipe-pick", [el("span", "recipe-pick__model", [r.model]), el("span", "recipe-pick__publisher", [r.publisher])]);
    pick.type = "button";
    pick.setAttribute("aria-pressed", String(selected));
    // The use cases in plain words: the ⓘ of the column title explains them.
    const useCases = (r.useCases || []).map((id) => text(`useCases.${id}`)).join(", ");
    const row = el("tr", `recipe-row${selected ? " is-selected" : ""}`, [
      el("td", "recipe-cell-model", [pick]),
      el("td", "recipe-cell-nowrap", [r.hardwareLabel]),
      el("td", "recipe-cell-nowrap", [r.serverLabel]),
      el("td", null, [contextBar(r.facts.context)]),
      el("td", "recipe-cell-mark", [mark(r.facts.tools)]),
      el("td", "recipe-cell-mark", [mark(r.facts.reasoning)]),
      el("td", "recipe-cell-uses", [useCases]),
    ]);
    row.addEventListener("click", (event) => {
      state.selected = r.id;
      setSheetShown(true);
      renderResults();
      // The list is drawn again: the focus goes to the new button of the row, so
      // the keyboard keeps its place. The focus ring shows only when the row was
      // chosen with the keyboard (a click from a key has no pointer: detail 0).
      const fromKey = event.detail === 0;
      results.querySelector(".recipe-row.is-selected .recipe-pick")?.focus({ preventScroll: true, focusVisible: fromKey });
      // When the sheet is under the list, bring it into view.
      if (matchMedia("(max-width: 900px), (max-aspect-ratio: 1/1)").matches) sheet.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return row;
  }

  // The context length as a bar, on a log scale from 16K tokens to the longest
  // recipe, then its value. A recipe that does not set it uses the default of the model server.
  function contextBar(tokens) {
    const longest = Math.max(...RECIPES.map((r) => r.facts.context || 0));
    const low = Math.log2(16384);
    const width = tokens ? Math.max(6, ((Math.log2(tokens) - low) / (Math.log2(longest) - low)) * 100) : 0;
    const fill = el("i");
    fill.style.width = `${width}%`;
    // No length in the recipe (the model server's default): no bar, since there is
    // nothing to draw; the word starts at the left edge of the column.
    return el("span", `recipe-context${tokens ? "" : " is-default"}`, [
      tokens && el("span", "recipe-context__bar", [fill]),
      el("span", "recipe-context__value", [tokens ? `${Math.round(tokens / 1024)}K` : text("columns.contextDefault")]),
    ]);
  }

  // Tool calling and reasoning: a check for yes, a cross for no.
  // Yes or no in the table: a check or a cross (16px SVG), with the word for
  // screen readers.
  function mark(on) {
    return el("span", `recipe-mark${on ? " is-on" : ""}`, [
      icon(on ? "M5 12.5 10 17.5 19.5 7" : "M7 7l10 10M17 7 7 17", "recipe-mark__icon"),
      el("span", "sr-only", [text(on ? "facts.yes" : "facts.no")]),
    ]);
  }

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
      // A text of several lines (the use cases) keeps its lines.
      description.style.whiteSpace = "pre-line";

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
      sheetContent.replaceChildren(el("p", "recipe-empty", [text("noSelection")]));
      return;
    }

    const facts = r.facts;
    const file = r.files.find((f) => f.name === state.file) || r.files.find((f) => f.name === "model-server-config.yaml") || r.files[0];
    const tabs = el("div", "recipe-tabs", r.files.map((f) => {
      const tab = el("button", "recipe-tab", [f.name]);
      tab.type = "button";
      tab.setAttribute("aria-pressed", String(f === file));
      tab.addEventListener("click", () => { state.file = f.name; renderSheet(); });
      return tab;
    }));

    // The facts of the recipe, in the shared card layout: each label above its value,
    // in two columns. A wide fact takes the full width.
    const fact = (label, value, wide) => [el("div", wide ? "card__fact is-wide" : "card__fact", [el("dt", null, [label]), el("dd", null, [value])])];
    const list = el("dl", "card__facts card__facts--two", [
      // Short facts in pairs; long facts (the image, the use cases) on a full row.
      // The publisher first, with the model card, since the title is the model alone.
      ...fact(text("facts.publisher"), r.publisher),
      ...fact(text("facts.model"), link(text("sheet.modelCard"), `https://huggingface.co/${r.publisher}/${r.model}`)),
      ...fact(text("columns.hardware"), r.hardwareLabel),
      ...fact(text("columns.server"), r.serverLabel),
      ...(r.image ? fact(text("facts.image"), el("code", null, [r.image]), true) : []),
      ...fact(text("columns.useCase"), useCasesFact(r), true),
      ...fact(text("columns.context"), facts.context ? text("facts.context", { count: facts.context.toLocaleString(app.locale) }) : text("facts.contextDefault")),
      ...fact(text("columns.tools"), text(facts.tools ? "facts.yes" : "facts.no")),
      ...fact(text("columns.reasoning"), text(facts.reasoning ? "facts.yes" : "facts.no")),
    ]);

    sheetContent.replaceChildren(...[
      // The card head, as on the stack page: the kind, the model, the server and the
      // hardware in one sentence, then the facts.
      el("div", "recipe-sheet__head", [
        el("p", "card__kind", [text("sheet.kind")]),
        el("h2", "card__title", [r.model]),
        el("p", "card__text", [text("where", { server: r.serverLabel, hardware: r.hardwareLabel })]),
        list,
      ]),

      STACK_IS_PUBLIC && useThisRecipe(r),

      el("section", "recipe-files", [
        el("div", "recipe-files__top", [
          el("h3", "recipe-files__name", [text("sheet.files")]),
          STACK_IS_PUBLIC && link(text("sheet.github"), `${data.repo}/tree/${data.branch}/recipes/${r.id}`),
        ]),
        tabs,
        codeBlock(file.text, "recipe-code--file", file.name),
      ]),
    ].filter(Boolean));
  }

  // The use cases of a recipe in the card, then where they come from: the sources
  // of the benchmark data, with their links (they used to sit in a pop-up on the
  // column title).
  function useCasesFact(r) {
    const uses = (r.useCases || []).map((id) => text(`useCases.${id}`)).join(", ");
    const sources = (data.benchmarks && data.benchmarks.sources) || [];
    if (!sources.length) return uses;
    const links = sources.flatMap((source, i) => [i ? ` ${text("useCases.creditAnd")} ` : " ", link(source.name, source.url)]);
    return el("span", null, [uses, el("span", "card__note", [text("useCases.credit"), ...links, "."])]);
  }

  // The steps to install the recipe. Shown only when the stack repository is public.
  function useThisRecipe(r) {
    const env = [`HARDWARE_TARGET=${r.hardware}`, `MODEL_NAME=${r.model}`, `MODEL_ORG=${r.publisher}`, `MODEL_SERVER=${r.server}`].join("\n");
    return el("section", "recipe-use-panel", [
      el("h3", "recipe-files__name", [text("sheet.use.title")]),
      el("ol", "recipe-use", [
        el("li", null, [text("sheet.use.select"), codeBlock(env)]),
        el("li", null, [text("sheet.use.start"), codeBlock("docker compose up -d")]),
      ]),
    ]);
  }

  function setTip(node, kind, name, description) {
    node.dataset.tipKind = kind;
    node.dataset.tipName = name;
    node.dataset.tipText = description;
  }

  // A file, or a command, in the dark panel with the Copy button. In a YAML or
  // .env file the keys and the comments have their own colors.
  function codeBlock(content, modifier, name = "") {
    const copy = el("button", "recipe-copy", [text("sheet.copy")]);
    copy.type = "button";
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(content); copy.textContent = text("sheet.copied"); }
      catch { copy.textContent = text("sheet.copyFailed"); }
      setTimeout(() => { copy.textContent = text("sheet.copy"); }, 1600);
    });
    const pre = el("pre");
    if (/\.ya?ml$|^\.env$/.test(name)) pre.append(...highlight(content));
    else pre.textContent = content;
    return el("div", `recipe-code ${modifier || ""}`.trim(), [pre, copy]);
  }

  // The lines of a YAML or .env file, with the keys and the comments in spans.
  function highlight(content) {
    return content.split("\n").flatMap((line, i) => {
      const parts = [];
      const key = line.match(/^(\s*-?\s*[\w.@-]+)(\s*[:=])/);
      let rest = line;
      if (key) { parts.push(el("span", "recipe-code__key", [key[1]]), key[2]); rest = line.slice(key[0].length); }
      const hash = rest.search(/(^|\s)#/);
      if (hash >= 0) parts.push(rest.slice(0, hash), el("span", "recipe-code__comment", [rest.slice(hash)]));
      else parts.push(rest);
      return i ? ["\n", ...parts] : parts;
    });
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
