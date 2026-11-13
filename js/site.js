/* Saetta website: the header (language, theme, the phone menu), the Store links, the entrances
   as things come into view, the benchmark race and the hero's bolt. Any page may load it:
   every part looks for its own elements and does nothing where they are missing. */

/* Set these before publishing. */
const STORE_URL = "https://apps.microsoft.com/detail/9N3TNPDLFPZW";
const PRO_PRICE = { it: "29,99 €", en: "€29.99", de: "29,99 €", es: "29,99 €", zh: "€29.99" };

(function () {
  "use strict";
  const root = document.documentElement;
  const lang = root.dataset.lang || "it";
  //The head's script stops waiting for this one (and shows everything) if it never arrives.
  window.SAETTA_UI = true;
  const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hasIo = "IntersectionObserver" in window;

  /* ---------------- Header ---------------- */
  /* Each language has its own pages, written by tools/build-site.py (English at the root, the
     others in /it/, /de/, /es/, /zh/). A language picked here is remembered: the English page
     at the root sends a visitor to it before anything is drawn. The same page in the other
     language (html[data-page], e.g. "benchmark/"), at the same place (the hash).
     A page whose own script runs the language picker says so with <html data-own-lang> (the
     text pages, which switch language in place), one that runs the theme button with
     data-own-theme: then this script leaves that control alone. */
  const PAGES = { en: "/", it: "/it/", de: "/de/", es: "/es/", zh: "/zh/" };
  const picker = document.getElementById("lang");
  if (picker && !root.hasAttribute("data-own-lang")) {
    picker.value = lang;
    const go = () => {
      const pick = picker.value;
      if (pick === lang || !PAGES[pick]) return;
      try { localStorage.setItem("saetta-language", pick); } catch (e) {}
      location.href = PAGES[pick] + (root.dataset.page || "") + location.hash;
    };
    /* A language picked from the open list (mouse, touch, Enter) opens its page at once. On the
       closed list the arrow keys and typing only move the choice, although Edge and Chrome
       report a "change" for each key: Enter opens it, Escape or leaving the list puts the
       current language back (WCAG 3.2.2, no change of page on input alone). */
    let keyedAt = -1;
    picker.addEventListener("keydown", e => {
      if (e.key === "Enter") { go(); return; }
      if (e.key === "Escape") { picker.value = lang; return; }
      if (!e.altKey && !e.ctrlKey && !e.metaKey && (/^(Arrow|Page|Home$|End$)/.test(e.key) || (e.key.length === 1 && e.key !== " "))) keyedAt = e.timeStamp;
    });
    picker.addEventListener("change", e => { if (keyedAt >= 0 && e.timeStamp - keyedAt < 500) return; go(); });
    //A choice left pending by the keys must not hide the list's own: the list opens on the current language.
    picker.addEventListener("pointerdown", () => { if (picker.value !== lang) picker.value = lang; });
    picker.addEventListener("blur", () => { picker.value = lang; });
  }
  /* Theme: the device's own (the stylesheet follows prefers-color-scheme). The button swaps it
     for this visit only, so the next visit follows the device again. */
  const theme = document.getElementById("theme");
  if (theme && !root.hasAttribute("data-own-theme")) {
    theme.addEventListener("click", () => {
      const dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
      const current = root.dataset.theme || (dark ? "dark" : "light");
      root.dataset.theme = current === "light" ? "dark" : "light";
    });
  }
  try { localStorage.removeItem("saetta-theme"); } catch (e) {}

  /* Phones: the links fold under a menu button (the stylesheet hides them once html.has-menu
     is set, so without this script they simply wrap). */
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-btn");
  const nav = document.getElementById("site-nav");
  if (header && menuButton && nav) {
    root.classList.add("has-menu");
    const setOpen = open => {
      header.classList.toggle("nav-open", open);
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    };
    menuButton.addEventListener("click", () => setOpen(menuButton.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", e => { if (e.target.closest && e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && header.classList.contains("nav-open")) { setOpen(false); menuButton.focus(); }
    });
    const wide = window.matchMedia && matchMedia("(min-width: 1081px)");
    if (wide && wide.addEventListener) wide.addEventListener("change", e => { if (e.matches) setOpen(false); });
  }

  /* The Store links carry the address in the page (they work without scripts); here they open
     in a new tab. */
  document.querySelectorAll(".store-link").forEach(a => { a.href = STORE_URL; a.target = "_blank"; a.rel = "noopener"; });

  /* ---------------- Entrances ---------------- */
  /* Each element waits, hidden, until it comes into view; then it gets .sa-on and its CSS
     animation plays to the end by itself, whatever the scroll does next. A race starts once
     its bars are wholly in view. Without IntersectionObserver, or with reduced motion, nothing
     is hidden. */
  /* The head's script hides them from the first paint (html.sa-js), on the same test; if this
     script came too late, it showed them all again, and they stay shown. A page without that
     script: decided here. */
  let io = null;
  if (hasIo && !reduce && !root.classList.contains("js")) root.classList.add("sa-js");
  if (hasIo && !reduce && root.classList.contains("sa-js")) {
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target.classList.contains("sa-race-bars")) {
          if (e.intersectionRatio < 0.99) return;
          const card = e.target.closest(".sa-race-card");
          if (card) card.classList.add("sa-go");
        } else e.target.classList.add("sa-on");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: [0.12, 1] });
    document.querySelectorAll(".sa-h, .sa-rv, .sa-from-r, .sa-from-l, .sa-sub, .sa-pop, .sa-rule, .sa-grow, .sa-race-bars").forEach(el => io.observe(el));
    /* Keyboard focus on something still hidden (at the screen's lower edge): it shows now. */
    document.addEventListener("focusin", e => {
      const hidden = e.target.closest && e.target.closest(".sa-h, .sa-rv, .sa-from-r, .sa-from-l, .sa-sub, .sa-pop");
      if (hidden) hidden.classList.add("sa-on");
    });
  }

  /* "Riproduci la gara": the races already run start again, those in view at once; the others
     when they next come wholly into view, so that they are seen. */
  document.querySelectorAll(".race-replay").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".sa-race-card.sa-go").forEach(card => {
        card.classList.remove("sa-go");
        const bars = card.querySelector(".sa-race-bars");
        const r = bars && bars.getBoundingClientRect();
        if (!io || !r || (r.top >= 0 && r.bottom <= innerHeight)) {
          void card.offsetWidth;
          card.classList.add("sa-go");
        } else io.observe(bars);
      });
    });
  });

  /* ---------------- The bolt ---------------- */
  /* The intro plays once, then the loop, seamlessly: the intro ends on the clip's frame 139, the
     loop starts on 140. The bolt moves for more than 5 seconds and loops, so it can be stopped
     and replayed (WCAG 2.2.2). Off screen it pauses. Any failure shows the still; with reduced
     motion the still, and no video is downloaded (preload none). */
  (function () {
    const wrap = document.querySelector(".sa-vid-wrap");
    if (!wrap) return;
    const intro = wrap.querySelector("video.sa-v-intro"), loop = wrap.querySelector("video.sa-v-loop");
    const still = wrap.querySelector(".sa-still"), mid = wrap.querySelector(".sa-mid");
    const button = document.querySelector(".sa-replay");
    const labelStop = button && button.querySelector('[data-label="stop"]');
    const labelReplay = button && button.querySelector('[data-label="replay"]');
    const st = { phase: "intro", still: false, stopped: false, reduce: false, broken: false };
    let handoff = 0, started = false, armed = false, midIn = null, pendingStart = false, loopFailed = false, readyTimer = 0;
    let startIo = null;

    function render() {
      wrap.classList.toggle("sa-fallback", st.still);
      if (intro) intro.classList.toggle("sa-hide", st.phase !== "intro");
      //The still is fetched only when it is shown.
      if (st.still && still && still.loading === "lazy") still.loading = "eager";
      if (button) {
        button.hidden = st.reduce || st.broken;
        //"Ferma l'animazione" only once the bolt moves: before, it holds its place unseen.
        button.classList.toggle("sa-wait", !started && !st.still);
        const replay = st.still || st.stopped;
        if (labelStop) labelStop.hidden = replay;
        if (labelReplay) labelReplay.hidden = !replay;
      }
    }
    function set(patch) { Object.assign(st, patch); render(); }
    //Only what the error listener saw: networkState is 3 at load too, before a source is picked.
    function failed(v) { return !!v.error || !!v.saFailed; }

    /* A refused autoplay (power saving, browser policy) shows the still instead of a black
       frame; an interrupted play() (a pause or a replay) is not a failure. */
    function play(v) {
      const p = v.play();
      if (p && p.catch) p.catch(e => { if (!e || e.name !== "AbortError") set({ still: true }); });
    }
    function playIntro() {
      ++handoff;
      started = true;
      pendingStart = false;
      if (startIo) { startIo.disconnect(); startIo = null; }
      loop.pause();
      loop.currentTime = 0;
      intro.currentTime = 0;
      set({ phase: "intro", still: false, stopped: false });
      play(intro);
    }
    /* The loop plays under the intro, which holds its last frame and is hidden only once the
       loop has painted: no blank frame. */
    function toLoop() {
      if (loopFailed || failed(loop)) { set({ still: true }); return; }
      const token = handoff;
      const go = () => { if (token === handoff) set({ phase: "loop" }); };
      fetchLoop();
      if (loop.requestVideoFrameCallback) loop.requestVideoFrameCallback(go);
      else loop.addEventListener("playing", go, { once: true });
      play(loop);
    }
    /* The first start: once the intro is ready, and only while the bolt's centre is on screen. */
    function start() {
      if (started || st.stopped || st.still) return;
      if (midIn === false) { pendingStart = true; return; }
      playIntro();
    }
    /* The loop is fetched once the intro is playing and wholly downloaded (2 s before its end
       at the latest), so it never takes bandwidth from the intro. */
    function fetchLoop() {
      if (loop && loop.preload !== "auto") { loop.preload = "auto"; loop.load(); }
    }
    function onIntroProgress() {
      if (!started || !intro.duration || !loop || loop.preload === "auto") return;
      const b = intro.buffered;
      if ((b.length && b.end(b.length - 1) >= intro.duration - 0.05) || intro.currentTime >= intro.duration - 2) fetchLoop();
    }
    /* Source errors do not bubble: listened to in capture. A missing loop lets the intro play
       to its end, and the still follows it; any other failure shows the still at once. */
    function onMediaError(e) {
      const v = e.currentTarget;
      if (!(v.error || v.networkState === 3)) return;
      v.saFailed = true;
      if (v === loop && st.phase === "intro" && !st.still && intro && !intro.ended && !failed(intro)) { loopFailed = true; return; }
      set({ still: true, broken: st.broken || v === intro });
    }
    /* Start once the intro can play its whole flash without a stall, two frames later. Chrome
       says canplaythrough after about 0.2 MB, but the flash is front-loaded: wait for 60 % of
       the file. Not there after 4 s: the still (the button can try again). */
    function whenReady(go) {
      let done = false;
      const enough = () => intro.readyState >= 4 && intro.duration > 0 && intro.buffered.length > 0 && intro.buffered.end(intro.buffered.length - 1) >= intro.duration * 0.6;
      const stop = () => {
        done = true;
        clearTimeout(readyTimer);
        intro.removeEventListener("canplaythrough", check);
        intro.removeEventListener("progress", check);
      };
      const later = () => requestAnimationFrame(() => requestAnimationFrame(go));
      function check() { if (!done && enough()) { stop(); later(); } }
      if (enough()) { stop(); later(); return; }
      intro.addEventListener("canplaythrough", check);
      intro.addEventListener("progress", check);
      readyTimer = setTimeout(() => { if (!done) { stop(); set({ still: true }); } }, 4000);
    }

    if (button) {
      button.addEventListener("click", () => {
        if (!intro || !loop || failed(intro)) return;
        if (st.still || st.stopped) { playIntro(); return; }
        const token = ++handoff;
        intro.pause();
        loop.pause();
        set({ stopped: true });
        if (still) still.loading = "eager";
        if (still && still.decode) still.decode().then(() => { if (token === handoff) set({ still: true }); }, () => {});
        else set({ still: true });
      });
    }

    if (reduce) { set({ still: true, reduce: true }); return; }
    if (!intro || !loop) { set({ still: true, broken: true }); return; }
    [intro, loop].forEach(v => {
      v.addEventListener("error", onMediaError, true);
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
    });
    loop.loop = true;
    intro.addEventListener("ended", toLoop);
    ["playing", "progress", "suspend", "timeupdate"].forEach(t => intro.addEventListener(t, onIntroProgress));
    render();
    //The loop stays at preload none until the intro has arrived (onIntroProgress).
    intro.preload = "auto";
    intro.load();

    /* Start when the bolt's centre is on screen: at once on a computer, on a phone when it is
       scrolled to (the hero text comes first there). Ready while scrolled away: it waits. */
    if (hasIo && mid) {
      startIo = new IntersectionObserver(es => {
        midIn = es[es.length - 1].isIntersecting;
        if (!midIn) return;
        if (!armed) { armed = true; whenReady(start); }
        else if (pendingStart) { pendingStart = false; start(); }
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
      startIo.observe(mid);
    } else { armed = true; whenReady(start); }

    /* Off screen, the bolt pauses; back on screen, it goes on. */
    if (hasIo) {
      new IntersectionObserver(es => {
        const e = es[es.length - 1];
        if (!started || st.still || st.stopped) return;
        const v = st.phase === "loop" ? loop : intro;
        if (e.isIntersecting) { if (v.paused && !v.ended) play(v); }
        else if (!v.paused) v.pause();
      }).observe(wrap);
    }
  })();
})();
