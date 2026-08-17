/* Shared chrome, search, illustrations, copy buttons, and the Ask agent. Classic script — reference STACK directly. No CDN, no build step. */
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

  const RATING_ICON = { great: "🟢", good: "🟡", careful: "🔴" };
  const RATING_LABEL = { great: "great fit", good: "good fit", careful: "consider carefully" };
  const RATING_CLASS = { great: "great", good: "goodfit", careful: "careful" };
  const RATING_VAR = { great: "good", good: "warning", careful: "risk" };
  const RATING_ORDER = { great: 0, good: 1, careful: 2 };

  function ratingPill(rating) {
    return `<span class="pill pill-${RATING_CLASS[rating]}">${RATING_ICON[rating]} ${esc(RATING_LABEL[rating])}</span>`;
  }

  /* ================= THEME ================= */
  function initTheme() {
    const saved = localStorage.getItem("stack_theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    const btn = qs("#theme-toggle");
    if (btn) btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      const next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("stack_theme", next);
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
    const sections = STACK.sections;
    const idx = sections.findIndex(s => s.id === activeId);

    const navHost = qs("#top-nav");
    if (navHost) {
      navHost.innerHTML = `
        <div class="nav-row">
          <a class="brand" href="index.html">Stack <span>KB</span></a>
          <a class="home-link" href="index.html">&#8962; Command Center</a>
          <div class="section-links">
            ${sections.map(s => `<a href="${s.file}" class="${s.id === activeId ? "current" : ""}">${esc(s.nav)}</a>`).join("")}
          </div>
          <div class="nav-actions">
            <div class="search-wrap">
              <input id="nav-search" type="search" placeholder="Search stack..." aria-label="Search the stack knowledge base" autocomplete="off">
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
      if (bc) bc.innerHTML = `<a href="index.html">Command Center</a> &rsaquo; <a href="../index.html">Architecture</a> &rsaquo; ${esc(sections[idx].title)}`;

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
    const sec = id => STACK.sections.find(s => s.id === id);
    function add(sectionId, title, text) {
      docs.push({ section: sec(sectionId), title, text, tokens: tokenize(title + " " + text), titleTokens: tokenize(title) });
    }
    add("summary", "Headline", STACK.headline);
    STACK.fitKey.forEach(f => add("summary", f.label, f.meaning));
    STACK.leastConfident.forEach(l => add("summary", l.title, l.detail));
    STACK.recommendations.forEach(r => add("stack", `${r.component} — ${r.tech}`, `${r.why} ${r.caveat || ""}`));
    STACK.recommendations.forEach(r => add("prompts", r.component, r.prompt));
    STACK.learningOrder.forEach(l => add("learning", l.tech, `${l.reason} ${l.phase}`));
    STACK.alternatives.forEach(a => add("alternatives", `${a.component}: ${a.chosen} vs ${a.alternative}`, a.whyNot));
    STACK.lockIn.forEach(l => add("lockin", l.component, `${l.difficulty} ${l.reason}`));
    STACK.notTold.forEach(t => add("not-told", "Not told", t));
    STACK.recommendations.forEach(r => add("appendix", `${r.component} — ${r.tech}`, `${RATING_LABEL[r.rating]} ${r.why}`));
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

      qsa("[data-searchable]").forEach(node => {
        if (!q) { node.removeAttribute("data-hit"); return; }
        const hay = (node.getAttribute("data-searchable") || node.textContent).toLowerCase();
        const terms = tokenize(q);
        const hit = terms.every(t => hay.includes(t)) || hay.includes(q.toLowerCase());
        node.setAttribute("data-hit", hit ? "true" : "false");
      });

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

  /* ================= FIGURE SYSTEM (inline SVG only, with fullscreen zoom) ================= */
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

  function svgDraw(svgString) { return (target) => { target.innerHTML = svgString; }; }

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
  }

  /* ================= SVG ILLUSTRATIONS (generated from STACK) ================= */
  function estWidth(text, fontSize) { return Math.max(70, text.length * fontSize * 0.58 + 26); }
  function ratingColor(rating) { return `var(--${RATING_VAR[rating]})`; }
  function ratingSoft(rating) { return `var(--${RATING_VAR[rating]}-soft)`; }

  function arrowDefs() {
    return `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)"/></marker></defs>`;
  }

  const Illustrations = {
    /* whole stack as bands coloured by fit rating */
    stackBands(mini) {
      const recs = STACK.recommendations;
      const w = mini ? 300 : 860;
      const rowH = mini ? 14 : 40;
      const gap = mini ? 4 : 10;
      const h = recs.length * (rowH + gap);
      const fs = mini ? 0 : 12;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Every recommendation as a band coloured by fit rating">`;
      recs.forEach((r, i) => {
        const y = i * (rowH + gap);
        s += `<rect x="0" y="${y}" width="${w}" height="${rowH}" rx="6" fill="${ratingSoft(r.rating)}" stroke="${ratingColor(r.rating)}" stroke-width="1.5"/>`;
        if (!mini) {
          s += `<text x="12" y="${y + rowH / 2}" dominant-baseline="middle" font-size="${fs}" font-weight="700" fill="var(--text)">${esc(r.component)}</text>`;
          s += `<text x="${w - 12}" y="${y + rowH / 2}" text-anchor="end" dominant-baseline="middle" font-size="${fs}" fill="${ratingColor(r.rating)}">${RATING_ICON[r.rating]} ${esc(r.tech)}</text>`;
        }
      });
      s += `</svg>`;
      return s;
    },

    /* proportional bar of great/good/careful, reds called out */
    proportionalBar(mini) {
      const recs = STACK.recommendations;
      const counts = { great: 0, good: 0, careful: 0 };
      recs.forEach(r => counts[r.rating]++);
      const total = recs.length;
      const w = mini ? 300 : 820;
      const barH = mini ? 26 : 54;
      const y = mini ? 4 : 16;
      const order = ["great", "good", "careful"];
      let x = 0;
      const h = mini ? 40 : 130;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Proportional bar of fit ratings across all recommendations">`;
      order.forEach(rating => {
        const segW = (counts[rating] / total) * w;
        if (segW <= 0) return;
        s += `<rect x="${x}" y="${y}" width="${segW}" height="${barH}" fill="${ratingSoft(rating)}" stroke="${ratingColor(rating)}" stroke-width="1.5"/>`;
        if (!mini && segW > 30) {
          s += `<text x="${x + segW / 2}" y="${y + barH / 2}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="700" fill="${ratingColor(rating)}">${counts[rating]}</text>`;
        }
        x += segW;
      });
      if (!mini) {
        const calloutX = w - (counts.careful / total) * w / 2;
        s += `<line x1="${calloutX}" y1="${y + barH}" x2="${calloutX}" y2="${y + barH + 18}" stroke="var(--risk)" stroke-width="1.5"/>`;
        s += `<text x="${calloutX}" y="${y + barH + 32}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--risk)">${counts.careful} to watch closely</text>`;
        s += `<text x="0" y="${y - 6}" font-size="11" fill="var(--muted)">${total} recommendations total</text>`;
      }
      s += `</svg>`;
      return s;
    },

    /* topology: runs on your machine vs always somebody else's servers */
    topology(mini) {
      const yours = STACK.recommendations.filter(r => r.runsOn === "yours");
      const theirs = STACK.recommendations.filter(r => r.runsOn === "theirs");
      const w = mini ? 300 : 820;
      const h = mini ? 92 : 260;
      const fs = mini ? 8 : 12;
      const colW = w * 0.46;
      const leftX = w * 0.02, rightX = w * 0.52;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="What runs on your machine versus always somebody else's servers">`;
      s += `<line x1="${w / 2}" y1="10" x2="${w / 2}" y2="${h - 10}" stroke="var(--border)" stroke-width="2" stroke-dasharray="4 4"/>`;
      if (!mini) {
        s += `<text x="${leftX}" y="16" font-size="11" fill="var(--muted)" letter-spacing="1">YOUR CODE, ANY HOST</text>`;
        s += `<text x="${rightX}" y="16" font-size="11" fill="var(--muted)" letter-spacing="1">ALWAYS SOMEBODY ELSE'S</text>`;
      }
      const rowH = mini ? 16 : 36, gap = mini ? 4 : 12;
      const top = mini ? 4 : 28;
      yours.forEach((r, i) => {
        const y = top + i * (rowH + gap);
        const label = mini ? r.component.split(" ")[0] : r.component;
        const bw = mini ? colW : estWidth(label, fs) + 20;
        s += `<rect x="${leftX}" y="${y}" width="${Math.min(bw, colW)}" height="${rowH}" rx="8" fill="var(--good-soft)" stroke="var(--good)" stroke-width="1.5"/>`;
        if (!mini) s += `<text x="${leftX + 10}" y="${y + rowH / 2}" dominant-baseline="middle" font-size="${fs}" fill="var(--text)">${esc(label)}</text>`;
      });
      theirs.forEach((r, i) => {
        const y = top + i * (rowH + gap);
        const label = mini ? r.component.split(" ")[0] : r.component;
        const bw = mini ? colW : estWidth(label, fs) + 20;
        s += `<rect x="${rightX}" y="${y}" width="${Math.min(bw, colW)}" height="${rowH}" rx="8" fill="var(--warning-soft)" stroke="var(--warning)" stroke-width="1.5"/>`;
        if (!mini) s += `<text x="${rightX + 10}" y="${y + rowH / 2}" dominant-baseline="middle" font-size="${fs}" fill="var(--text)">${esc(label)}</text>`;
      });
      s += `</svg>`;
      return s;
    },

    /* learning ladder — ascending rungs in learning order */
    learningLadder(mini) {
      const items = STACK.learningOrder;
      const w = mini ? 300 : 780;
      const stepW = w / items.length;
      const maxH = mini ? 70 : 190;
      const fs = mini ? 0 : 11;
      const h = maxH + (mini ? 10 : 40);
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Learning order as an ascending staircase">`;
      items.forEach((it, i) => {
        const stepH = maxH * ((i + 1) / items.length);
        const x = i * stepW + (mini ? 2 : 6);
        const y = h - stepH - (mini ? 4 : 24);
        const bw = stepW - (mini ? 4 : 12);
        s += `<rect x="${x}" y="${y}" width="${bw}" height="${stepH}" rx="6" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>`;
        if (!mini) {
          s += `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent)">${i + 1}</text>`;
          s += wrapText(x + 6, h - 14, bw - 12, it.tech, fs, "var(--text)");
        }
      });
      s += `</svg>`;
      return s;
    },

    /* lock-in scale — horizontal gauges per decision */
    lockInScale(mini) {
      const items = STACK.lockIn;
      const w = mini ? 300 : 780;
      const rowH = mini ? 12 : 30;
      const gap = mini ? 3 : 10;
      const h = items.length * (rowH + gap);
      const fs = mini ? 0 : 11;
      const trackX = mini ? 4 : (w * 0.42);
      const trackW = w - trackX - (mini ? 4 : 10);
      const colorFor = { easy: "var(--good)", medium: "var(--warning)", hard: "var(--risk)" };
      const softFor = { easy: "var(--good-soft)", medium: "var(--warning-soft)", hard: "var(--risk-soft)" };
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scale of how hard each decision is to undo">`;
      items.forEach((it, i) => {
        const y = i * (rowH + gap);
        if (!mini) s += `<text x="0" y="${y + rowH / 2}" dominant-baseline="middle" font-size="${fs}" fill="var(--text)">${esc(it.component.split(" (")[0])}</text>`;
        s += `<rect x="${trackX}" y="${y}" width="${trackW}" height="${rowH}" rx="${rowH / 2}" fill="var(--neutral-soft)"/>`;
        const fillW = trackW * (it.score / 3);
        s += `<rect x="${trackX}" y="${y}" width="${fillW}" height="${rowH}" rx="${rowH / 2}" fill="${softFor[it.difficulty]}" stroke="${colorFor[it.difficulty]}" stroke-width="1.5"/>`;
      });
      s += `</svg>`;
      return s;
    },

    /* small tile icons */
    promptsIcon(mini) {
      const w = 300, h = 92;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Prompt cards with copy buttons">`;
      for (let i = 0; i < 3; i++) {
        const y = 10 + i * 26;
        s += `<rect x="10" y="${y}" width="220" height="18" rx="5" fill="var(--neutral-soft)" stroke="var(--border)"/>`;
        s += `<rect x="240" y="${y}" width="50" height="18" rx="5" fill="var(--accent-soft)" stroke="var(--accent)"/>`;
      }
      s += `</svg>`;
      return s;
    },
    vsIcon(mini) {
      const w = 300, h = 92;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="One technology versus another">`;
      s += `<rect x="20" y="28" width="100" height="36" rx="8" fill="var(--good-soft)" stroke="var(--good)" stroke-width="1.5"/>`;
      s += `<rect x="180" y="28" width="100" height="36" rx="8" fill="var(--neutral-soft)" stroke="var(--border)" stroke-width="1.5"/>`;
      s += `<text x="150" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="var(--muted)">vs</text>`;
      s += `</svg>`;
      return s;
    },
    gapIcon(mini) {
      const w = 300, h = 92;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gaps this document does not cover">`;
      for (let i = 0; i < 4; i++) {
        const y = 16 + i * 18;
        s += `<circle cx="24" cy="${y}" r="8" fill="var(--warning-soft)" stroke="var(--warning)"/><text x="24" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--warning)">?</text>`;
        s += `<rect x="42" y="${y - 4}" width="${220 - i * 20}" height="8" rx="4" fill="var(--neutral-soft)" stroke="var(--border)"/>`;
      }
      s += `</svg>`;
      return s;
    },
    tableIcon(mini) {
      const w = 300, h = 92, cols = 3, rows = 4;
      const cw = 280 / cols, rh = 76 / rows;
      let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Full reference table">`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        s += `<rect x="${10 + c * cw}" y="${8 + r * rh}" width="${cw - 4}" height="${rh - 4}" rx="3" fill="${r === 0 ? "var(--accent-soft)" : "var(--neutral-soft)"}" stroke="var(--border)"/>`;
      }
      s += `</svg>`;
      return s;
    }
  };

  function wrapText(x, y, maxW, text, fs, color) {
    if (!fs) return "";
    const words = text.split(" ");
    const charsPerLine = Math.max(6, Math.floor(maxW / (fs * 0.55)));
    let lines = [], cur = "";
    words.forEach(word => {
      if ((cur + " " + word).trim().length > charsPerLine) { lines.push(cur.trim()); cur = word; }
      else cur = (cur + " " + word).trim();
    });
    if (cur) lines.push(cur.trim());
    lines = lines.slice(0, 3);
    return lines.map((line, i) => `<text x="${x}" y="${y + i * (fs + 4)}" font-size="${fs}" fill="${color}">${esc(line)}</text>`).join("");
  }

  const TILE_ART = {
    bands: () => Illustrations.stackBands(true),
    topology: () => Illustrations.topology(true),
    prompts: () => Illustrations.promptsIcon(true),
    ladder: () => Illustrations.learningLadder(true),
    vs: () => Illustrations.vsIcon(true),
    lockin: () => Illustrations.lockInScale(true),
    gap: () => Illustrations.gapIcon(true),
    table: () => Illustrations.tableIcon(true)
  };

  /* ================= COMMAND CENTER ================= */
  function renderCommandCenter() {
    const host = qs("#tile-grid");
    if (!host) return;
    const counts = {
      summary: `${STACK.fitKey.length} rating levels`,
      stack: `${STACK.recommendations.length} recommendations`,
      prompts: `${STACK.recommendations.length} copy-ready prompts`,
      learning: `${STACK.learningOrder.length} steps`,
      alternatives: `${STACK.alternatives.length} compared`,
      lockin: `${STACK.lockIn.length} decisions rated`,
      "not-told": `${STACK.notTold.length} gaps named`,
      appendix: `${STACK.recommendations.length} rows`
    };
    host.innerHTML = STACK.sections.map(s => `
      <a class="tile" href="${s.file}">
        <div class="tile-art">${TILE_ART[s.tile] ? TILE_ART[s.tile]() : ""}</div>
        <div class="tile-body">
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.description)}</p>
          <div class="tile-count">${esc(counts[s.id] || "")}</div>
        </div>
      </a>`).join("");
  }

  /* ================= COPY BUTTONS ================= */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("execCommand failed"));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }
  function initCopyButtons() {
    qsa("[data-copy]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-copy");
        copyText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1600);
        }).catch(() => {
          const orig = btn.textContent;
          btn.textContent = "Copy failed";
          setTimeout(() => { btn.textContent = orig; }, 1600);
        });
      });
    });
  }

  /* ================= ASK PANEL ================= */
  const MODELS = ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"];
  function initAsk(activeId) {
    const toggle = qs("#ask-toggle");
    const panel = qs("#ask-panel");
    if (!toggle || !panel) return;
    let mode = "search";

    panel.innerHTML = `
      <div class="ask-header"><strong>Ask the stack</strong><button class="icon-btn" id="ask-close" aria-label="Close">&times;</button></div>
      <div class="ask-modes">
        <button class="ask-mode-btn active" data-mode="search">Search &middot; no key</button>
        <button class="ask-mode-btn" data-mode="claude">Claude &middot; needs key</button>
      </div>
      <div class="ask-body" id="ask-body">
        <p class="ask-note">Answers from the local index. Works fully offline.</p>
      </div>
      <div class="ask-footer">
        <textarea id="ask-input" placeholder="Ask about a technology choice..." aria-label="Ask a question"></textarea>
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
          <label><input type="radio" name="ask-scope" value="all"> Whole stack</label>
        </div>
        <p class="ask-note">Your key is stored only in this browser's local storage and sent only to api.anthropic.com.</p>
        <p class="refusal-note">This assistant answers only from the stack data below, and it will never talk you out of a 🔴 rating.</p>
      </div>`;

    function renderModeBody() {
      const body = qs("#ask-body");
      if (mode === "search") {
        body.innerHTML = `<p class="ask-note">Answers from the local index. Works fully offline.</p>`;
      } else {
        body.innerHTML = claudeConfigHtml;
        const keyInput = qs("#ask-api-key");
        keyInput.value = localStorage.getItem("stack_api_key") || "";
        keyInput.addEventListener("change", () => localStorage.setItem("stack_api_key", keyInput.value.trim()));
        const savedModel = localStorage.getItem("stack_model");
        if (savedModel) qs("#ask-model").value = savedModel;
        qs("#ask-model").addEventListener("change", (e) => localStorage.setItem("stack_model", e.target.value));
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
        body.innerHTML = `<div class="ask-error">No matches found. Try <a href="07-not-told.html">What This Doesn't Tell You</a> — that gap may be the answer.</div>` + body.innerHTML;
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
      const scopeData = scope === "all" ? STACK : {
        section: STACK.sections.find(s => s.id === activeId),
        headline: STACK.headline,
        fitKey: STACK.fitKey,
        relevant: pickSectionSlice(activeId)
      };
      const system = `You are answering questions about a technology stack recommendation for an AI-powered clienteling assistant. Use ONLY the JSON data below — do not use outside knowledge. Never talk the user out of a 🔴 "consider carefully" rating; if asked, explain the caveat instead. If the answer isn't contained in this data, say so plainly and suggest which section might have it.\n\n${JSON.stringify(scopeData, null, 2)}`;

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
        body.innerHTML = `<div class="ask-answer-card"><div class="aq">Claude &middot; ${esc(model)} &middot; ${scope === "all" ? "whole stack" : "this section"}</div><div>${esc(text || "(empty response)")}</div></div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
      } catch (err) {
        body.innerHTML = `<div class="ask-error">Lost connection to Anthropic's API. Check your internet connection, or switch to Search mode — it works offline.</div>` + body.innerHTML.replace(`<p class="ask-note">Asking Claude...</p>`, "");
      }
    }

    function pickSectionSlice(id) {
      switch (id) {
        case "summary": return { fitKey: STACK.fitKey, headline: STACK.headline, leastConfident: STACK.leastConfident };
        case "stack": return { groups: STACK.groups, recommendations: STACK.recommendations };
        case "prompts": return { prompts: STACK.recommendations.map(r => ({ component: r.component, prompt: r.prompt })) };
        case "learning": return { learningOrder: STACK.learningOrder };
        case "alternatives": return { alternatives: STACK.alternatives };
        case "lockin": return { lockIn: STACK.lockIn };
        case "not-told": return { notTold: STACK.notTold };
        case "appendix": return { recommendations: STACK.recommendations };
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
    initCopyButtons();
  }

  return {
    initAll, renderCommandCenter, mountFigure, svgDraw, Illustrations, cssVar, esc,
    ratingPill, RATING_ICON, RATING_LABEL, RATING_CLASS, initCopyButtons
  };
})();
