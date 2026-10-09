/* Saetta website: language, theme, the live copy window and the benchmark race. */

/* Set these before publishing. */
const STORE_URL = "https://apps.microsoft.com/detail/9N3TNPDLFPZW";
const PRO_PRICE = { it: "29,99 €", en: "€29.99", de: "29,99 €", es: "29,99 €", zh: "€29.99" };

/* The app's five languages; LOCALES formats the numbers the page draws. */
const T = { it: {}, en: window.SAETTA_EN || {}, de: window.SAETTA_DE || {}, es: window.SAETTA_ES || {}, zh: window.SAETTA_ZH || {} };
const LOCALES = { it: "it-IT", en: "en-US", de: "de-DE", es: "es-ES", zh: "zh-CN" };
const LIVE = window.SAETTA_LIVE;

/* Italian is the page's own text: read once, before any switch. */
document.querySelectorAll("[data-i18n]").forEach(el => { T.it[el.dataset.i18n] = el.textContent; });
document.querySelectorAll("[data-i18n-html]").forEach(el => { T.it[el.dataset.i18nHtml] = el.innerHTML; });
document.querySelectorAll("[data-i18n-aria]").forEach(el => { T.it[el.dataset.i18nAria] = el.getAttribute("aria-label"); });
document.querySelectorAll("[data-final]").forEach(el => { T.it[el.dataset.final] = el.textContent; });

let lang = "it";
function setLang(next) {
  lang = next;
  const t = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => { const v = t[el.dataset.i18n] || T.it[el.dataset.i18n]; if (v) el.textContent = v; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { const v = t[el.dataset.i18nHtml] || T.it[el.dataset.i18nHtml]; if (v) el.innerHTML = v; });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => { const v = t[el.dataset.i18nAria] || T.it[el.dataset.i18nAria]; if (v) el.setAttribute("aria-label", v); });
  document.querySelectorAll("[data-final]").forEach(el => { const v = t[el.dataset.final]; if (v) el.textContent = v; });
  document.querySelectorAll(".price-value").forEach(el => { el.textContent = PRO_PRICE[lang]; });
  document.getElementById("lang").value = lang;
  renderWindow();
  renderRates();
  if (window.SaettaCharts) window.SaettaCharts.render(lang, Object.assign({}, T.it, T[lang], (window.SAETTA_CHART || {})[lang]));
}
/* A language picked here is remembered; otherwise the browser's own decides. */
document.getElementById("lang").addEventListener("change", e => {
  setLang(e.target.value);
  try { localStorage.setItem("saetta-language", lang); } catch (e) {}
});

/* Theme: the device's own (the stylesheet follows prefers-color-scheme). The button swaps
   it for this visit only, so the next one follows the device again. */
document.getElementById("theme").addEventListener("click", () => {
  const root = document.documentElement;
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.dataset.theme = current === "light" ? "dark" : "light";
});
try { localStorage.removeItem("saetta-theme"); } catch (e) {}

document.querySelectorAll(".store-link").forEach(a => { a.href = STORE_URL; a.target = "_blank"; a.rel = "noopener"; });

/* Fluent reveal: the border follows the pointer. */
document.querySelectorAll(".reveal").forEach(el => {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  });
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (n, digits) => n.toLocaleString(LOCALES[lang], { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });

/* Sections below the first screen settle into place when reached. Visible throughout. */
if ("IntersectionObserver" in window && !reduced) {
  const rising = [...document.querySelectorAll(".rise")].filter(el => el.getBoundingClientRect().top > innerHeight);
  rising.forEach(el => el.classList.add("below"));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.remove("below"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  rising.forEach(el => io.observe(el));
}

/* The small drawings rest while they are off screen. */
if ("IntersectionObserver" in window && !reduced) {
  const drawings = [...document.querySelectorAll(".anim")];
  const watch = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle("paused", !e.isIntersecting)));
  drawings.forEach(el => watch.observe(el));
}

