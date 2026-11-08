/* The benchmark chart, drawn from js/bench-data.js (written by the measuring scripts): the
   speed-up for each file size. window.SaettaCharts.render(lang, T) redraws it in a language;
   .play() grows its bars. (The disk-speed-through-a-copy chart was taken off the page on
   2026-11-08; its data stays in bench-data.js.) */
(function () {
  const data = window.SAETTA_BENCH;
  const sizeBox = document.getElementById("size-rows");
  if (!data || !sizeBox) return;
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

  /* ---------- Motion: the bars grow ---------- */
  function play() {
    if (reduced) return;
    sizeBox.classList.remove("grown");
    void sizeBox.offsetWidth;
    sizeBox.classList.add("grown");
  }

  window.SaettaCharts = {
    render(nextLang, dictionary) {
      lang = nextLang; texts = dictionary;
      renderSizes();
      sizeBox.classList.add("grown");
    },
    play
  };
})();
