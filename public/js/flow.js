/*
 * The animation of the Hello World page. It plays in a loop:
 *
 *   1. Your AI agent sends a task to the stack. The task goes through the four core
 *      layers, across the contracts between them, and the result comes back.
 *   2. One component goes out and another one takes its place.
 *   3. The new component passes its test, like the other components.
 *
 * css/styles.css draws the picture. This script moves the task and the result from
 * place to place, and puts classes on the picture in time.
 *
 * The animation plays when it is on screen. A click on the picture or on the button
 * pauses it or plays it. A visitor who asks the system for reduced motion sees a
 * picture with no motion, and can play the animation with the button.
 */
(() => {
  "use strict";

  const app = window.CAIRN_APP;
  const root = document.getElementById("flow");
  if (!app || !root) return;
  const { t } = app;

  const stage = root.querySelector(".flow__stage");
  const toggle = root.querySelector(".flow__toggle");
  const area = stage.querySelector(".flow__area");
  const core = stage.querySelector(".flow__core");
  const slot = stage.querySelector(".flow__slot");
  const link = stage.querySelector(".flow__link");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // The way of the task: from the chat window to the API Endpoint, then through the
  // four layers. A place is a data-anchor value of the page, or "api".
  const TASK_PATH = [
    "chat", "api",
    "agentRuntime", "agentRuntime-modelAccess",
    "modelAccess", "modelAccess-toolAccess",
    "toolAccess", "toolAccess-persistence",
    "persistence", "persistence-agentRuntime",
    "agentRuntime",
  ];
  const ANSWER_PATH = ["agentRuntime", "api", "chat"];

  // One turn of the loop. `at` is the time from the start of the turn, in milliseconds.
  const TURN = 10400;
  const CUES = [
    { at: 0, run: clearTurn },
    { at: 350, run: () => stage.classList.add("has-task") },
    { at: 800, run: () => fly("task", TASK_PATH, 4400) },
    { at: 5200, run: () => fly("answer", ANSWER_PATH, 950) },
    { at: 6050, run: () => stage.classList.add("has-answer") },
    { at: 6600, run: swapOut },
    { at: 7500, run: swapIn },
    { at: 8400, run: passTest },
    { at: 8900, run: wave },
  ];

  let wanted = !reducedMotion.matches;   // the visitor wants the animation to play
  let visible = false;                   // the animation is on screen
  let running = false;                   // the animation plays now
  let started = false;
  let alt = false;                       // the second model server is in place
  let clock = 0;                         // the time played in the current turn
  let last = 0;
  let frame = 0;
  let queue = [];                        // what the current turn has still to do
  const flights = new Set();

  build();
  placeLink();
  if (!wanted) {
    stage.classList.add("is-static", "has-task", "has-answer");
  }
  renderToggle();

  toggle.addEventListener("click", onToggle);
  stage.addEventListener("click", onToggle);
  document.addEventListener("visibilitychange", sync);
  // On screen: from the moment when half of the picture shows, to the moment when
  // none of it shows.
  new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio >= 0.5) visible = true;
    else if (!entry.isIntersecting) visible = false;
    sync();
  }, { threshold: [0, 0.5] }).observe(stage);

  // The link follows the layout: the size of the page and the web font.
  new ResizeObserver(placeLink).observe(stage);
  if (document.fonts) document.fonts.ready.then(placeLink);

  // --- The picture ---------------------------------------------------------

  // A check on each component.
  function build() {
    stage.querySelectorAll(".flow__comp").forEach((comp, i) => {
      const check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      check.setAttribute("class", "flow__check");
      check.setAttribute("viewBox", "0 0 16 16");
      check.style.setProperty("--i", i);
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#flow-check");
      check.append(use);
      comp.append(check);
    });
  }

  function renderToggle() {
    const state = wanted ? "pause" : "play";
    toggle.dataset.state = state;
    toggle.setAttribute("aria-label", t(`flow.${state}`));
    toggle.title = t(`flow.${state}`);
  }

  function isColumn() {
    return getComputedStyle(stage).getPropertyValue("--flow-dir").trim() === "column";
  }

  // From your AI agent to the dashed line of the server side: to the right on a wide
  // screen, down on a narrow one.
  function placeLink() {
    const box = stage.getBoundingClientRect();
    const chat = stage.querySelector(".flow__chat").getBoundingClientRect();
    const to = area.getBoundingClientRect();
    const gap = 6;
    if (isColumn()) {
      const from = stage.querySelector(".flow__actor").getBoundingClientRect().bottom + gap;
      link.dataset.dir = "column";
      link.style.transform = `translate(${chat.left + chat.width / 2 - box.left - 1.5}px, ${from - box.top}px)`;
      link.style.width = "";
      link.style.height = `${Math.max(0, to.top + 1 - from)}px`;
    } else {
      const from = chat.right + gap;
      link.dataset.dir = "row";
      link.style.transform = `translate(${from - box.left}px, ${chat.top + chat.height / 2 - box.top - 1.5}px)`;
      link.style.height = "";
      link.style.width = `${Math.max(0, to.left + 1 - from)}px`;
    }
  }

  // The position of a place, from the top left corner of the stage.
  function locate(place) {
    const box = stage.getBoundingClientRect();
    if (place === "api") {
      const rect = link.getBoundingClientRect();
      return isColumn()
        ? { x: rect.left + rect.width / 2 - box.left, y: rect.bottom - box.top }
        : { x: rect.right - box.left, y: rect.top + rect.height / 2 - box.top };
    }
    const rect = stage.querySelector(`[data-anchor="${place}"]`).getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top };
  }

  // Moves a packet along its path. It appears at the start of the path and goes away
  // at its end. Each layer and each contract on the path shows the moment when the
  // packet gets to it.
  function fly(packet, path, time) {
    const node = stage.querySelector(`[data-packet="${packet}"]`);
    const spots = path.map(locate);
    const lengths = spots.slice(1).map((spot, i) => Math.hypot(spot.x - spots[i].x, spot.y - spots[i].y));
    const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
    const at = (spot) => `translate(${spot.x}px, ${spot.y}px)`;
    const fade = 0.05;
    let done = 0;
    const frames = [{ transform: at(spots[0]), opacity: 0, offset: 0 }];
    spots.forEach((spot, i) => {
      if (i) done += lengths[i - 1];
      const offset = fade + (1 - 2 * fade) * (done / total);
      frames.push({ transform: at(spot), opacity: 1, offset });
      if (path[i] !== "chat" && path[i] !== "api") {
        const place = path[i];
        queue.push({ at: clock + time * offset - 120, run: () => pulse(place) });
      }
    });
    frames.push({ transform: at(spots[spots.length - 1]), opacity: 0, offset: 1 });

    const flight = node.animate(frames, { duration: time, easing: "linear" });
    flights.add(flight);
    const forget = () => flights.delete(flight);
    flight.finished.then(forget, forget);
  }

  // A layer or a contract shows that the task is there.
  function pulse(place) {
    const node = stage.querySelector(`[data-anchor="${place}"]`);
    node.classList.remove("is-pulse");
    void node.offsetWidth;
    node.classList.add("is-pulse");
  }

  function server(second) {
    return slot.querySelector(second ? ".flow__comp--b" : ".flow__comp--a");
  }

  // The model server in place goes out.
  function swapOut() {
    server(alt).classList.add("is-out");
    slot.classList.add("is-empty");
  }

  // The other model server comes in. It has no check until it passes its test.
  function swapIn() {
    server(alt).classList.remove("is-out");
    alt = !alt;
    stage.classList.toggle("has-alt", alt);
    server(alt).classList.add("is-in", "is-new", "is-untested");
    slot.classList.remove("is-empty");
  }

  function passTest() {
    server(alt).classList.remove("is-untested");
  }

  // All the checks move, one after the other.
  function wave() {
    core.classList.remove("is-wave");
    void core.offsetWidth;
    core.classList.add("is-wave");
  }

  // The start of a turn: an empty chat window, and no new component.
  function clearTurn() {
    stage.classList.remove("has-task", "has-answer");
    core.classList.remove("is-wave");
    for (const comp of slot.children) comp.classList.remove("is-in", "is-new");
  }

  // --- The clock -----------------------------------------------------------

  function startTurn() {
    clock = 0;
    queue = CUES.map((cue) => ({ ...cue }));
    queue.push({ at: TURN, run: startTurn });
  }

  // Runs what is due. The clock stops while the animation is paused.
  function tick(now) {
    clock += Math.min(now - last, 250);
    last = now;
    const due = queue.filter((item) => item.at <= clock).sort((a, b) => a.at - b.at);
    queue = queue.filter((item) => item.at > clock);
    for (const item of due) item.run();
    frame = requestAnimationFrame(tick);
  }

  function hold() {
    cancelAnimationFrame(frame);
    flights.forEach((flight) => flight.pause());
    stage.classList.add("is-paused");
  }

  function resume() {
    stage.classList.remove("is-paused", "is-static");
    if (!started) {
      started = true;
      startTurn();
    }
    flights.forEach((flight) => flight.play());
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  // Plays when the visitor wants it, the animation is on screen and the tab shows.
  function sync() {
    const go = wanted && visible && !document.hidden;
    if (go && !running) {
      running = true;
      resume();
    } else if (!go && running) {
      running = false;
      hold();
    }
    renderToggle();
  }

  function onToggle(event) {
    event.stopPropagation();
    wanted = !wanted;
    sync();
  }
})();
