/*
 * The Hello World page: the carousel of the four principles.
 *
 * The carousel shows one principle at a time and goes to the next one by itself.
 * It stops while the pointer or the keyboard focus is on it, and when the visitor
 * uses the pause button. A visitor who asks the system for reduced motion sees a
 * carousel that does not move, and can start it with the button.
 *
 * css/styles.css draws the slides and the pictures, and moves the parts of the
 * pictures. This script changes the slide that shows and makes the marks under the
 * slides: the tabs with the names of the principles. It also makes the points that move in the
 * picture of the third principle ("Your teams keep their tools").
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  if (!app) return;
  const { t } = app;

  // The time that one principle stays, in milliseconds.
  const SLIDE_TIME = 7000;

  // The picture of the tools: a point leaves a tool each second, and the loop of
  // the points starts again after this number of seconds. Keep it even, and a
  // multiple of the number of tools, so the points follow each other without a gap.
  const FLOW_LOOP = 6;

  setUpFlow();
  setUpCarousel();

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

  // Makes the points of the picture of the tools. Each second, a point goes from
  // one tool to the point of the one API, the point of the API makes a ring, then a
  // point goes from Cairn to the local or the remote compute. css/styles.css hides
  // the points for a visitor who asks the system for reduced motion.
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

    // A point that goes along a line in `share` of the loop, then stays hidden.
    function point(line, begin, share) {
      const circle = svgEl("circle", { class: "pic-tools__dot", r: 2.4, opacity: 0 });
      const motion = svgEl("animateMotion", { ...loop(begin), calcMode: "linear", keyPoints: "0;1;1", keyTimes: `0;${share};1` });
      motion.append(svgEl("mpath", { href: `#${line}` }));
      const show = svgEl("animate", {
        ...loop(begin),
        attributeName: "opacity",
        values: "0;1;1;0;0",
        keyTimes: `0;${share * 0.15};${share * 0.85};${share};1`,
      });
      circle.append(motion, show);
      return circle;
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

  function setUpCarousel() {
    const root = document.getElementById("principles");
    if (!root) return;
    const slides = [...root.querySelectorAll(".carousel__slide")];
    const toggle = root.querySelector('[data-carousel="toggle"]');
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let index = 0;
    let timer = null;
    // Stopped by the visitor, with the button.
    let paused = reducedMotion.matches;
    // Stopped for a moment: the pointer or the keyboard focus is on the carousel.
    let held = false;

    root.style.setProperty("--carousel-time", `${SLIDE_TIME}ms`);

    // One tab for each principle: its name, then the line that fills with the time.
    // For screen readers, the name of a tab is the position and the name of its
    // principle, for example "2 of 4: Replaceable by contract". The left and right
    // arrow keys move between the tabs.
    const marks = slides.map((slide, i) => {
      const mark = el("button", "carousel__mark");
      mark.type = "button";
      mark.setAttribute(
        "aria-label",
        t("hello.carousel.position")
          .replace("{index}", i + 1)
          .replace("{count}", slides.length)
          .replace("{name}", slide.querySelector(".carousel__name").textContent)
      );
      const line = el("i");
      line.append(el("b"));
      mark.append(el("span", "carousel__mark-name", slide.querySelector(".carousel__name").textContent), line);
      mark.addEventListener("click", () => show(i));
      mark.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        show(index + (event.key === "ArrowRight" ? 1 : -1));
        marks[index].focus();
      });
      return mark;
    });
    root.querySelector(".carousel__marks").replaceChildren(...marks);

    // Starts the time of the slide that shows from zero, or stops it.
    function run() {
      clearTimeout(timer);
      root.classList.remove("is-running");
      root.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", t(paused ? "hello.carousel.play" : "hello.carousel.pause"));
      if (paused || held) return;
      void root.offsetWidth;   // Starts the line of the mark again.
      root.classList.add("is-running");
      timer = setTimeout(() => show(index + 1), SLIDE_TIME);
    }

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-on", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
      });
      marks.forEach((mark, i) => mark.setAttribute("aria-current", String(i === index)));
      // The moving points of a picture start again with their slide.
      slides[index].querySelectorAll("svg").forEach((svg) => {
        if (svg.setCurrentTime) svg.setCurrentTime(0);
      });
      run();
    }

    function hold(value) {
      return () => {
        held = value;
        run();
      };
    }

    toggle.addEventListener("click", () => {
      paused = !paused;
      run();
    });
    root.addEventListener("pointerenter", hold(true));
    root.addEventListener("pointerleave", hold(false));
    root.addEventListener("focusin", hold(true));
    root.addEventListener("focusout", hold(false));

    show(0);
  }
})();
