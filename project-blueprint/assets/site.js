/* Shared chrome, search, figures, illustrations, and the Ask agent. Classic script — reference BLUEPRINT directly. */
const Site = (function () {

  /* ---------------- small utils ---------------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  const KIND_COLOR = { frontend: "info", backend: "neutral", database: "neutral", ai: "accent", external: "warning" };
  const KIND_SHAPE = { frontend: "rect", backend: "rect", database: "cylinder", ai: "rect", external: "hexagon" };

  /* ================= THEME ================= */
  function initTheme() {
    const saved = localStorage.getItem("clienteling_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    const btn = qs("#theme-toggle");
    if (btn) btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      const next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("clienteling_theme", next);
      themeListeners.forEach(fn => fn());
    });
  }
  const themeListeners = [];

  /* ================= SCROLL PROGRESS + BACK TO TOP ================= */
  function initScrollProgress() {
    const bar = qs("#scroll-progress");
    const backTop = qs("#back-to-top");
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100;
      if (bar) bar.style.width = pct + "%";
      if (backTop) backTop.classList.toggle("show", h.scrollTop > 500);
    }, { passive: true });
    if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ================= NAV / BREADCRUMBS / FOOTER ================= */
  function renderChrome(activeId) {
    const sections = BLUEPRINT.sections;
    const idx = sections.findIndex(s => s.id === activeId);

    const navHost = qs("#top-nav");
    if (navHost) {
      navHost.innerHTML = `
        <div class="nav-row">
          <a class="brand" href="index.html">${esc(BLUEPRINT.meta.title.split(" ")[0])} <span>Blueprint</span></a>
          <a class="home-link" href="index.html">&#8962; Command Center</a>
          <div class="section-links">
            ${sections.map(s => `<a href="${s.file}" class="${s.id === activeId ? "current" : ""}">${esc(s.nav)}</a>`).join("")}
          </div>
          <div class="nav-actions">
            <div class="search-wrap">
              <input id="nav-search" type="search" placeholder="Search blueprint..." aria-label="Search the blueprint" autocomplete="off">
              <div class="search-results" id="search-results" role="listbox"></div>
            </div>
            <button class="icon-btn" id="theme-toggle" title="Toggle theme" aria-label="Toggle light or dark theme">&#9788;</button>
            <button class="icon-btn" id="print-btn" title="Print" aria-label="Print this page">&#128424;</button>
          </div>
        </div>`;
      qs("#print-btn").addEventListener("click", () => window.print());
    }

    if (activeId) {
      const bc = qs("#breadcrumbs");
      if (bc) bc.innerHTML = `<a href="index.html">Command Center</a> &rsaquo; ${esc(sections[idx].title)}`;

      const footer = qs("#footer-nav");
      if (footer) {
        const prev = sections[idx - 1];
        const next = sections[idx + 1];
        footer.innerHTML = `<div class="footer-nav-row">
          ${prev ? `<a href="${prev.file}"><span class="fn-dir">&larr; Previous</span>${esc(prev.title)}</a>` : `<a href="index.html"><span class="fn-dir">&larr; Back</span>Command Center</a>`}
          ${next ? `<a href="${next.file}" class="fn-next"><span class="fn-dir">Next &rarr;</span>${esc(next.title)}</a>` : `<a href="index.html" class="fn-next"><span class="fn-dir">Done &rarr;</span>Command Center</a>`}
        </div>`;
      }
    }
  }

  /* ================= SEARCH INDEX ================= */
  const STOPWORDS = new Set(("a an and the of to in on for with is are this that it be as by or at from into its was were will would can could not " +
    "does do did has have had if than then so about over under out up down what which who how each every we you they he she").split(" "));

  function stem(w) {
    if (w.length > 4 && w.endsWith("ing")) return w.slice(0, -3);
    if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("es")) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
    return w;
  }
  function tokenize(text) {
    return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter(w => !STOPWORDS.has(w) && w.length > 1);
  }

  let searchDocs = null;
  function buildSearchDocs() {
    if (searchDocs) return searchDocs;
    const docs = [];
    const sec = id => BLUEPRINT.sections.find(s => s.id === id);
    function add(sectionId, title, text) {
      docs.push({ section: sec(sectionId), title, text, tokens: tokenize(title + " " + text), titleTokens: tokenize(title) });
    }
    add("summary", "The Idea", BLUEPRINT.idea);
    add("summary", "Day One Promise", BLUEPRINT.dayOne);
    BLUEPRINT.components.forEach(c => add("components", c.name, `${c.sentence} ${c.why}`));
    BLUEPRINT.dataFlow.forEach(s => add("data-flow", `Step ${s.step}`, s.text));
    BLUEPRINT.buildPhases.forEach(p => add("build-order", p.name, `${p.builds} ${p.proves}`));
    BLUEPRINT.coverage.forEach(c => add("coverage", c.capability, `${c.status} ${c.phase}`));
    BLUEPRINT.assumptions.forEach(a => add("assumptions", "Assumption", `${a.text} ${a.impact}`));
    add("assumptions", "Open Question", `${BLUEPRINT.openQuestion.question} ${BLUEPRINT.openQuestion.branchA.detail} ${BLUEPRINT.openQuestion.branchB.detail}`);
    BLUEPRINT.notCovered.forEach(t => add("not-covered", "Not covered", t));
    searchDocs = docs;
    return docs;
  }

  function search(query, opts) {
    opts = opts || {};
    const docs = buildSearchDocs();
    const qTokensRaw = tokenize(query);
    const qTokens = qTokensRaw.map(stem);
    if (!qTokens.length) return [];
    const qLower = query.toLowerCase().trim();
    const scored = docs.map(doc => {
      let score = 0;
      const stemmedDoc = doc.tokens.map(stem);
      const stemmedTitle = doc.titleTokens.map(stem);
      qTokens.forEach(qt => {
        const tf = stemmedDoc.filter(t => t === qt).length;
        score += tf;
        if (stemmedTitle.includes(qt)) score += 3;
      });
      if (qLower.length > 2 && (doc.title + " " + doc.text).toLowerCase().includes(qLower)) score += 5;
      return { doc, score };
    }).filter(r => r.score > 0 && (!opts.excludeSection || r.doc.section.id !== opts.excludeSection));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, opts.limit || 8);
  }

  function highlight(text, query) {
    const terms = tokenize(query).map(stem).filter(Boolean);
    if (!terms.length) return esc(text);
    let out = esc(text);
    terms.sort((a, b) => b.length - a.length).forEach(t => {
      const re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\w*)", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }
  function snippet(text, query, len) {
    len = len || 110;
    const idx = text.toLowerCase().indexOf(tokenize(query)[0] || "");
    let start = Math.max(0, (idx > 20 ? idx - 20 : 0));
    let s = text.slice(start, start + len);
    if (start > 0) s = "..." + s;
    if (start + len < text.length) s = s + "...";
    return highlight(s, query);
  }

  function initSearch(activeId) {
    const input = qs("#nav-search");
    const results = qs("#search-results");
    if (!input || !results) return;

    input.addEventListener("input", () => {
      const q = input.value.trim();

      // (a) narrow current page content
      qsa("[data-searchable]").forEach(node => {
        if (!q) { node.removeAttribute("data-hit"); return; }
        const hay = (node.getAttribute("data-searchable") || node.textContent).toLowerCase();
        const terms = tokenize(q);
        const hit = terms.every(t => hay.includes(t)) || hay.includes(q.toLowerCase());
        node.setAttribute("data-hit", hit ? "true" : "false");
      });

      // (b) cross-section ranked dropdown
      if (!q) { results.classList.remove("open"); results.innerHTML = ""; return; }
      const hits = search(q, { excludeSection: activeId, limit: 8 });
      if (!hits.length) {
        results.innerHTML = `<div class="sr-empty">No matches in other sections.</div>`;
      } else {
        results.innerHTML = hits.map(h => `
          <a class="sr-item" href="${h.doc.section.file}">
            <div class="sr-section">${esc(h.doc.section.nav)} &middot; ${esc(h.doc.title)}</div>
            <div class="sr-snippet">${snippet(h.doc.text, q)}</div>
          </a>`).join("");
      }
      results.classList.add("open");
    });

    document.addEventListener("click", (e) => {
      if (!results.contains(e.target) && e.target !== input) results.classList.remove("open");
    });
    input.addEventListener("keydown", (e) => { if (e.key === "Escape") { results.classList.remove("open"); input.blur(); } });
  }

  /* ================= FIGURE SYSTEM (mermaid / svg / chart, with fullscreen zoom) ================= */
  let modalScale = 1;
  function ensureModal() {
    if (qs("#figure-modal")) return;
    const modal = el("div", { id: "figure-modal" }, `
      <div class="modal-toolbar">
        <button class="icon-btn" id="modal-zoom-out" aria-label="Zoom out">&minus;</button>
        <button class="icon-btn" id="modal-zoom-reset" aria-label="Reset zoom">&#8635;</button>
        <button class="icon-btn" id="modal-zoom-in" aria-label="Zoom in">&#43;</button>
        <button class="icon-btn" id="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-stage"><div class="modal-stage-inner" id="modal-stage-inner"></div></div>
      <div class="modal-caption" id="modal-caption"></div>
    `);
    document.body.appendChild(modal);
    const applyScale = () => qs("#modal-stage-inner").style.transform = `scale(${modalScale})`;
    qs("#modal-zoom-in").addEventListener("click", () => { modalScale = Math.min(3, modalScale + 0.2); applyScale(); });
    qs("#modal-zoom-out").addEventListener("click", () => { modalScale = Math.max(0.4, modalScale - 0.2); applyScale(); });
    qs("#modal-zoom-reset").addEventListener("click", () => { modalScale = 1; applyScale(); });
    qs("#modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target.id === "figure-modal") closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });
  }
  function closeModal() { qs("#figure-modal").classList.remove("open"); }
  function openModal(title, interpretation, draw) {
    ensureModal();
    modalScale = 1;
    const stage = qs("#modal-stage-inner");
    stage.style.transform = "scale(1)";
    stage.innerHTML = "";
    qs("#modal-caption").innerHTML = `<strong>${esc(title)}</strong><br>${esc(interpretation)}`;
    qs("#figure-modal").classList.add("open");
    draw(stage, true);
  }

  let mermaidReady = null;
  function initMermaid() {
    if (mermaidReady) return mermaidReady;
    mermaidReady = new Promise((resolve) => {
      const tryInit = () => {
        if (!window.mermaid) { setTimeout(tryInit, 100); return; }
        const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
          (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
        window.mermaid.initialize({ startOnLoad: false, theme: isDark ? "dark" : "default", securityLevel: "loose", fontFamily: "Segoe UI, system-ui, sans-serif" });
        resolve(window.mermaid);
      };
      tryInit();
    });
    return mermaidReady;
  }

  function mermaidDraw(source) {
    const fn = (target) => {
      initMermaid().then(mermaid => {
        const id = "mmd-" + Math.random().toString(36).slice(2);
        mermaid.render(id, source).then(({ svg }) => { target.innerHTML = svg; }).catch(err => {
          target.innerHTML = `<p class="muted">Diagram failed to render: ${esc(err.message || String(err))}</p>`;
        });
      });
    };
    return fn;
  }
  function svgDraw(svgString) { return (target) => { target.innerHTML = svgString; }; }
  function chartDraw(configFactory) {
    return (target, isModal) => {
      target.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.width = isModal ? 620 : 320;
      canvas.height = isModal ? 420 : 220;
      canvas.style.maxWidth = "100%";
      target.appendChild(canvas);
      if (window.Chart) new window.Chart(canvas.getContext("2d"), configFactory());
    };
  }

  const figureRegistry = [];
  function mountFigure(hostId, opts) {
    const host = qs("#" + hostId);
    if (!host) return;
    const bodyId = hostId + "-body";
    host.classList.add("figure");
    host.innerHTML = `
      <div class="figure-head">
        <h3>${esc(opts.title)}</h3>
        <button class="expand-btn" aria-label="Expand ${esc(opts.title)} full screen">&#x26F6; Expand</button>
      </div>
      <div class="figure-body" id="${bodyId}"></div>
      ${opts.interpretation ? `<div class="figure-interpretation"><strong>What this means:</strong> ${esc(opts.interpretation)}</div>` : ""}
    `;
    const bodyEl = qs("#" + bodyId);
    opts.draw(bodyEl, false);
    qs(".expand-btn", host).addEventListener("click", () => openModal(opts.title, opts.interpretation || "", opts.draw));
    if (opts.type === "mermaid" || opts.type === "chart") {
      figureRegistry.push({ bodyEl, draw: opts.draw });
    }
  }
  themeListeners.push(() => {
    setTimeout(() => {
      mermaidReady = null; // force re-init with new theme
      figureRegistry.forEach(f => f.draw(f.bodyEl, false));
    }, 30);
  });

  /* ================= SVG ILLUSTRATIONS (generated from BLUEPRINT) ================= */
  function estWidth(text, fontSize) { return Math.max(70, text.length * fontSize * 0.58 + 26); }

  function shapeMarkup(kind, x, y, w, h) {
    const color = `var(--${KIND_COLOR[kind]})`;
    const soft = `var(--${KIND_COLOR[kind]}-soft)`;
    const shape = KIND_SHAPE[kind];
    if (shape === "cylinder") {
      const eh = Math.min(12, h * 0.28);
      return `<path d="M${x},${y + eh} a${w / 2},${eh} 0 0 1 ${w},0 v${h - 2 * eh} a${w / 2},${eh} 0 0 1 -${w},0 z" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
    }
    if (shape === "hexagon") {
      const cut = Math.min(14, w * 0.16);
      const pts = `${x + cut},${y} ${x + w - cut},${y} ${x + w},${y + h / 2} ${x + w - cut},${y + h} ${x + cut},${y + h} ${x},${y + h / 2}`;
      return `<polygon points="${pts}" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
    }
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
  }
  function labelMarkup(x, y, w, h, text, fontSize) {
    return `<text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="700" fill="var(--text)">${esc(text)}</text>`;
  }
  function arrowDefs() {
    return `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker></defs>`;
  }

  const Illustrations = {
    pipeline(mini) {
      const w = mini ? 300 : 860, h = mini ? 92 : 190;
      const fs = mini ? 9 : 13;
      const engine = BLUEPRINT.components.find(c => c.dayOneOwner);
      const boxes = [
        { label: mini ? "Client history" : "Client history + preferences", kind: "database" },
        { label: mini ? "Engine" : engine.name, kind: "ai" },
        { label: mini ? "Draft output" : "Recommendations + message draft", kind: "frontend" }
      ];
      const gap = mini ? 14 : 40;
      const widths = boxes.map(b => estWidth(b.label, fs));
      const totalW = widths.reduce((a, b) => a + b, 0) + gap * (boxes.length - 1);
      let x = (w - totalW) / 2;
      const y = h / 2 - (mini ? 16 : 26);
      const bh = mini ? 32 : 52;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Inputs to pipeline to output">${arrowDefs()}`;
      boxes.forEach((b, i) => {
        const bw = widths[i];
        s += shapeMarkup(b.kind, x, y, bw, bh) + labelMarkup(x, y, bw, bh, b.label, fs);
        if (i < boxes.length - 1) {
          s += `<line x1="${x + bw}" y1="${y + bh / 2}" x2="${x + bw + gap}" y2="${y + bh / 2}" stroke="var(--muted)" stroke-width="1.5" marker-end="url(#arrow)"/>`;
        }
        x += bw + gap;
      });
      s += `</svg>`;
      return s;
    },

    layers(mini) {
      const w = mini ? 300 : 900;
      const rowH = mini ? 30 : 62;
      const gap = mini ? 6 : 16;
      const groups = [
        { title: "Interface", items: BLUEPRINT.components.filter(c => c.kind === "frontend") },
        { title: "Coordination", items: BLUEPRINT.components.filter(c => c.kind === "backend") },
        { title: "Data", items: BLUEPRINT.components.filter(c => c.kind === "database") },
        { title: "Intelligence", items: BLUEPRINT.components.filter(c => c.kind === "ai") },
        { title: "External", items: BLUEPRINT.components.filter(c => c.kind === "external") }
      ];
      const h = groups.length * (rowH + gap) + gap;
      const fs = mini ? 8 : 13;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Components grouped by layer">`;
      groups.forEach((g, gi) => {
        const y = gap + gi * (rowH + gap);
        if (!mini) s += `<text x="14" y="${y - 6}" font-size="10" fill="var(--muted)" letter-spacing="1">${esc(g.title.toUpperCase())}</text>`;
        let x = mini ? 8 : 16;
        g.items.forEach(comp => {
          const label = mini ? comp.name.split(" ")[0] : comp.name;
          const bw = estWidth(label, fs);
          s += shapeMarkup(comp.kind, x, y, bw, rowH) + labelMarkup(x, y, bw, rowH, label, fs);
          x += bw + (mini ? 6 : 14);
        });
      });
      s += `</svg>`;
      return s;
    },

    stepsRibbon(mini) {
      const steps = BLUEPRINT.dataFlow;
      const perRow = mini ? steps.length : 5;
      const size = mini ? 16 : 44;
      const gap = mini ? 6 : 18;
      const rows = Math.ceil(steps.length / perRow);
      const w = mini ? 300 : perRow * (size + gap);
      const h = rows * (size + gap) + (mini ? 0 : 20);
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Data flow steps, highlighting which touch the model">`;
      steps.forEach((step, i) => {
        const row = Math.floor(i / perRow), col = i % perRow;
        const cx = col * (size + gap) + size / 2 + (mini ? 4 : 0);
        const cy = row * (size + gap) + size / 2 + (mini ? 0 : 10);
        const color = step.touchesModel ? "var(--accent)" : "var(--neutral)";
        const soft = step.touchesModel ? "var(--accent-soft)" : "var(--neutral-soft)";
        s += `<circle cx="${cx}" cy="${cy}" r="${size / 2}" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
        if (!mini) s += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="700" fill="${color}">${step.step}</text>`;
        if (i < steps.length - 1 && col < perRow - 1) {
          s += `<line x1="${cx + size / 2}" y1="${cy}" x2="${cx + size / 2 + gap}" y2="${cy}" stroke="var(--border)" stroke-width="2"/>`;
        }
      });
      if (!mini) s += `<text x="0" y="${h - 2}" font-size="11" fill="var(--muted)">&#9679; teal = calls the LLM Provider &nbsp;&nbsp; &#9679; grey = local to the app</text>`;
      s += `</svg>`;
      return s;
    },

    phaseTimeline(mini) {
      const phases = BLUEPRINT.buildPhases;
      const total = phases[phases.length - 1].start + phases[phases.length - 1].duration;
      const w = mini ? 300 : 860;
      const barH = mini ? 14 : 34;
      const gap = mini ? 3 : 8;
      const h = phases.length * (barH + gap) + (mini ? 0 : 10);
      const fs = mini ? 0 : 12;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Build phases as a proportional timeline">`;
      phases.forEach((p, i) => {
        const y = i * (barH + gap);
        const x = (p.start / total) * w;
        const bw = Math.max(mini ? 4 : 10, (p.duration / total) * w - 2);
        const color = p.critical ? "var(--accent)" : "var(--neutral)";
        const soft = p.critical ? "var(--accent-soft)" : "var(--neutral-soft)";
        s += `<rect x="${x}" y="${y}" width="${bw}" height="${barH}" rx="5" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
        if (!mini) s += `<text x="${x + 6}" y="${y + barH / 2}" dominant-baseline="middle" font-size="${fs}" font-weight="700" fill="var(--text)">${esc(p.name)}${p.critical ? " ★" : ""}</text>`;
      });
      s += `</svg>`;
      return s;
    },

    coverageGrid(mini) {
      const rows = BLUEPRINT.coverage;
      const cols = mini ? 5 : 2;
      const cellW = mini ? 56 : 420;
      const cellH = mini ? 16 : 40;
      const gap = mini ? 3 : 8;
      const rowCount = Math.ceil(rows.length / cols);
      const w = cols * (cellW + gap);
      const h = rowCount * (cellH + gap);
      const fs = mini ? 0 : 12;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Coverage grid: covered versus deferred">`;
      rows.forEach((r, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = col * (cellW + gap), y = row * (cellH + gap);
        const color = r.status === "covered" ? "var(--good)" : "var(--warning)";
        const soft = r.status === "covered" ? "var(--good-soft)" : "var(--warning-soft)";
        s += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" fill="${soft}" stroke="${color}" stroke-width="1.5"/>`;
        if (!mini) s += `<text x="${x + 10}" y="${y + cellH / 2}" dominant-baseline="middle" font-size="${fs}" fill="var(--text)">${esc(r.capability)}</text>
          <text x="${x + cellW - 10}" y="${y + cellH / 2}" text-anchor="end" dominant-baseline="middle" font-size="${fs - 1}" font-weight="700" fill="${color}">${r.status.toUpperCase()}</text>`;
      });
      s += `</svg>`;
      return s;
    },

    fork(mini) {
      const w = mini ? 300 : 760, h = mini ? 92 : 260;
      const fs = mini ? 8 : 13;
      const q = BLUEPRINT.openQuestion;
      const qLabel = mini ? "Send it?" : q.question;
      const qw = estWidth(qLabel, fs) * (mini ? 1.6 : 1);
      const qx = w / 2 - qw / 2, qy = mini ? 4 : 10, qh = mini ? 20 : 46;
      const aLabel = mini ? q.branchA.label : `${q.branchA.label}: ${q.branchA.detail}`;
      const bLabel = mini ? q.branchB.label : `${q.branchB.label}: ${q.branchB.detail}`;
      const branchY = mini ? 56 : 150;
      const branchH = mini ? 24 : 80;
      const aw = mini ? 120 : w * 0.44, bw = mini ? 120 : w * 0.44;
      const ax = w * 0.27 - aw / 2, bx = w * 0.73 - bw / 2;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Open question forking into two design paths">`;
      s += shapeMarkup("backend", qx, qy, qw, qh) + labelMarkup(qx, qy, qw, qh, qLabel, fs);
      s += `<line x1="${qx + qw / 2}" y1="${qy + qh}" x2="${ax + aw / 2}" y2="${branchY}" stroke="var(--muted)" stroke-width="1.5"/>`;
      s += `<line x1="${qx + qw / 2}" y1="${qy + qh}" x2="${bx + bw / 2}" y2="${branchY}" stroke="var(--muted)" stroke-width="1.5"/>`;
      s += `<rect x="${ax}" y="${branchY}" width="${aw}" height="${branchH}" rx="8" fill="var(--good-soft)" stroke="var(--good)" stroke-width="1.5"/>`;
      s += `<rect x="${bx}" y="${branchY}" width="${bw}" height="${branchH}" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" stroke-width="1.5"/>`;
      if (mini) {
        s += labelMarkup(ax, branchY, aw, branchH, q.branchA.label, fs) + labelMarkup(bx, branchY, bw, branchH, q.branchB.label, fs);
      } else {
        s += wrapText(ax + 10, branchY + 20, aw - 20, aLabel, fs, "var(--text)");
        s += wrapText(bx + 10, branchY + 20, bw - 20, bLabel, fs, "var(--text)");
      }
      s += `</svg>`;
      return s;
    },

    miniGraph(mini) {
      const w = mini ? 300 : 260, h = mini ? 92 : 90;
      const pts = [[30, 45], [90, 20], [90, 70], [160, 20], [160, 70], [230, 45]];
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Miniature node graph">`;
      const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]];
      edges.forEach(([a, b]) => { s += `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="var(--border)" stroke-width="2"/>`; });
      pts.forEach((p, i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>`; });
      s += `</svg>`;
      return s;
    },

    listIcon(mini) {
      const w = 300, h = 92;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="List of out-of-scope items">`;
      for (let i = 0; i < 4; i++) {
        const y = 16 + i * 18;
        s += `<circle cx="24" cy="${y}" r="4" fill="var(--warning)"/><rect x="40" y="${y - 4}" width="${220 - i * 20}" height="8" rx="4" fill="var(--neutral-soft)" stroke="var(--border)"/>`;
      }
      s += `</svg>`;
      return s;
    }
  };

  function wrapText(x, y, maxW, text, fs, color) {
    const words = text.split(" ");
    const charsPerLine = Math.max(8, Math.floor(maxW / (fs * 0.55)));
    let lines = [], cur = "";
    words.forEach(word => {
      if ((cur + " " + word).trim().length > charsPerLine) { lines.push(cur.trim()); cur = word; }
      else cur = (cur + " " + word).trim();
    });
    if (cur) lines.push(cur.trim());
    lines = lines.slice(0, 6);
    return lines.map((line, i) => `<text x="${x}" y="${y + i * (fs + 5)}" font-size="${fs}" fill="${color}">${esc(line)}</text>`).join("");
  }

  const TILE_ART = { ribbon: () => Illustrations.pipeline(true), layers: () => Illustrations.layers(true), graph: () => Illustrations.miniGraph(true), steps: () => Illustrations.stepsRibbon(true), bars: () => Illustrations.phaseTimeline(true), grid: () => Illustrations.coverageGrid(true), fork: () => Illustrations.fork(true), list: () => Illustrations.listIcon(true) };

  /* ================= COMMAND CENTER ================= */
  function renderCommandCenter() {
    const host = qs("#tile-grid");
    if (!host) return;
    const counts = { components: `${BLUEPRINT.components.length} components`, architecture: `${BLUEPRINT.components.length} nodes`, "data-flow": `${BLUEPRINT.dataFlow.length} steps`, "build-order": `${BLUEPRINT.buildPhases.length} phases`, coverage: `${BLUEPRINT.coverage.filter(c => c.status === "covered").length} covered, ${BLUEPRINT.coverage.filter(c => c.status === "deferred").length} deferred`, assumptions: `${BLUEPRINT.assumptions.length} assumptions`, "not-covered": `${BLUEPRINT.notCovered.length} deferred items`, summary: "the one-paragraph idea" };
    host.innerHTML = BLUEPRINT.sections.map(s => `
      <a class="tile" href="${s.file}">
        <div class="tile-art">${TILE_ART[s.tile] ? TILE_ART[s.tile]() : ""}</div>
        <div class="tile-body">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
          <div class="tile-count">${esc(counts[s.id] || "")}</div>
        </div>
      </a>`).join("");
  }

  /* ================= ASK PANEL ================= */
  const MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];
  function initAsk(activeId) {
    const toggle = qs("#ask-toggle");
    const panel = qs("#ask-panel");
    if (!toggle || !panel) return;
    let mode = "search";

    panel.innerHTML = `
      <div class="ask-header"><strong>Ask the blueprint</strong><button class="icon-btn" id="ask-close" aria-label="Close">&times;</button></div>
      <div class="ask-modes">
        <button class="ask-mode-btn active" data-mode="search">Search &middot; no key</button>
        <button class="ask-mode-btn" data-mode="claude">Claude &middot; needs key</button>
      </div>
      <div class="ask-body" id="ask-body">
        <p class="ask-note">Answers from the local index. Works fully offline.</p>
      </div>
      <div class="ask-footer">
        <textarea id="ask-input" placeholder="Ask a question about this design..." aria-label="Ask a question"></textarea>
        <button id="ask-send">Ask</button>
      </div>`;

    toggle.addEventListener("click", () => panel.classList.toggle("open"));
    qs("#ask-close").addEventListener("click", () => panel.classList.remove("open"));

    const claudeConfigHtml = `
      <div class="ask-config">
        <input type="password" id="ask-api-key" placeholder="Paste your Anthropic API key (sk-ant-...)" autocomplete="off">
        <select id="ask-model">${MODELS.map(m => `<option value="${m}">${m}</option>`).join("")}</select>
        <div class="scope-row">
          <label><input type="radio" name="ask-scope" value="section" checked> This section</label>
          <label><input type="radio" name="ask-scope" value="all"> Whole blueprint</label>
        </div>
        <p class="ask-note">Your key is stored only in this browser's local storage and sent only to api.anthropic.com.</p>
      </div>`;

    function renderModeBody() {
      const body = qs("#ask-body");
      if (mode === "search") {
        body.innerHTML = `<p class="ask-note">Answers from the local index. Works fully offline.</p>`;
      } else {
        body.innerHTML = claudeConfigHtml;
        const keyInput = qs("#ask-api-key");
        keyInput.value = localStorage.getItem("clienteling_api_key") || "";
        keyInput.addEventListener("change", () => localStorage.setItem("clienteling_api_key", keyInput.value.trim()));
        const savedModel = localStorage.getItem("clienteling_model");
        if (savedModel) qs("#ask-model").value = savedModel;
        qs("#ask-model").addEventListener("change", (e) => localStorage.setItem("clienteling_model", e.target.value));
      }
    }
    qsa(".ask-mode-btn").forEach(btn => btn.addEventListener("click", () => {
      qsa(".ask-mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      renderModeBody();
    }));

    function runSearchMode(q) {
      const body = qs("#ask-body");
      const hits = search(q, { limit: 6 });
      if (!hits.length) {
        body.innerHTML = `<div class="ask-error">No matches found. That gap may be the answer — check <a href="06-coverage.html">Coverage</a> to see what's covered versus deferred.</div>` + body.innerHTML;
        return;
      }
      const cards = hits.map(h => `
        <div class="ask-answer-card">
          <div class="aq"><a class="aq-section" href="${h.doc.section.file}">${esc(h.doc.section.nav)} &middot; ${esc(h.doc.title)}</a></div>
          <div>${snippet(h.doc.text, q, 220)}</div>
        </div>`).join("");
      body.innerHTML = cards;
    }

    async function runClaudeMode(q) {
      const body = qs("#ask-body");
      const key = (qs("#ask-api-key").value || "").trim();
      const model = qs("#ask-model").value;
      const scope = qs('input[name="ask-scope"]:checked').value;
      if (!key) {
        body.innerHTML = `<div class="ask-error">No API key entered. Paste your Anthropic API key above, or switch to Search mode — it needs no key.</div>` + body.innerHTML;
        return;
      }
      const scopeData = scope === "all" ? BLUEPRINT : {
        section: BLUEPRINT.sections.find(s => s.id === activeId),
        idea: BLUEPRINT.idea,
        dayOne: BLUEPRINT.dayOne,
        relevant: pickSectionSlice(activeId)
      };
      const system = `You are answering questions about a system design blueprint for an AI-powered clienteling assistant. Use ONLY the JSON data below — do not use outside knowledge. If the answer isn't contained in this data, say so plainly and suggest which section might have it.\n\n${JSON.stringify(scopeData, null, 2)}`;

      body.innerHTML = `<p class="ask-note">Asking Claude...</p>` + body.innerHTML;
      try {
        const payload = { model, max_tokens: 16000, system, messages: [{ role: "user", content: q }] };
        if (model !== "claude-haiku-4-5") payload.output_config = { effort: "low" };
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = (data && data.error && data.error.message) || `Request failed (HTTP ${res.status}).`;
          const hint = res.status === 401 ? "Check that your API key is correct." : res.status === 429 ? "Rate limit reached — wait a moment and try again." : "You can switch to Search mode while this is sorted out.";
          body.innerHTML = `<div class="ask-error">${esc(msg)} ${esc(hint)}</div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
          return;
        }
        if (data.stop_reason === "refusal") {
          body.innerHTML = `<div class="ask-error">Claude declined to answer this one. Try rephrasing, or switch to Search mode.</div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
          return;
        }
        const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
        body.innerHTML = `<div class="ask-answer-card"><div class="aq">Claude &middot; ${esc(model)} &middot; ${scope === "all" ? "whole blueprint" : "this section"}</div><div>${esc(text || "(empty response)")}</div></div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
      } catch (err) {
        body.innerHTML = `<div class="ask-error">Lost connection to Anthropic's API. Check your internet connection, or switch to Search mode — it works offline.</div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
      }
    }

    function pickSectionSlice(id) {
      switch (id) {
        case "summary": return { idea: BLUEPRINT.idea, dayOne: BLUEPRINT.dayOne };
        case "components": return { components: BLUEPRINT.components, excluded: BLUEPRINT.excludedComponents };
        case "architecture": return { flowchart: BLUEPRINT.diagrams.flowchart, components: BLUEPRINT.components.map(c => c.name) };
        case "data-flow": return { dataFlow: BLUEPRINT.dataFlow };
        case "build-order": return { buildPhases: BLUEPRINT.buildPhases };
        case "coverage": return { coverage: BLUEPRINT.coverage };
        case "assumptions": return { assumptions: BLUEPRINT.assumptions, openQuestion: BLUEPRINT.openQuestion };
        case "not-covered": return { notCovered: BLUEPRINT.notCovered };
        default: return {};
      }
    }

    function send() {
      const input = qs("#ask-input");
      const q = input.value.trim();
      if (!q) return;
      if (mode === "search") runSearchMode(q); else runClaudeMode(q);
      input.value = "";
    }
    qs("#ask-send").addEventListener("click", send);
    qs("#ask-input").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
  }

  /* ================= PUBLIC INIT ================= */
  function initAll(activeId) {
    initTheme();
    initScrollProgress();
    renderChrome(activeId);
    initSearch(activeId);
    initAsk(activeId);
  }

  return { initAll, renderCommandCenter, mountFigure, mermaidDraw, svgDraw, chartDraw, Illustrations, cssVar, esc };
})();
