/* The full benchmarks page: language and theme as on the home page, then the results from
   js/bench-full.js (window.SAETTA_BENCH_FULL, written by tools/bench-site-data.py from the
   measuring scripts' results). Until that file holds results, the page says they are coming.
   The texts drawn here are Italian below; the other languages' come from their dictionaries
   (bm.* keys in js/i18n-<lang>.js). */
(function () {
  const STORE_URL = "https://apps.microsoft.com/detail/9N3TNPDLFPZW";   /* as in site.js */
  const lang = document.documentElement.dataset.lang || "it";
  const page = document.documentElement.dataset.page || "";
  const PAGES = { en: "/", it: "/it/", de: "/de/", es: "/es/", zh: "/zh/" };
  const LOCALES = { it: "it-IT", en: "en-US", de: "de-DE", es: "es-ES", zh: "zh-CN" };

  const IT = {
    "bm.explorer": "Esplora file",
    "bm.sc.ssd": "SSD → SSD", "bm.sc.ssd.text": "Copia da un SSD allo stesso SSD.",
    "bm.sc.ce": "SSD → disco rigido", "bm.sc.ce.text": "Copia dall'SSD a un disco rigido esterno USB.",
    "bm.sc.ec": "Disco rigido → SSD", "bm.sc.ec.text": "Copia da un disco rigido esterno USB all'SSD.",
    "bm.sc.ee": "Stesso disco rigido", "bm.sc.ee.text": "Copia da una cartella a un'altra dello stesso disco rigido esterno: lettura e scrittura sullo stesso disco.",
    "bm.sc.de": "Tra due dischi rigidi", "bm.sc.de.text": "Copia da un disco rigido esterno USB a un altro.",
    "bm.sc.stick": "Chiavetta USB", "bm.sc.stick.text": "Copia dall'SSD a una chiavetta USB formattata FAT32, come escono dalla fabbrica quelle fino a 32 GB.",
    "bm.sc.sd": "Scheda SD", "bm.sc.sd.text": "Copia dall'SSD a una scheda SD formattata exFAT, nel lettore del portatile.",
    "bm.sc.del-ssd": "Eliminazione su SSD", "bm.sc.del-ssd.text": "Eliminazione definitiva, senza Cestino, su un SSD.",
    "bm.sc.del-hdd": "Eliminazione su disco rigido", "bm.sc.del-hdd.text": "Eliminazione definitiva, senza Cestino, su un disco rigido esterno USB.",
    "bm.setFiles": "{n} file da {size}",
    "bm.setMix": "Cartella mista: documenti, foto e video",
    "bm.setTree": "Albero di cartelle con file piccoli",
    "bm.setSys": "Programmi di Windows (.exe e .dll)",
    "bm.setSub": "{files} file · {total}",
    "bm.setSubFolders": "{files} file in {folders} cartelle · {total}",
    "bm.faster": "<b>{x}×</b> più veloce di Esplora file",
    "bm.slower": "Esplora file <b>{x}×</b> più veloce",
    "bm.even": "Alla pari con Esplora file",
    "bm.fastest": "più veloce",
    "bm.notMeasured": "non misurato",
    "bm.tip": "Mediana {m} · prove: {runs}",
    "bm.kind": "Tipo di file",
    "bm.showTable": "Mostra come tabella", "bm.hideTable": "Nascondi la tabella",
    "bm.sumCases": "confronti misurati",
    "bm.sumWins": "volte Saetta è la più veloce, su {n}",
    "bm.sumBest": "più veloce di Esplora file, al massimo",
    "bm.versions": "Misurato il {date}. PC: {pc}. Versioni: Saetta {saetta}, {os}.",
  };
  const dict = window["SAETTA_" + lang.toUpperCase()] || {};
  const t = key => (lang !== "it" && dict[key]) || IT[key] || key;
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => (k in values ? values[k] : "{" + k + "}"));
  const fmt = (n, digits) => n.toLocaleString(LOCALES[lang] || "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------- the page's common parts ---------- */
  const select = document.getElementById("lang");
  select.value = lang;
  select.addEventListener("change", e => {
    try { localStorage.setItem("saetta-language", e.target.value); } catch (err) {}
    location.href = PAGES[e.target.value] + page;
  });
  document.getElementById("theme").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    root.dataset.theme = current === "light" ? "dark" : "light";
  });
  document.querySelectorAll(".store-link").forEach(a => { a.href = STORE_URL; a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- the results ---------- */
  const data = window.SAETTA_BENCH_FULL;
  const scenarios = (data && data.scenarios || []).filter(s => s.rows && s.rows.length);
  if (!scenarios.length) return;   /* the "coming soon" note stays */
  document.getElementById("bm-empty").hidden = true;

  const PROGRAMS = ["saetta", "explorer"];
  const NAME = p => (p === "saetta" ? "Saetta" : t("bm.explorer"));
  const SIZES = { "4K": "4 KB", "64K": "64 KB", "1M": "1 MB", "16M": "16 MB", "256M": "256 MB", "4G": "4 GB" };
  const median = runs => { const s = runs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const clock = s => {
    if (s < 10) return fmt(s, 2) + " s";
    if (s < 60) return fmt(s, 1) + " s";
    const whole = Math.round(s), rest = whole % 60;
    return Math.floor(whole / 60) + " min" + (rest ? " " + rest + " s" : "");
  };
  const bytes = n => (n >= 1e9 ? fmt(n / 1e9, 1) + " GB" : fmt(Math.max(1, Math.round(n / 1e6)), 0) + " MB");
  function label(row) {
    const base = row.set.replace(/s$/, "");
    if (SIZES[base]) return fill(t("bm.setFiles"), { n: fmt(row.files, 0), size: SIZES[base] });
    if (base === "MIX") return t("bm.setMix");
    if (base === "TREE") return t("bm.setTree");
    if (base === "SYS") return t("bm.setSys");
    return row.set;
  }
  function sub(row) {
    const values = { files: fmt(row.files, 0), total: bytes(row.bytes), folders: fmt(row.folders || 0, 0) };
    return fill(t(row.folders > 1 ? "bm.setSubFolders" : "bm.setSub"), values);
  }
  const medians = row => Object.fromEntries(PROGRAMS.filter(p => row.runs[p] && row.runs[p].length).map(p => [p, median(row.runs[p])]));
  const fastest = m => Object.keys(m).reduce((best, p) => (best === null || m[p] < m[best] ? p : best), null);

  /* Summary: what the reader takes away first. */
  (function summary() {
    let cases = 0, wins = 0, best = 0;
    scenarios.forEach(s => s.rows.forEach(r => {
      const m = medians(r);
      if (Object.keys(m).length < 2) return;
      cases++;
      if (fastest(m) === "saetta") wins++;
      if (m.explorer && m.saetta) best = Math.max(best, m.explorer / m.saetta);
    }));
    const tiles = [[fmt(cases, 0), t("bm.sumCases")], [fmt(wins, 0), fill(t("bm.sumWins"), { n: fmt(cases, 0) })]];
    if (best > 1) tiles.push([fmt(best, 1) + "×", t("bm.sumBest")]);
    document.getElementById("bm-summary").innerHTML = tiles.map(([b, s]) => '<div class="glass bm-stat"><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join("");
  })();

  const legend = document.getElementById("bm-legend");
  const rowsBox = document.getElementById("bm-rows");
  const tabs = document.getElementById("bm-tabs");
  const scenarioText = document.getElementById("bm-scenario");
  const tableBox = document.getElementById("bm-table");
  const toggle = document.getElementById("bm-table-toggle");
  const tip = document.createElement("div");
  tip.className = "bm-tip"; tip.hidden = true; tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);

  function render(id) {
    const s = scenarios.find(x => x.id === id) || scenarios[0];
    [...tabs.children].forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === s.id)));
    [...tabs.children].forEach(b => (b.tabIndex = b.dataset.id === s.id ? 0 : -1));
    scenarioText.textContent = t("bm.sc." + s.id + ".text");
    const shown = PROGRAMS.filter(p => s.rows.some(r => r.runs[p] && r.runs[p].length));
    legend.innerHTML = shown.map(p => '<span><i class="' + p + '"></i>' + esc(NAME(p)) + '</span>').join("");
    rowsBox.innerHTML = s.rows.map((r, i) => {
      const m = medians(r), win = fastest(m), top = Math.max(...Object.values(m));
      let gain = "";
      if (m.saetta && m.explorer) {
        const x = m.explorer / m.saetta;
        gain = x >= 1.05 ? fill(t("bm.faster"), { x: fmt(x, 1) }) : x <= 0.95 ? fill(t("bm.slower"), { x: fmt(1 / x, 1) }) : esc(t("bm.even"));
      }
      const bars = shown.map(p => {
        if (!(p in m)) return '<div class="bm-bar missing ' + p + '"><span class="who">' + esc(NAME(p)) + '</span><div class="track"></div><span class="t">' + esc(t("bm.notMeasured")) + '</span></div>';
        const width = Math.max(0.6, m[p] / top * 100);
        const runs = r.runs[p].map(v => clock(v)).join(" · ");
        return '<div class="bm-bar ' + p + (p === win ? " win" : "") + '" tabindex="0" data-tip="' + esc(NAME(p) + "|" + fill(t("bm.tip"), { m: clock(m[p]), runs: runs })) + '"' +
          ' aria-label="' + esc(NAME(p) + ": " + clock(m[p])) + '">' +
          '<span class="who">' + esc(NAME(p)) + '</span>' +
          '<div class="track"><i class="fill" style="width:' + width.toFixed(2) + '%"></i></div>' +
          '<span class="t">' + esc(clock(m[p])) + (p === win ? '<small>' + esc(t("bm.fastest")) + '</small>' : "") + '</span></div>';
      }).join("");
      return '<article class="glass bm-row"><header><h3>' + esc(label(r)) + '<small>' + esc(sub(r)) + '</small></h3>' +
        (gain ? '<span class="bm-gain">' + gain + '</span>' : "") + '</header><div class="bm-bars">' + bars + '</div></article>';
    }).join("");
    tableBox.innerHTML = '<table><thead><tr><th>' + esc(t("bm.kind")) + '</th>' + shown.map(p => '<th>' + esc(NAME(p)) + '</th>').join("") + '</tr></thead><tbody>' +
      s.rows.map(r => {
        const m = medians(r), win = fastest(m);
        return '<tr><td>' + esc(label(r)) + '</td>' + shown.map(p => '<td' + (p === win ? ' class="win"' : "") + '>' + (p in m ? esc(clock(m[p])) : "—") + '</td>').join("") + '</tr>';
      }).join("") + '</tbody></table>';
    try { history.replaceState(null, "", "#" + s.id); } catch (e) {}
  }

  tabs.innerHTML = scenarios.map(s => '<button type="button" role="tab" data-id="' + esc(s.id) + '">' + esc(t("bm.sc." + s.id)) + '</button>').join("");
  tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) render(b.dataset.id); });
  tabs.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const all = [...tabs.children], at = all.findIndex(b => b.getAttribute("aria-selected") === "true");
    const next = all[(at + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
    render(next.dataset.id); next.focus();
  });

  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    const open = tableBox.hidden;
    tableBox.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = t(open ? "bm.hideTable" : "bm.showTable");
  });

  /* The three runs behind each bar, on hover or keyboard focus. */
  function showTip(bar, x, y) {
    const [who, text] = bar.dataset.tip.split("|");
    tip.innerHTML = "<b>" + esc(who) + "</b><span>" + esc(text) + "</span>";
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, x + 14)) + "px";
    tip.style.top = Math.min(innerHeight - h - 8, Math.max(8, y - h - 10)) + "px";
  }
  rowsBox.addEventListener("pointermove", e => { const bar = e.target.closest(".bm-bar[data-tip]"); if (bar) showTip(bar, e.clientX, e.clientY); else tip.hidden = true; });
  rowsBox.addEventListener("pointerleave", () => { tip.hidden = true; });
  rowsBox.addEventListener("focusin", e => { const bar = e.target.closest(".bm-bar[data-tip]"); if (bar) { const r = bar.getBoundingClientRect(); showTip(bar, r.left + r.width / 2, r.top); } });
  rowsBox.addEventListener("focusout", () => { tip.hidden = true; });

  if (data.meta) {
    const m = data.meta, v = m.versions || {};
    document.getElementById("bm-versions").textContent = fill(t("bm.versions"),
      { date: m.date || "", pc: m.pc || "", saetta: v.saetta || "", os: v.os || "" });
  }
  render((location.hash || "").slice(1));
})();
