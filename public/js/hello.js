/*
 * The Hello World page: the rows of "Who it is for" and the carousel of the four
 * principles.
 *
 * The carousel shows one principle at a time and goes to the next one by itself.
 * It stops while the pointer or the keyboard focus is on it, and when the visitor
 * uses the pause button. A visitor who asks the system for reduced motion sees a
 * carousel that does not move, and can start it with the button.
 *
 * css/styles.css draws the slides and the pictures. This script changes the slide
 * that shows and makes the marks under the slides, one for each principle.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  if (!app) return;
  const { t } = app;

  // The time that one principle stays, in milliseconds.
  const SLIDE_TIME = 7000;

  renderAdopters();
  setUpCarousel();

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // One row for each type of adopter: its name and one line.
  function renderAdopters() {
    const list = document.getElementById("adopters");
    if (!list) return;
    list.replaceChildren(
      ...(t("hello.who.adopters") || []).map((adopter) => {
        const row = el("div", "adopters__row");
        row.append(el("dt", "", adopter.name), el("dd", "", adopter.text));
        return row;
      })
    );
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

    // One mark for each principle. The name of a mark is the position and the
    // name of its principle, for example "2 of 4: Replaceable by contract".
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
      mark.append(line);
      mark.addEventListener("click", () => show(i));
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
      run();
    }

    function hold(value) {
      return () => {
        held = value;
        run();
      };
    }

    root.querySelector('[data-carousel="previous"]').addEventListener("click", () => show(index - 1));
    root.querySelector('[data-carousel="next"]').addEventListener("click", () => show(index + 1));
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
