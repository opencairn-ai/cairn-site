/*
 * The Hello World page: the four principles, each with its picture.
 *
 * One principle is open, and its picture shows on the right. The carousel
 * moves to the next one by itself. A click, or the arrow keys, opens that
 * principle and its picture. A visitor who asks for reduced motion gets a
 * carousel that stays put until they choose a principle.
 * css/styles.css hides the moving points when the visitor asks for reduced motion.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  if (!app) return;
  const { t } = app;

  // A point leaves a tool each second. The loop matches the 12 second motion in the design.
  const FLOW_LOOP = 12;
  // How long one principle and its picture stay before the next one.
  const SLIDE_TIME = 7000;
  // The principle that is open when the page loads: the first one, Transparency.
  const OPEN_AT = 0;

  shapeTitle();
  setUpFlow();
  setUpPrinciples();
  setUpContractScale();

  // The default-lingo line uses one alternate per letter, as in the frame.
  // A child feature setting replaces the one on the word, so each letter names its own.
  function shapeTitle() {
    const mark = document.querySelector(".hello__title-mark");
    if (!mark) return;
    if (mark.textContent === "open source") shapeEnglish(mark);
    if (mark.textContent === "à code source ouvert") shapeFrench(mark);
  }

  function shapeEnglish(mark) {
    mark.replaceChildren(
      el("span", "salt", "o"),
      el("span", "plain", "p"),
      el("span", "salt kern-e", "e"),
      el("span", "ss02", "n "),
      el("span", "plain", "s"),
      el("span", "salt", "our"),
      el("span", "plain", "c"),
      el("span", "salt", "e"),
    );
    // "stack" stays in Space Grotesk. Two letters are pulled in, as in the frame.
    const rest = mark.nextElementSibling;
    if (!rest || !rest.textContent.endsWith("stack")) return;
    const prefix = rest.textContent.slice(0, -5);
    rest.replaceChildren(prefix, "st", el("span", "kern-a", "a"), el("span", "kern-c", "c"), "k");
  }

  // The French line is all Default Lingo. The space before "ouvert" is set at
  // the 80px of the first line, and "r" / "t" are pulled in as in the frame.
  function shapeFrench(mark) {
    mark.replaceChildren(
      el("span", "plain", "à c"),
      el("span", "salt", "o"),
      el("span", "plain", "d"),
      el("span", "salt", "e"),
      el("span", "ss02", " "),
      el("span", "plain", "s"),
      el("span", "salt", "our"),
      el("span", "plain", "c"),
      el("span", "salt", "e"),
      el("span", "space-base plain", " "),
      el("span", "salt", "o"),
      el("span", "plain", "u"),
      el("span", "plain", "v"),
      el("span", "plain", "e"),
      el("span", "kern-r plain", "r"),
      el("span", "kern-t ss02", "t"),
    );
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function svgEl(tag, attributes) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  // Small magenta pixels along the connector lines (not purple dots on the lines).
  function setUpFlow() {
    const tools = document.getElementById("flow-tools");
    const compute = document.getElementById("flow-compute");
    if (!tools || !compute) return;
    const api = tools.querySelector(".pic-tools__api");
    const lines = (svg) => [...svg.querySelectorAll("path")].map((path) => path.id);
    const toApi = lines(tools);
    const toCompute = lines(compute);

    // The attributes of a motion that starts at `begin` seconds and repeats.
    const loop = (begin) => ({ dur: `${FLOW_LOOP}s`, begin: `${begin}s`, repeatCount: "indefinite" });

    const px = 3;
    const half = px / 2;

    // A pixel that travels along a line briefly, then hides until the next lap.
    function point(line, begin, share) {
      const group = svgEl("g", { class: "pic-tools__pixel", opacity: 0 });
      group.append(svgEl("rect", { x: -half, y: -half, width: px, height: px }));
      const motion = svgEl("animateMotion", { ...loop(begin), calcMode: "linear", keyPoints: "0;1;1", keyTimes: `0;${share};1` });
      motion.append(svgEl("mpath", { href: `#${line}` }));
      const tIn = share * 0.12;
      const tOut = share * 0.88;
      const show = svgEl("animate", {
        ...loop(begin),
        attributeName: "opacity",
        values: "0;0;1;1;0;0",
        keyTimes: `0;${tIn};${tIn + 0.02};${tOut};${tOut + 0.02};1`,
      });
      group.append(motion, show);
      return group;
    }

    // The ring that the point of the API makes when a point comes to it.
    function ring(begin) {
      const circle = svgEl("circle", { class: "pic-tools__ring", cx: api.getAttribute("cx"), cy: api.getAttribute("cy"), r: 3, opacity: 0 });
      circle.append(
        svgEl("animate", { ...loop(begin), attributeName: "r", values: "3;3;8;8", keyTimes: "0;0.001;0.1;1" }),
        svgEl("animate", { ...loop(begin), attributeName: "opacity", values: "0;0.6;0;0", keyTimes: "0;0.001;0.1;1" })
      );
      return circle;
    }

    for (let second = 0; second < FLOW_LOOP; second += 1) {
      // The points and the rings are under the point of the API.
      api.before(point(toApi[second % toApi.length], second, 0.15), ring(second + 0.85));
      compute.append(point(toCompute[second % toCompute.length], second + 1.05, 0.09));
    }
  }

  function setUpPrinciples() {
    const root = document.getElementById("principles");
    if (!root) return;
    const principles = t("hello.principles");
    if (!Array.isArray(principles)) return;

    const items = principles.map((principle, i) => {
      const button = el("button", "approach__card");
      button.type = "button";
      button.id = `principle-${i}`;
      button.setAttribute(
        "aria-label",
        t("hello.carousel.position").replace("{index}", i + 1).replace("{count}", principles.length).replace("{name}", principle.name)
      );
      button.append(el("span", "approach__tag", principle.tag), el("span", "approach__name", principle.name));

      const panel = el("div", "approach__panel");
      panel.id = `principle-panel-${i}`;
      button.setAttribute("aria-controls", panel.id);
      panel.append(el("p", null, principle.text));

      button.addEventListener("click", () => show(i));
      button.addEventListener("keydown", (event) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
        if (!step) return;
        event.preventDefault();
        show(i + step);
        buttons[(i + step + principles.length) % principles.length].focus();
      });

      const item = el("div", "approach__item");
      item.setAttribute("role", "listitem");
      item.append(button, panel);
      return item;
    });
    const buttons = items.map((item) => item.querySelector(".approach__card"));
    const pictures = [...document.querySelectorAll(".approach__stage .carousel__slide")];
    const dots = [...document.querySelectorAll(".approach__dots i")];
    root.replaceChildren(...items);

    // Picture order matches the four principles: tests, contract, tools, skeleton.
    let current = 0;
    let timer = null;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    function show(next) {
      current = (next + items.length) % items.length;
      items.forEach((item, i) => {
        const open = i === current;
        item.classList.toggle("is-open", open);
        buttons[i].setAttribute("aria-expanded", String(open));
        item.querySelector(".approach__panel").hidden = !open;
      });
      pictures.forEach((picture, i) => picture.classList.toggle("is-on", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("is-on", i === current));
      arm();
    }

    // Moves on after SLIDE_TIME, unless the visitor asked for reduced motion
    // or the keyboard focus is in the list.
    function arm() {
      clearTimeout(timer);
      if (reducedMotion.matches || root.contains(document.activeElement)) return;
      timer = setTimeout(() => show(current + 1), SLIDE_TIME);
    }

    // A click on a mark in the corner of the frame opens its principle. The marks
    // stay out of the tab order and hidden from screen readers: the cards already
    // do the same for the keyboard.
    dots.forEach((dot, i) => dot.addEventListener("click", () => { if (i !== current) show(i); }));

    root.addEventListener("focusin", () => clearTimeout(timer));
    root.addEventListener("focusout", () => arm());
    reducedMotion.addEventListener("change", () => arm());

    show(OPEN_AT);
    holdHeight(items);
  }

  // Every open card takes the height of the tallest one, so the list and the
  // picture frame next to it keep one size whichever principle is open. The
  // tallest depends on the language, the width and the web fonts: measure again
  // when the width changes and when the fonts arrive.
  function holdHeight(items) {
    const list = items[0] && items[0].parentElement;
    if (!list) return;

    const measure = () => {
      list.style.removeProperty("--approach-open-h");
      let tallest = 0;
      for (const item of items) {
        const panel = item.querySelector(".approach__panel");
        const wasOpen = item.classList.contains("is-open");
        // Open each card for the measure only; nothing paints in between.
        item.classList.add("is-open");
        panel.hidden = false;
        tallest = Math.max(tallest, item.getBoundingClientRect().height);
        item.classList.toggle("is-open", wasOpen);
        panel.hidden = !wasOpen;
      }
      list.style.setProperty("--approach-open-h", `${Math.ceil(tallest)}px`);
    };

    measure();
    if (document.fonts) document.fonts.ready.then(measure);
    let width = list.clientWidth;
    const onResize = () => {
      if (list.clientWidth === width) return;
      width = list.clientWidth;
      measure();
    };
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(list);
    else window.addEventListener("resize", onResize);
  }

  // Figma draws the contract graph in an 865px frame. Keep that geometry and
  // scale it down with the stage, so the frame stays centred on every width.
  function setUpContractScale() {
    const stage = document.querySelector(".approach__stage");
    if (!stage || !stage.querySelector(".pic-contract")) return;

    const update = () => {
      const scale = Math.min(1, stage.clientWidth / 865);
      stage.style.setProperty("--contract-scale", scale.toFixed(4));
    };
    update();
    if (window.ResizeObserver) new ResizeObserver(update).observe(stage);
    else window.addEventListener("resize", update);
  }

})();