/* ---------------- The copy window: copying, then verifying ---------------- */
const W = {
  pct: document.getElementById("w-pct"), bar: document.getElementById("w-bar"), meter: document.getElementById("w-meter"),
  speed: document.getElementById("w-speed"), left: document.getElementById("w-left"), bytes: document.getElementById("w-bytes"),
  files: document.getElementById("w-files"), file: document.getElementById("w-file"), state: document.getElementById("w-state"),
  line: document.getElementById("w-line"), area: document.getElementById("w-area")
};
const TOTAL_GB = 26.2, TOTAL_FILES = 2481, COPY_SECONDS = 21, CHECK_SECONDS = 3.5;
const names = ["IMG_4821.HEIC", "IMG_4822.HEIC", "DSC_0193.NEF", "VID_20250714_1903.mp4", "Matrimonio/IMG_0042.jpg", "Panorama Dolomiti.tif", "IMG_5120.HEIC", "Scansioni/Passaporto.pdf", "VID_20250802_2110.mp4", "IMG_5371.HEIC"];
let samples = [];
let phase = "copy", progress = 0.64, check = 0, lastSpeed = 1.24;

function speedAt(t) {
  /* Small files at the start pull the curve down; large videos lift it. */
  return 1.05 + 0.22 * Math.sin(t * 0.9) + 0.12 * Math.sin(t * 2.7 + 1) + (t > 0.5 ? 0.08 : -0.15) * Math.exp(-t);
}
function drawGraph() {
  const n = samples.length;
  if (n < 2) { W.line.setAttribute("d", ""); W.area.setAttribute("d", ""); return; }
  const w = 300, h = 92, max = 1.7;
  const pts = samples.map((v, i) => [(i / 119) * w, h - 6 - (v / max) * (h - 14)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  W.line.setAttribute("d", d);
  W.area.setAttribute("d", d + " L" + pts[n - 1][0].toFixed(1) + " " + h + " L0 " + h + " Z");
}
function renderWindow() {
  const t = LIVE[lang];
  if (phase === "copy") {
    W.pct.textContent = Math.floor(progress * 100);
    W.bar.style.width = (progress * 100).toFixed(2) + "%";
    W.speed.textContent = fmt(lastSpeed, 2) + " GB/s";
    W.left.textContent = t.left.replace("{s}", Math.max(1, Math.ceil((1 - progress) * COPY_SECONDS)));
    W.bytes.textContent = fmt(progress * TOTAL_GB, 1) + t.of + fmt(TOTAL_GB, 1) + " GB";
    W.files.textContent = fmt(Math.round(progress * TOTAL_FILES), 0) + t.of + fmt(TOTAL_FILES, 0);
    W.file.textContent = names[Math.floor(progress * 97) % names.length];
    W.state.textContent = t.running;
  } else if (phase === "check") {
    W.pct.textContent = Math.floor(check * 100);
    W.bar.style.width = (check * 100).toFixed(2) + "%";
    W.speed.textContent = fmt(lastSpeed * 1.6, 2) + " GB/s";
    W.left.textContent = t.checkLeft;
    W.file.textContent = names[Math.floor(check * 53) % names.length];
    W.state.textContent = t.checking;
  } else {
    W.pct.textContent = "100";
    W.bar.style.width = "100%";
    W.speed.textContent = "—";
    W.left.textContent = t.leftDone;
    W.bytes.textContent = fmt(TOTAL_GB, 1) + t.of + fmt(TOTAL_GB, 1) + " GB";
    W.files.textContent = fmt(TOTAL_FILES, 0) + t.of + fmt(TOTAL_FILES, 0);
    W.file.textContent = "✓ " + t.verified;
    W.state.textContent = t.done;
  }
  W.file.classList.toggle("ok", phase === "done");
  W.state.classList.toggle("done", phase === "done");
  W.state.classList.toggle("check", phase === "check");
  W.meter.classList.toggle("check", phase === "check");
}

/* A still frame at 64% first: complete at rest, and what reduced motion keeps. */
for (let i = 0; i < 77; i++) samples.push(speedAt(i / 20));
drawGraph();

if (!reduced) {
  let last = performance.now(), hold = 0;
  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (phase === "copy") {
      progress = Math.min(1, progress + dt / COPY_SECONDS);
      lastSpeed = speedAt(progress * 6) + (Math.random() - 0.5) * 0.08;
      samples.push(lastSpeed);
      if (samples.length > 120) samples.shift();
      drawGraph();
      if (progress >= 1) { phase = "check"; check = 0; }
    } else if (phase === "check") {
      check = Math.min(1, check + dt / CHECK_SECONDS);
      if (check >= 1) { phase = "done"; hold = 0; }
    } else {
      hold += dt;
      if (hold > 3.4) { phase = "copy"; progress = 0; samples = []; drawGraph(); }
    }
    renderWindow();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------------- The race ---------------- */
const cases = [...document.querySelectorAll(".case")];
let racing = false;
function clock(s) {
  return s >= 60 ? Math.floor(s / 60) + " min " + Math.floor(s % 60) + " s" : fmt(s, 1) + " s";
}
/* Each card's figures come from its measured times: files per second where the count is
   what matters, otherwise GB per second; then the time saved. */
function renderRates() {
  cases.forEach(card => {
    const ex = parseFloat(card.dataset.explorer), sa = parseFloat(card.dataset.saetta);
    const files = parseFloat(card.dataset.files), bytes = parseFloat(card.dataset.bytes);
    const rate = secs => files ? fmt(Math.round(files / secs), 0) : fmt(bytes / 1e9 / secs, 2) + " GB/s";
    card.querySelector('[data-rate="ex"]').textContent = rate(ex);
    card.querySelector('[data-rate="sa"]').textContent = rate(sa);
    card.querySelector('[data-rate="saved"]').textContent = clock(ex - sa);
  });
}
function race() {
  if (racing || reduced) return;
  racing = true;
  const longest = 5200; /* each card's slowest bar takes this long, in ms */
  const start = performance.now();
  const rows = cases.flatMap(card => {
    const ex = parseFloat(card.dataset.explorer), sa = parseFloat(card.dataset.saetta);
    return [...card.querySelectorAll(".bar-row")].map(row => {
      const secs = row.classList.contains("sa") ? sa : ex;
      const fill = row.querySelector(".fill");
      return { secs, ms: longest * secs / ex, fill, t: row.querySelector(".t"), w: fill.style.getPropertyValue("--w") };
    });
  });
  rows.forEach(r => { r.fill.style.width = "0%"; });
  function frame(now) {
    const elapsed = now - start;
    let running = false;
    rows.forEach(r => {
      const f = Math.min(1, elapsed / r.ms);
      r.fill.style.width = "calc(" + r.w + " * " + f.toFixed(4) + ")";
      if (f < 1) { r.t.textContent = clock(r.secs * f); running = true; }
      else r.t.textContent = T[lang][r.t.dataset.final] || T.it[r.t.dataset.final];
    });
    if (running) requestAnimationFrame(frame);
    else { rows.forEach(r => { r.fill.style.width = ""; }); racing = false; }
  }
  requestAnimationFrame(frame);
}
document.getElementById("replay").addEventListener("click", () => { race(); if (window.SaettaCharts) window.SaettaCharts.play(); });
/* The charts play once by themselves, the first time they come into view. */
if ("IntersectionObserver" in window && !reduced && window.SaettaCharts) {
  const charts = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { charts.disconnect(); setTimeout(window.SaettaCharts.play, 250); }
  }, { threshold: 0.35 });
  charts.observe(document.getElementById("charts"));
}
/* Once by itself, the first time the cards come into view. Their bars are full until then. */
if ("IntersectionObserver" in window && !reduced) {
  const seen = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { seen.disconnect(); setTimeout(race, 350); }
  }, { threshold: 0.5 });
  seen.observe(document.querySelector(".bench"));
}

/* The visitor's language: one picked here before, else the first of the browser's languages
   the page has, else English. */
let savedLang = null;
try { savedLang = localStorage.getItem("saetta-language"); } catch (e) {}
const browserLang = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"])
  .map(l => l.toLowerCase().slice(0, 2)).find(l => l in T) || "en";
setLang(savedLang in T ? savedLang : browserLang);
