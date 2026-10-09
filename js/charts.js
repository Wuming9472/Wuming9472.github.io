/* The benchmark charts, drawn from js/bench-data.js (written by the measuring scripts):
   the speed-up for each file size, and disk write speed through a real copy.
   window.SaettaCharts.render(lang, T) redraws them in a language; .play() animates them. */
(function () {
  const data = window.SAETTA_BENCH;
  const sizeBox = document.getElementById("size-rows");
  const plot = document.getElementById("time-plot");
  if (!data || !sizeBox || !plot) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lang = "it", texts = {};

  const LOCALES = { it: "it-IT", en: "en-US", de: "de-DE", es: "es-ES", zh: "zh-CN" };
  const fmt = (n, digits) => n.toLocaleString(LOCALES[lang] || "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });
  const t = key => texts[key] || key;
  const clock = s => {
    if (s < 60) return fmt(s, 1) + " s";
    const whole = Math.round(s), rest = whole % 60;
    return Math.floor(whole / 60) + " min" + (rest ? " " + rest + " s" : "");
  };
  const speed = mbps => mbps >= 1000 ? fmt(mbps / 1000, mbps % 1000 ? 1 : 0) + " GB/s" : fmt(mbps, 0) + " MB/s";

  /* ---------- Speed-up by file size ---------- */
  function renderSizes() {
    const most = Math.max(...data.sizes.map(s => s.explorer / s.saetta));
    sizeBox.innerHTML = data.sizes.map(s => {
      const x = s.explorer / s.saetta;
      const width = Math.max(1.5, x / most * 100);
      return '<div class="srow">' +
        '<div class="slabel"><b>' + t("chart.rowLabel").replace("{n}", fmt(s.count, 0)).replace("{size}", s.label) + '</b><small>' + t("chart.ex" + s.key) + '</small></div>' +
        '<div class="sbar"><div class="strack"><i style="--to:' + width.toFixed(2) + '%"></i></div>' +
        '<div class="stimes"><span>' + t("speed.explorer") + ' ' + clock(s.explorer) + '</span> · <span>Saetta ' + clock(s.saetta) + '</span></div></div>' +
        '<div class="sval">' + fmt(x, 1) + '×</div>' +
        '</div>';
    }).join("");
  }

  /* ---------- Disk write speed through one copy ---------- */
  const W = 1000, H = 300;
  function niceStep(max, ticks, steps) { return steps.find(s => max / s <= ticks) || steps[steps.length - 1]; }
  function path(points, step, top) {
    return points.map((v, i) => (i ? "L" : "M") + (i * step / data.timeline.span * W).toFixed(1) + " " + (H - v / top * H).toFixed(1)).join(" ");
  }
  function renderTime() {
    const tl = data.timeline;
    const peak = Math.max(...tl.explorer, ...tl.saetta);
    const yStep = niceStep(peak, 4, [250, 500, 1000, 1500, 2000]);
    const top = Math.ceil(peak / yStep) * yStep;
    const xStep = niceStep(tl.span, plot.clientWidth < 520 ? 4 : 7, [5, 10, 15, 20, 30, 60, 120]);
    const exPath = path(tl.explorer, tl.step, top), saPath = path(tl.saetta, tl.step, top);
    const sx = tl.saettaEnd / tl.span * 100, ex = tl.explorerEnd / tl.span * 100;
    let grid = "", yLabels = "", xLabels = "";
    for (let v = yStep; v <= top; v += yStep) {
      const y = (1 - v / top) * 100;
      grid += '<line x1="0" x2="' + W + '" y1="' + (y * H / 100).toFixed(1) + '" y2="' + (y * H / 100).toFixed(1) + '"/>';
      yLabels += '<span style="top:' + y.toFixed(2) + '%">' + speed(v) + '</span>';
    }
    for (let s = 0; s <= tl.span + 0.01; s += xStep)
      xLabels += '<span style="left:' + (s / tl.span * 100).toFixed(2) + '%">' + fmt(s, 0) + ' s</span>';
    plot.innerHTML =
      '<div class="ylabels">' + yLabels + '</div>' +
      '<div class="canvas">' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
          '<defs><linearGradient id="saFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cyan);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--cyan);stop-opacity:0"/></linearGradient>' +
          '<linearGradient id="saLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--violet)"/><stop offset="1" style="stop-color:var(--cyan)"/></linearGradient>' +
          '<clipPath id="revealClip"><rect id="revealRect" x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath></defs>' +
          '<g class="grid">' + grid + '</g>' +
          '<g clip-path="url(#revealClip)">' +
            '<path class="ex-line" d="' + exPath + '" vector-effect="non-scaling-stroke"/>' +
            '<path class="sa-area" d="' + saPath + ' L' + (tl.saetta.length - 1) * tl.step / tl.span * W + ' ' + H + ' L0 ' + H + ' Z"/>' +
            '<path class="sa-line" d="' + saPath + '" vector-effect="non-scaling-stroke"/>' +
          '</g>' +
        '</svg>' +
        '<div class="end sa" style="left:' + sx.toFixed(2) + '%"><i></i><span><b>Saetta</b> ' + clock(tl.saettaEnd) + '</span></div>' +
        '<div class="end ex" style="left:' + ex.toFixed(2) + '%"><i></i><span><b>' + t("speed.explorer") + '</b> ' + clock(tl.explorerEnd) + '</span></div>' +
      '</div>' +
      '<div class="xlabels">' + xLabels + '</div>';
  }

  /* ---------- Motion: bars grow, the lines are drawn along the time axis ---------- */
  let playing = 0;
  function play() {
    if (reduced) return;
    sizeBox.classList.remove("grown");
    void sizeBox.offsetWidth;
    sizeBox.classList.add("grown");
    const rect = document.getElementById("revealRect");
    const ends = plot.querySelectorAll(".end");
    if (!rect) return;
    const tl = data.timeline, duration = 5200, id = ++playing;
    ends.forEach(e => e.classList.remove("shown"));
    const start = performance.now();
    (function frame(now) {
      if (id !== playing) return;
      const f = Math.min(1, (now - start) / duration);
      rect.setAttribute("width", (f * W).toFixed(1));
      const at = f * tl.span;
      if (at >= tl.saettaEnd) ends[0].classList.add("shown");
      if (at >= tl.explorerEnd - 0.01) ends[1].classList.add("shown");
      if (f < 1) requestAnimationFrame(frame);
    })(start);
  }

  /* Fewer time labels on a narrow screen: redrawn when the width changes. */
  let lastWidth = plot.clientWidth, resizing = 0;
  addEventListener("resize", () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => {
      if (Math.abs(plot.clientWidth - lastWidth) < 40) return;
      lastWidth = plot.clientWidth;
      renderTime();
      plot.querySelectorAll(".end").forEach(e => e.classList.add("shown"));
    }, 200);
  });

  window.SaettaCharts = {
    render(nextLang, dictionary) {
      lang = nextLang; texts = dictionary;
      renderSizes(); renderTime();
      sizeBox.classList.add("grown");
      plot.querySelectorAll(".end").forEach(e => e.classList.add("shown"));
    },
    play
  };
})();
