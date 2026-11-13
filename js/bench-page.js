/* The full benchmarks page: the results from js/bench-full.js (window.SAETTA_BENCH_FULL,
   written by tools/bench-site-data.py from the measuring scripts' results). Until that file
   holds results, the page says they are coming. The header (language, theme, the phone menu)
   and the Store link are js/site.js's, as on every page; the language picker keeps the hash,
   so the other language opens on the same comparison and scenario.
   Saetta is compared with one program at a time, picked at the top: File Explorer, TeraCopy,
   FastCopy or robocopy, each scenario from the most recent battery that measured that program
   beside Saetta there (the versions line names each battery's date and versions).
   The texts drawn here are Italian below; the other languages' come from their dictionaries
   (bm.* keys in js/i18n-<lang>.js). */
(function () {
  const lang = document.documentElement.dataset.lang || "it";
  const LOCALES = { it: "it-IT", en: "en-US", de: "de-DE", es: "es-ES", zh: "zh-CN" };

  const IT = {
    "bm.title": "Saetta contro Esplora file", "bm.titleVs": "Saetta contro {name}",
    "bm.explorer": "Esplora file",
    "bm.sc.ssd": "SSD → SSD", "bm.sc.ssd.text": "Copia da un SSD allo stesso SSD.",
    "bm.sc.ce": "SSD → disco rigido", "bm.sc.ce.text": "Copia dall'SSD a un disco rigido esterno USB.",
    "bm.sc.ec": "Disco rigido → SSD", "bm.sc.ec.text": "Copia da un disco rigido esterno USB all'SSD.",
    "bm.sc.ee": "Stesso disco rigido", "bm.sc.ee.text": "Copia da una cartella a un'altra dello stesso disco rigido esterno: lettura e scrittura sullo stesso disco.",
    "bm.sc.de": "Tra due dischi rigidi", "bm.sc.de.text": "Copia da un disco rigido esterno USB a un altro.",
    "bm.sc.stick": "Chiavetta USB", "bm.sc.stick.text": "Copia dall'SSD a una chiavetta USB formattata FAT32, come escono dalla fabbrica quelle fino a 32 GB.",
    "bm.sc.stick-exfat.text": "Copia dall'SSD a una chiavetta USB formattata exFAT, collegata a velocità USB 2.0.",
    "bm.sc.sd": "Scheda SD", "bm.sc.sd.text": "Copia dall'SSD a una scheda SD formattata exFAT, nel lettore del portatile.",
    "bm.sc.del-ssd": "Eliminazione su SSD", "bm.sc.del-ssd.text": "Eliminazione definitiva, senza Cestino, su un SSD.",
    "bm.sc.del-hdd": "Eliminazione su disco rigido", "bm.sc.del-hdd.text": "Eliminazione definitiva, senza Cestino, su un disco rigido esterno USB.",
    "bm.setFiles": "{n} file da {size}",
    "bm.setMix": "Cartella mista: documenti, foto e video",
    "bm.setTree": "Albero di cartelle con file piccoli",
    "bm.setSys": "Programmi di Windows (.exe e .dll)",
    "bm.setSub": "{files} file · {total}",
    "bm.setSubFolders": "{files} file in {folders} cartelle · {total}",
    "bm.faster": "<b>{x}×</b> più veloce di Esplora file", "bm.fasterVs": "<b>{x}×</b> più veloce di {name}",
    "bm.slower": "Esplora file <b>{x}×</b> più veloce", "bm.slowerVs": "{name} <b>{x}×</b> più veloce",
    "bm.even": "Alla pari con Esplora file", "bm.evenVs": "Alla pari con {name}",
    "bm.fastest": "più veloce",
    "bm.notMeasured": "non misurato",
    "bm.tip": "Mediana {m} · prove: {runs}",
    "bm.kind": "Tipo di file",
    "bm.showTable": "Mostra come tabella", "bm.hideTable": "Nascondi la tabella",
    "bm.sumCases": "confronti misurati",
    "bm.sumWins": "volte Saetta è la più veloce, su {n}",
    "bm.sumBest": "più veloce di Esplora file, al massimo", "bm.sumBestVs": "più veloce di {name}, al massimo",
    "bm.versions": "Misurato il {date}. PC: {pc}. Versioni: {versions}.",
    "bm.versionsAlso": "{scenarios}: misure del {date}, versioni: {versions}.",
  };
  const dict = window["SAETTA_" + lang.toUpperCase()] || {};
  const t = key => (lang !== "it" && dict[key]) || IT[key] || key;
  const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => (k in values ? values[k] : "{" + k + "}"));
  const fmt = (n, digits) => n.toLocaleString(LOCALES[lang] || "en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /* ---------- the results ---------- */
  const data = window.SAETTA_BENCH_FULL;
  /* One or more batteries, each measured on its own days: a comparison always comes from the one
     where Saetta and that program ran side by side (an older data file is a single battery). */
  const batteries = (data ? data.batteries || [{ date: data.meta && data.meta.date, versions: data.meta && data.meta.versions, scenarios: data.scenarios }] : [])
    .map(b => Object.assign({}, b, { scenarios: (b.scenarios || []).filter(s => s.rows && s.rows.length) }))
    .filter(b => b.scenarios.length);
  if (!batteries.length) return;   /* the "coming soon" note stays */
  document.getElementById("bm-empty").hidden = true;

  const RIVALS = ["explorer", "teracopy", "fastcopy", "robocopy"];
  const NAMES = { saetta: "Saetta", teracopy: "TeraCopy", fastcopy: "FastCopy", robocopy: "robocopy" };
  const NAME = p => NAMES[p] || t("bm.explorer");
  const has = (row, p) => !!(row.runs[p] && row.runs[p].length);
  /* In a battery, the scenarios, and in each the rows, where Saetta and that program both ran;
     a scenario may describe its medium with its own text. */
  const pairs = (b, p) => b.scenarios.map(s => ({ id: s.id, text: s.text || s.id, battery: b, rows: s.rows.filter(r => has(r, "saetta") && has(r, p)) })).filter(s => s.rows.length);
  /* Each scenario from the most recent battery that measured that program in it, in the order
     the scenarios first appear in the data. */
  const ORDER = [...new Set(batteries.flatMap(b => b.scenarios.map(s => s.id)))];
  const against = p => {
    const found = {};
    batteries.slice().reverse().forEach(b => pairs(b, p).forEach(s => { if (!found[s.id]) found[s.id] = s; }));
    return ORDER.filter(id => found[id]).map(id => found[id]);
  };
  const rivals = RIVALS.filter(p => against(p).length);
  let rival = rivals[0], view = against(rival), current = null;
  /* File Explorer's own texts (some languages give it an article); the others take the name. */
  const tv = (key, values) => fill(t(rival === "explorer" ? key : key + "Vs"), Object.assign({ name: NAME(rival) }, values));
  const SIZES = { "4K": "4\u00a0KB", "64K": "64\u00a0KB", "1M": "1\u00a0MB", "16M": "16\u00a0MB", "256M": "256\u00a0MB", "4G": "4\u00a0GB" };
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
  const medians = row => Object.fromEntries(["saetta", rival].filter(p => has(row, p)).map(p => [p, median(row.runs[p])]));
  const fastest = m => Object.keys(m).reduce((best, p) => (best === null || m[p] < m[best] ? p : best), null);

  /* Summary: what the reader takes away first, against the program picked. */
  function summary() {
    let cases = 0, wins = 0, best = 0;
    view.forEach(s => s.rows.forEach(r => {
      const m = medians(r);
      cases++;
      if (fastest(m) === "saetta") wins++;
      best = Math.max(best, m[rival] / m.saetta);
    }));
    const tiles = [[fmt(cases, 0), t("bm.sumCases")], [fmt(wins, 0), fill(t("bm.sumWins"), { n: fmt(cases, 0) })]];
    if (best > 1) tiles.push([fmt(best, 1) + "×", tv("bm.sumBest")]);
    document.getElementById("bm-summary").innerHTML = tiles.map(([b, s]) => '<div class="bm-stat"><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join("");
  }

  const heading = document.querySelector(".bm-hero h1");
  const vsBox = document.getElementById("bm-vs");
  const vs = document.getElementById("bm-vs-options");
  const legend = document.getElementById("bm-legend");
  const rowsBox = document.getElementById("bm-rows");
  const tabs = document.getElementById("bm-tabs");
  const scenarioText = document.getElementById("bm-scenario");
  const tableBox = document.getElementById("bm-table");
  const toggle = document.getElementById("bm-table-toggle");
  const tip = document.createElement("div");
  tip.className = "bm-tip"; tip.hidden = true; tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);

  let keepHash = false;
  function render(id) {
    const s = view.find(x => x.id === id) || view.find(x => x.id === current) || view[0];
    current = s.id;
    [...tabs.children].forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === s.id)));
    [...tabs.children].forEach(b => (b.tabIndex = b.dataset.id === s.id ? 0 : -1));
    scenarioText.textContent = t("bm.sc." + s.text + ".text");
    const shown = ["saetta", rival];
    legend.innerHTML = shown.map(p => '<span><i class="' + p + '"></i>' + esc(NAME(p)) + '</span>').join("");
    rowsBox.innerHTML = s.rows.map((r, i) => {
      const m = medians(r), win = fastest(m), top = Math.max(...Object.values(m));
      const x = m[rival] / m.saetta;
      const gain = x >= 1.05 ? tv("bm.faster", { x: fmt(x, 1) }) : x <= 0.95 ? tv("bm.slower", { x: fmt(1 / x, 1) }) : esc(tv("bm.even"));
      const gainClass = x >= 1.05 ? "" : x <= 0.95 ? " is-slower" : " is-even";
      const bars = shown.map(p => {
        if (!(p in m)) return '<div class="bm-bar missing ' + p + '"><span class="who">' + esc(NAME(p)) + '</span><div class="track"></div><span class="t">' + esc(t("bm.notMeasured")) + '</span></div>';
        const width = Math.max(0.6, m[p] / top * 100);
        const runs = r.runs[p].map(v => clock(v)).join(" · ");
        const tipText = fill(t("bm.tip"), { m: clock(m[p]), runs: runs });
        return '<div class="bm-bar ' + p + (p === win ? " win" : "") + '" role="img" data-tip="' + esc(NAME(p) + "|" + tipText) + '"' +
          ' aria-label="' + esc(NAME(p) + ": " + tipText) + '">' +
          '<span class="who">' + esc(NAME(p)) + '</span>' +
          '<div class="track"><i class="fill" style="width:' + width.toFixed(2) + '%"></i></div>' +
          '<span class="t">' + esc(clock(m[p])) + (p === win ? '<small>' + esc(t("bm.fastest")) + '</small>' : "") + '</span></div>';
      }).join("");
      return '<article class="card bm-row"><header><h3>' + esc(label(r)) + '<small>' + esc(sub(r)) + '</small></h3>' +
        '<span class="bm-gain' + gainClass + '">' + gain + '</span></header><div class="bm-bars">' + bars + '</div></article>';
    }).join("");
    tableBox.innerHTML = '<table><thead><tr><th>' + esc(t("bm.kind")) + '</th>' + shown.map(p => '<th>' + esc(NAME(p)) + '</th>').join("") + '</tr></thead><tbody>' +
      s.rows.map(r => {
        const m = medians(r), win = fastest(m);
        return '<tr><td>' + esc(label(r)) + '</td>' + shown.map(p => '<td' + (p === win ? ' class="win"' : "") + '>' + (p in m ? esc(clock(m[p])) : "—") + '</td>').join("") + '</tr>';
      }).join("") + '</tbody></table>';
    if (!keepHash) try { history.replaceState(null, "", "#" + (rival === "explorer" ? "" : rival + "-") + s.id); } catch (e) {}
    keepHash = false;
  }

  /* The program Saetta is compared with: the title, the summary, the scenarios it ran in. */
  function choose(p, scenario) {
    rival = rivals.includes(p) ? p : rivals[0];
    view = against(rival);
    [...vs.children].forEach(b => { const on = b.dataset.id === rival; b.setAttribute("aria-checked", String(on)); b.tabIndex = on ? 0 : -1; });
    heading.textContent = tv("bm.title");
    tabs.innerHTML = view.map(s => '<button type="button" role="tab" data-id="' + esc(s.id) + '">' + esc(t("bm.sc." + s.id)) + '</button>').join("");
    summary();
    versions();
    render(scenario);
  }

  vs.innerHTML = rivals.map(p => '<button type="button" role="radio" data-id="' + p + '">' + esc(NAME(p)) + '</button>').join("");
  vsBox.hidden = rivals.length < 2;
  vs.addEventListener("click", e => { const b = e.target.closest("button"); if (b && b.dataset.id !== rival) choose(b.dataset.id); });
  vs.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const all = [...vs.children], at = all.findIndex(b => b.dataset.id === rival);
    const next = all[(at + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
    choose(next.dataset.id); next.focus();
  });

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

  /* The three runs behind each bar, on hover (screen readers have them in the bar's name). */
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

  /* When, on what and with which versions the comparison on screen was measured: the battery
     behind most of its scenarios first, then the scenarios that come from another one. */
  function versions() {
    const groups = [];
    view.forEach(s => {
      let g = groups.find(x => x.battery === s.battery);
      if (!g) groups.push(g = { battery: s.battery, names: [] });
      g.names.push(t("bm.sc." + s.id));
    });
    if (!groups.length) return;
    groups.sort((a, b) => b.names.length - a.names.length);
    const list = b => {
      const v = b.versions || {}, out = ["Saetta " + (v.saetta || "")];
      if (v[rival]) out.push(NAME(rival) + " " + v[rival]);
      if (v.os) out.push(v.os);
      return out.join(lang === "zh" ? "、" : ", ");
    };
    const day = b => /^\d{4}-\d{2}-\d{2}$/.test(b.date || "")
      ? new Date(b.date + "T12:00:00").toLocaleDateString(LOCALES[lang] || "en-US", { day: "numeric", month: "long", year: "numeric" })
      : b.date || "";
    const and = names => { try { return new Intl.ListFormat(LOCALES[lang] || "en-US", { type: "conjunction" }).format(names); } catch (e) { return names.join(", "); } };
    const main = groups[0].battery;
    const parts = [fill(t("bm.versions"), { date: day(main), pc: data.pc || (data.meta && data.meta.pc) || "", versions: list(main) })]
      .concat(groups.slice(1).map(g => fill(t("bm.versionsAlso"), { scenarios: and(g.names), date: day(g.battery), versions: list(g.battery) })));
    document.getElementById("bm-versions").textContent = parts.join(lang === "zh" ? "" : " ");
  }

  /* #ssd is File Explorer's SSD → SSD, #teracopy-ssd TeraCopy's, #robocopy-ssd robocopy's. */
  const hash = (location.hash || "").slice(1), picked = /^(teracopy|fastcopy|robocopy)(?:-(.+))?$/.exec(hash);
  keepHash = !picked && !!hash && !!document.getElementById(hash);
  choose(picked ? picked[1] : "explorer", picked ? picked[2] : hash);
})();
