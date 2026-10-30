/*
 * app.js — CV cinématographique, page continue, multilingue (FR/DE/EN).
 * Données : CV_BASE + CV_I18N (js/data.js). Aucune donnée inventée ici.
 *
 * Fonctions :
 *  - i18n : changement de langue instantané, re-render de tout le contenu.
 *  - Sommaire (barre + rail) avec scroll fluide et scroll-spy.
 *  - Révélation au défilement (robuste même via ancre directe).
 *  - Section Langues enrichie, badge « championnes vaudoises 2026 »,
 *    composition éditoriale pour la gymnastique individuelle.
 *  - Persistance de la langue (localStorage), défaut FR.
 */
(function () {
  "use strict";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- utilitaires ---------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  const telHref = (t) => "tel:" + t.replace(/\s/g, "");

  /* ---------- état langue ---------- */
  const LANGS = ["fr", "de", "en"];
  let lang = "fr";
  try {
    const saved = localStorage.getItem("cv-lang");
    if (saved && LANGS.includes(saved)) lang = saved;
  } catch (e) { /* localStorage indisponible : on garde le défaut */ }

  const T = () => CV_I18N[lang];

  /* ---------- ordre des rubriques (hero + sections) ---------- */
  // "Projets" n'existe pas comme rubrique distincte dans le CV source
  // (pas de projets séparés des expériences) -> on ne l'invente pas.
  const SECTION_IDS = ["accueil", "profil", "formation", "experiences", "competences", "langues", "contact"];
  const SECTION_INDEX = { profil: "01", formation: "02", experiences: "03", competences: "04", langues: "05", contact: "06" };

  /* ================================================================
     PORTRAIT (photo réelle ou placeholder élégant — jamais de faux visage)
     ================================================================ */
  function fillPortrait(node, isHero) {
    if (!node) return;
    // Hero : photo d'accueil (Titre.jpg) ; Profil : portrait dédié.
    const src = isHero
      ? (CV_BASE.profil.photoHero || CV_BASE.profil.photo)
      : CV_BASE.profil.photo;
    if (src) {
      // Vraie photo : balise <img> (plus fiable qu'un background) + repli
      // sur le placeholder si l'image ne charge pas.
      node.classList.add("has-photo");
      node.style.removeProperty("--photo");
      // Le hero reçoit un fondu « depuis le noir » + un reflet lumineux lent.
      const cls = isHero ? "portrait-img hero-fade" : "portrait-img";
      const sweep = isHero ? '<span class="photo-sweep" aria-hidden="true"></span>' : "";
      node.innerHTML = `<img class="${cls}" src="${esc(src)}"
        alt="Portrait de ${esc(CV_BASE.profil.prenom)} ${esc(CV_BASE.profil.nom)}"
        loading="eager" decoding="async"
        onerror="this.closest('.portrait,.profil-portrait').classList.remove('has-photo');
                 this.outerHTML='&lt;div class=&quot;portrait-ph&quot;&gt;&lt;div class=&quot;mono&quot;&gt;${esc(CV_BASE.profil.initiales)}&lt;/div&gt;&lt;/div&gt;';" />${sweep}`;
    } else {
      node.classList.remove("has-photo");
      node.innerHTML = `<div class="portrait-ph">
        <div class="mono">${esc(CV_BASE.profil.initiales)}</div>
        ${isHero ? '<div class="ph-note">Photo professionnelle à ajouter</div>' : ""}
      </div>`;
    }
  }

  /* ================================================================
     CONSTRUCTION DES SECTIONS (re-rendu à chaque changement de langue)
     ================================================================ */
  const host = document.getElementById("sections");

  // Trajectoires « ruban » : une courbe fluide distincte par section,
  // qui se dessine au défilement (continuité visuelle sur la page).
  const RIBBONS = {
    profil:      "M10 120 C 180 20, 300 180, 520 70 S 820 20, 990 110",
    formation:   "M10 60 C 220 160, 360 10, 560 120 S 840 180, 990 50",
    experiences: "M10 90 C 160 10, 340 170, 520 60 S 760 10, 990 140",
    competences: "M10 130 C 240 40, 420 150, 600 40 S 860 150, 990 60",
    langues:     "M10 40 C 200 150, 380 20, 560 140 S 820 40, 990 120",
    contact:     "M10 100 C 260 10, 440 160, 640 60 S 880 150, 990 40",
  };

  function sectionShell(id) {
    const t = T();
    const sec = el("section", "section");
    sec.id = id;
    sec.classList.add("sec-" + id);
    const inner = el("div", "section-inner");
    const note = (t.ui.notes && t.ui.notes[id]) ? t.ui.notes[id] : "";
    const ribbon = RIBBONS[id] || RIBBONS.profil;
    inner.innerHTML = `
      <svg class="sec-ribbon" viewBox="0 0 1000 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="${ribbon}" fill="none" stroke="url(#ribbonGrad)" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <div class="section-head reveal">
      <span class="section-index" aria-hidden="true">${SECTION_INDEX[id]}<span class="idx-slash">/</span>06</span>
      <h2 class="section-title split" data-text="${esc(t.ui.sections[id])}">${esc(t.ui.sections[id])}</h2>
      <div class="section-meta">
        <span class="section-rule" aria-hidden="true"></span>
        ${note ? `<span class="section-note">${esc(note)}</span>` : ""}
      </div>
    </div>`;
    sec.appendChild(inner);
    return { sec, inner };
  }

  function buildProfil() {
    const t = T(), p = CV_BASE.profil, c = CV_BASE.contact;
    const { sec, inner } = sectionShell("profil");
    const grid = el("div", "profil-grid reveal");
    grid.innerHTML = `
      <div class="profil-info">
        <h3>${esc(p.prenom)} ${esc(p.nom)}</h3>
        <p class="profil-role">${esc(t.ui.role)}</p>
        <p class="profil-pres">${esc(t.presentation)}</p>
        <div class="profil-contact">
          <a href="mailto:${esc(c.email)}" title="${esc(t.ui.labelEmail)}"><span class="pc-k">${esc(t.ui.labelEmail)}</span>${esc(c.email)}</a>
          <a href="${esc(telHref(c.telephone))}" title="${esc(t.ui.labelPhone)}"><span class="pc-k">${esc(t.ui.labelPhone)}</span>${esc(c.telephone)}</a>
        </div>
      </div>
      <div class="profil-media">
        <div class="profil-portrait" role="img" aria-label="${esc(p.prenom)} ${esc(p.nom)}"></div>
        <p class="profil-quote">${esc(t.ui.profilQuote)}</p>
      </div>`;
    inner.appendChild(grid);
    fillPortrait(grid.querySelector(".profil-portrait"), false);
    return sec;
  }

  function buildFormation() {
    const t = T();
    const { sec, inner } = sectionShell("formation");
    const tl = el("div", "timeline reveal");
    CV_BASE.formations.forEach((f) => {
      const item = el("div", "tl-item");
      item.innerHTML = `${f.annee ? `<div class="tl-year">${esc(f.annee)}</div>` : ""}
        <div class="tl-title">${esc(t.formTitles[f.id])}</div>`;
      tl.appendChild(item);
    });
    inner.appendChild(tl);
    return sec;
  }

  function buildExperiences() {
    const t = T();
    const { sec, inner } = sectionShell("experiences");
    inner.appendChild(el("p", "exp-aside reveal", esc(t.ui.expAside)));
    const list = el("div", "exp-list");
    CV_BASE.experiences.forEach((x) => {
      if (x.feature === "editorial") { list.appendChild(buildGymEditorial(x)); return; }
      const card = el("div", "exp reveal");
      const periode = x.periode ? t.periodes[x.periode] : null;
      const meta = [x.lieu, periode].filter(Boolean).join(" · ");
      let html = `<div class="exp-top">
          <span class="exp-type">${esc(t.expTypes[x.id])}</span>
          <h3>${esc(t.expTitles[x.id])}</h3>
          ${meta ? `<span class="exp-meta">${esc(meta)}</span>` : ""}
        </div>`;

      if (x.feature === "trophy") {
        // FSG Lucens : paragraphes + points + badge de distinction
        const f = t.fsg;
        html += `<div class="exp-rich">`;
        f.paragraphs.forEach((pr) => { html += `<p>${esc(pr)}</p>`; });
        html += `<ul class="exp-highlights">` +
          f.highlights.map((h) => `<li>${esc(h)}</li>`).join("") + `</ul>`;
        html += `<div class="trophy reveal">
            <span class="trophy-ico" aria-hidden="true">🏆</span>
            <span class="trophy-txt">
              <span class="trophy-label">${esc(t.ui.trophyLabel)}</span>
              <strong>${esc(t.ui.trophyTitle)}</strong>
              <small>${esc(t.ui.trophySub)}</small>
            </span>
          </div>`;
        html += `<p class="trophy-caption">${esc(f.achievement)}</p>`;
        html += `</div>`;
      } else {
        const details = t.expDetails[x.id] || [];
        if (details.length)
          html += "<ul>" + details.map((d) => `<li>${esc(d)}</li>`).join("") + "</ul>";
      }

      if (x.outils && x.outils.length)
        html += `<div class="exp-chips">` +
          x.outils.map((o) => `<span class="chip">${esc(o)}</span>`).join("") + `</div>`;

      card.innerHTML = html;
      list.appendChild(card);
    });
    inner.appendChild(list);
    return sec;
  }

  // Gymnastique individuelle : composition immersive éditoriale
  function buildGymEditorial(x) {
    const t = T(), g = t.gym;
    const block = el("article", "gym-editorial reveal");
    block.innerHTML = `
      <svg class="gym-ribbon" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-20 40 C 180 -20, 240 220, 440 120 S 680 60, 620 320" fill="none" stroke="url(#ribbonGrad)" stroke-width="1.6"/>
        <path d="M-20 120 C 160 60, 300 300, 500 180 S 700 140, 640 380" fill="none" stroke="url(#ribbonGrad)" stroke-width="1" opacity="0.5"/>
      </svg>
      <span class="exp-type">${esc(t.expTypes[x.id])}</span>
      <h3 class="gym-title">${esc(t.expTitles[x.id])}</h3>
      <p class="exp-meta gym-meta">${esc(x.lieu)}</p>
      <div class="gym-body">
        ${g.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      <div class="gym-values">
        <p class="gym-values-title">${esc(t.ui.valuesTitle)}</p>
        <div class="gym-values-grid">
          ${t.ui.values.map((v, i) => `<div class="gym-value" style="--i:${i}"><span class="gv-dot"></span>${esc(v)}</div>`).join("")}
        </div>
      </div>
      <blockquote class="gym-quote">${esc(g.quote)}</blockquote>`;
    return block;
  }

  // Icônes (glyphes) par compétence — purement décoratif, aucune donnée inventée.
  const SKILL_ICON = {
    word: "📝", powerpoint: "📊", excel: "📈", outlook: "✉", teams: "👥",
    kiro: "✦", uniqueai: "🤖", n8n: "🔗",
    organisation: "🗂", accueil: "🤝", admin: "🗃", feedback: "💬", apprentissage: "🌱",
  };

  function buildCompetences() {
    const t = T();
    const { sec, inner } = sectionShell("competences");
    const group = (title, keys) => {
      if (!keys.length) return;
      const g = el("div", "skills-group reveal");
      g.innerHTML = `<h3>${esc(title)}</h3>`;
      const grid = el("div", "skill-grid");
      keys.forEach((k, i) => {
        const [nom, desc] = t.skills[k];
        const s = el("div", "skill");
        s.style.setProperty("--d", i);
        s.innerHTML = `
          <span class="skill-ico" aria-hidden="true">${SKILL_ICON[k] || "✦"}</span>
          <h4>${esc(nom)}</h4>
          <p>${esc(desc)}</p>
          <span class="skill-corner" aria-hidden="true"></span>`;
        s.addEventListener("pointermove", (e) => {
          const r = s.getBoundingClientRect();
          s.style.setProperty("--mx", e.clientX - r.left + "px");
          s.style.setProperty("--my", e.clientY - r.top + "px");
        });
        grid.appendChild(s);
      });
      g.appendChild(grid);
      inner.appendChild(g);
    };
    group(t.ui.skillsTech, CV_BASE.competences.techniques);
    group(t.ui.skillsPerso, CV_BASE.competences.personnelles);
    return sec;
  }

  // Section Langues — « Language Atelier » : 4 grandes cartes 2×2
  function buildLangues() {
    const t = T();
    const { sec, inner } = sectionShell("langues");
    sec.classList.add("langues-section");
    const intro = el("p", "langues-intro reveal", esc(t.ui.langIntro));
    inner.appendChild(intro);

    // Code affiché dans le badge : "GB" pour l'anglais (comme la référence), sinon le code réel.
    const BADGE = { en: "GB" };
    // Échelle de 5 pastilles : représentation fidèle du niveau réel (pas de score inventé).
    // maternelle = 5/5 ; B2 = 4/5 ; B1 = 3/5 ; A2 = 2/5 ; A1 = 1/5.
    const DOTS = { mother: 5, C2: 5, C1: 5, B2: 4, B1: 3, A2: 2, A1: 1 };

    const grid = el("div", "langues-grid");
    CV_BASE.langues.forEach((l, i) => {
      const name = t.langNames[l.code];
      const code = (BADGE[l.code] || l.code).toUpperCase();
      // Médaillon : niveau CEFR réel, ou mention courte "Natif" pour langue maternelle.
      const medal = l.mother ? t.ui.nativeShort : (l.level || "");
      // Badge haut-droite : "Langue maternelle" ou le niveau réel.
      const badgeTxt = l.mother ? t.ui.mother : (l.level || "");
      const filled = l.mother ? 5 : (DOTS[l.level] || 0);
      const desc = (t.ui.langDesc && t.ui.langDesc[l.code]) || "";
      const dots = Array.from({ length: 5 }, (_, k) =>
        `<span class="dot5 ${k < filled ? "on" : ""}" style="--k:${k}"></span>`).join("");

      const panel = el("article", "lang-card reveal");
      panel.style.setProperty("--i", i);
      panel.setAttribute("tabindex", "0");
      panel.innerHTML = `
        <span class="lc-sheen" aria-hidden="true"></span>
        <span class="lc-scene lc-scene-${l.code}" aria-hidden="true"></span>
        <span class="lc-badge ${l.mother ? "is-mother" : ""}">${l.mother ? "" : '<span class="lc-bars" aria-hidden="true"></span>'}${esc(badgeTxt)}</span>
        <span class="lc-code">${esc(code)}</span>
        <span class="lc-name">${esc(name)}</span>
        <span class="lc-rule" aria-hidden="true"></span>
        <span class="lc-medal ${l.mother ? "is-mother" : ""}"><span class="lc-medal-in">${esc(medal)}</span></span>
        <span class="lc-level">
          <span class="lc-level-label">${esc(t.ui.levelLabel || "NIVEAU")}</span>
          <span class="lc-dots">${dots}</span>
        </span>
        ${desc ? `<p class="lc-desc">${esc(desc)}</p>` : ""}`;
      grid.appendChild(panel);
    });
    inner.appendChild(grid);

    // Petite note en bas à droite (comme la référence)
    if (t.ui.langFootnote) {
      inner.appendChild(el("p", "langues-footnote reveal", esc(t.ui.langFootnote)));
    }
    return sec;
  }

  function buildContact() {
    const t = T(), c = CV_BASE.contact;
    const { sec, inner } = sectionShell("contact");
    const box = el("div", "contact-box reveal");
    box.innerHTML = `
      <p class="lead">${esc(t.ui.contactLead)}</p>
      <div class="contact-links">
        <a class="contact-link" href="mailto:${esc(c.email)}"><span class="cl-k">${esc(t.ui.labelEmail)}</span><span class="cl-v">${esc(c.email)}</span></a>
        <a class="contact-link" href="${esc(telHref(c.telephone))}"><span class="cl-k">${esc(t.ui.labelPhone)}</span><span class="cl-v">${esc(c.telephone)}</span></a>
      </div>`;
    inner.appendChild(box);
    return sec;
  }

  const BUILDERS = {
    profil: buildProfil, formation: buildFormation, experiences: buildExperiences,
    competences: buildCompetences, langues: buildLangues,
    contact: buildContact,
  };

  function renderSections() {
    host.innerHTML = "";
    SECTION_IDS.filter((id) => id !== "accueil").forEach((id) => {
      host.appendChild(BUILDERS[id]());
    });
    observeReveals();
    observeRibbons();
    rebindAnchors();
    observeSpy();
  }

  /* Dessin des trajectoires « ruban » à l'entrée de chaque section */
  let ribbonIO = null;
  function observeRibbons() {
    const secs = host.querySelectorAll(".section");
    if (prefersReduced) { secs.forEach((s) => s.classList.add("in-view")); return; }
    if (!ribbonIO) {
      ribbonIO = new IntersectionObserver(
        (entries) => entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add("in-view"); }),
        { rootMargin: "0px 0px -15% 0px", threshold: 0.12 }
      );
    }
    secs.forEach((s) => ribbonIO.observe(s));
    requestAnimationFrame(() => {
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) s.classList.add("in-view");
      });
    });
  }

  /* ================================================================
     SOMMAIRE (barre + rail) — construit une fois, libellés traduits
     ================================================================ */
  const nav = document.getElementById("main-nav");
  const rail = document.getElementById("rail");

  function buildMenus() {
    nav.innerHTML = "";
    rail.innerHTML = "";
    const t = T();

    // En-tête de la sidebar : identité (comme dans la maquette)
    const brand = el("a", "rail-brand");
    brand.href = "#accueil"; brand.dataset.id = "accueil";
    brand.innerHTML = `<span class="rail-brand-name">${esc(CV_BASE.profil.prenom)}</span>
      <span class="rail-brand-sub">${esc(CV_BASE.profil.nom.toUpperCase())}</span>`;
    rail.appendChild(brand);

    const list = el("nav", "rail-nav");
    list.setAttribute("aria-label", "Navigation du CV");
    SECTION_IDS.forEach((id) => {
      const a = el("a", null, esc(t.ui.nav[id]));
      a.href = "#" + id; a.dataset.id = id;
      nav.appendChild(a);
      const r = el("a", null, `<span class="dot"></span><span class="rail-label">${esc(t.ui.nav[id])}</span>`);
      r.href = "#" + id; r.dataset.id = id;
      list.appendChild(r);
    });
    rail.appendChild(list);

    // Citation éditoriale + repère SCROLL (bas de sidebar)
    const foot = el("div", "rail-foot");
    foot.innerHTML = `<p class="rail-quote">${t.ui.railFoot}</p>
      <span class="rail-scroll" aria-hidden="true">${esc(t.ui.scrollHint)}</span>`;
    rail.appendChild(foot);
    rebindAnchors();
  }

  /* ================================================================
     i18n : textes statiques (data-i18n) + hero + <html lang>
     ================================================================ */
  function applyStaticI18n() {
    const t = T();
    document.documentElement.lang = t.htmlLang;
    document.querySelectorAll("[data-i18n]").forEach((n) => {
      const key = n.dataset.i18n;
      if (t.ui[key] != null) n.textContent = t.ui[key];
    });
    document.getElementById("hero-role").textContent = t.ui.role;
    document.getElementById("hero-tagline").textContent = t.ui.tagline;
    document.getElementById("foot-name").textContent =
      "© " + CV_BASE.profil.prenom + " " + CV_BASE.profil.nom + " — MMXXVI";
  }

  /* ================================================================
     SÉLECTEUR DE LANGUE
     ================================================================ */
  const langSwitch = document.getElementById("lang-switch");
  function updateLangButtons() {
    langSwitch.querySelectorAll(".lang-opt").forEach((b) => {
      const on = b.dataset.lang === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    langSwitch.dataset.active = lang;
  }
  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) { if (next === lang) return; }
    lang = next;
    try { localStorage.setItem("cv-lang", lang); } catch (e) {}
    applyStaticI18n();
    buildMenus();
    renderSections();
    updateLangButtons();
    // Re-applique la section active au scroll-spy
    onScroll();
  }
  langSwitch.querySelectorAll(".lang-opt").forEach((b) => {
    b.addEventListener("click", () => setLang(b.dataset.lang));
    b.addEventListener("keydown", (e) => {
      // navigation clavier gauche/droite entre les options
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const idx = LANGS.indexOf(b.dataset.lang);
        const nextIdx = e.key === "ArrowRight" ? (idx + 1) % 3 : (idx + 2) % 3;
        const target = langSwitch.querySelector(`[data-lang="${LANGS[nextIdx]}"]`);
        target.focus(); setLang(LANGS[nextIdx]);
      }
    });
  });

  /* ================================================================
     NAVIGATION : scroll fluide + menu mobile
     ================================================================ */
  const burger = document.getElementById("burger");
  function closeMenu() { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });

  function rebindAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      if (a.dataset.bound) return;
      a.dataset.bound = "1";
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
          closeMenu();
        }
      });
    });
  }

  /* ================================================================
     SCROLL-SPY + progression
     ================================================================ */
  const progress = document.getElementById("scroll-progress");
  let spy = null;

  function setActive(id) {
    document.querySelectorAll("#main-nav a, #rail a").forEach((a) =>
      a.classList.toggle("active", a.dataset.id === id)
    );
  }
  function observeSpy() {
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); }),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    SECTION_IDS.forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }
  function onScroll() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ================================================================
     RÉVÉLATION AU SCROLL (robuste : affiche ce qui est déjà visible)
     ================================================================ */
  let revIO = null;
  function observeReveals() {
    const nodes = document.querySelectorAll(".reveal:not(.in)");
    if (prefersReduced) { nodes.forEach((n) => n.classList.add("in")); return; }
    if (!revIO) {
      revIO = new IntersectionObserver(
        (entries, obs) => entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
        }),
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    nodes.forEach((n) => revIO.observe(n));
    // Sécurité : révèle immédiatement ce qui est déjà dans la fenêtre
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add("in");
      });
    });
  }

  /* ================================================================
     FOND : particules reliées (léger)
     ================================================================ */
  (function background() {
    if (prefersReduced) return;
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, pts;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(60, Math.floor((w * h) / 28000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240,202,217,0.4)"; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 15000) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,107,135,${0.1 * (1 - d / 15000)})`;
            ctx.lineWidth = 1; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener("resize", resize);
    resize(); tick();
  })();

  /* ================================================================
     ANIMATION DU PRÉNOM (sur le mot entier — simple et sans artefact)
     ================================================================ */
  function animateHeroName() {
    // Animation gérée entièrement en CSS (classe .hero-name sur le mot entier).
    // Aucune manipulation du texte : pas de découpage, donc pas de superposition.
    // Rien à faire ici — fonction conservée pour la lisibilité de l'init.
  }

  /* ================================================================
     INITIALISATION
     ================================================================ */
  fillPortrait(document.getElementById("hero-portrait"), true);
  applyStaticI18n();
  buildMenus();
  renderSections();
  updateLangButtons();
  animateHeroName();
  onScroll();
})();
