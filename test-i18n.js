/*
 * test-i18n.js — Teste le moteur de langue en simulant un DOM minimal.
 * Vérifie que le changement FR -> DE -> EN met réellement à jour :
 *  nav, hero (rôle/accroche), sections rendues, libellés et liens PDF.
 * Sans dépendance (mini-DOM maison couvrant ce qu'app.js utilise).
 */
"use strict";
const fs = require("fs");
const path = require("path");

/* ---------- Mini-DOM ---------- */
class El {
  constructor(tag) {
    this.tagName = (tag || "div").toUpperCase();
    this.children = []; this.attributes = {}; this.dataset = {};
    this.classList = new ClassList(); this.style = new Style();
    this._text = ""; this._html = ""; this.listeners = {};
    this.href = ""; this.parentNode = null;
  }
  set textContent(v) { this._text = String(v); this._html = ""; this.children = []; }
  get textContent() {
    if (this.children.length) return this.children.map((c) => c.textContent).join("");
    return this._text || stripTags(this._html);
  }
  set innerHTML(v) { this._html = String(v); this._text = ""; this.children = []; this._parse(v); }
  get innerHTML() { return this._html; }
  _parse(html) {
    // Récupère les textes des data-i18n et ids pour les requêtes ultérieures
    const re = /id="([^"]+)"/g; let m;
    while ((m = re.exec(html))) registerId(m[1], this);
  }
  appendChild(c) { c.parentNode = this; this.children.push(c); indexEl(c); return c; }
  set className(v) { this.classList.set(v); }
  get className() { return this.classList.value; }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === "id") registerId(v, this);
    if (k.startsWith("data-")) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  getAttribute(k) { return this.attributes[k] != null ? this.attributes[k] : null; }
  addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
  querySelector(sel) { return (this.querySelectorAll(sel)[0]) || null; }
  querySelectorAll(sel) { return queryAll(this, sel); }
  scrollIntoView() {}
  focus() {}
  getBoundingClientRect() { return { top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 }; }
  get firstChild() { return this.children[0]; }
  remove() {}
}
class ClassList {
  constructor() { this.set(""); }
  set(v) { this._s = new Set((v || "").split(/\s+/).filter(Boolean)); }
  add(...c) { c.forEach((x) => this._s.add(x)); }
  remove(...c) { c.forEach((x) => this._s.delete(x)); }
  toggle(c, f) { const on = f === undefined ? !this._s.has(c) : f; on ? this._s.add(c) : this._s.delete(c); return on; }
  contains(c) { return this._s.has(c); }
  get value() { return [...this._s].join(" "); }
}
class Style { constructor() { this.props = {}; } setProperty(k, v) { this.props[k] = v; } removeProperty(k) { delete this.props[k]; } }

function stripTags(h) { return String(h).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim(); }

/* ---------- registre global ---------- */
const byId = {};
const allEls = [];
function registerId(id, elm) { byId[id] = elm; }
function indexEl(elm) { allEls.push(elm); (elm.children || []).forEach(indexEl); }
function queryAll(root, sel) {
  // supporte : "#id a", "[data-i18n]", ".cls", "a[href^='#']", "#x .y"
  const out = [];
  function walk(n) {
    if (matches(n, sel)) out.push(n);
    (n.children || []).forEach(walk);
  }
  // cas combinés simples : prendre le dernier segment
  const seg = sel.trim().split(/\s+/).pop();
  function matches(n, s) {
    s = seg;
    if (s.startsWith("#")) return n.attributes.id === s.slice(1);
    if (s.startsWith(".")) return n.classList.contains(s.slice(1));
    if (s.startsWith("[data-i18n")) return n.attributes["data-i18n"] != null;
    if (s.startsWith("[data-")) return true;
    if (s.startsWith("a")) return n.tagName === "A";
    return n.tagName === s.toUpperCase();
  }
  (root.children || []).forEach(walk);
  if (matches(root, sel)) out.unshift(root);
  return out;
}

/* ---------- document factice ---------- */
const created = [];
const doc = {
  documentElement: Object.assign(new El("html"), { scrollHeight: 2000, clientHeight: 800, scrollTop: 0 }),
  createElement: (t) => { const e = new El(t); created.push(e); return e; },
  getElementById: (id) => byId[id] || null,
  querySelector: (s) => queryAll(rootDoc, s)[0] || null,
  querySelectorAll: (s) => queryAll(rootDoc, s),
  addEventListener: () => {},
};
const rootDoc = new El("body");

/* ---------- pré-crée les éléments présents dans index.html ---------- */
function mk(tag, id, attrs, parent) {
  const e = new El(tag);
  if (id) e.setAttribute("id", id);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  (parent || rootDoc).appendChild(e);
  return e;
}
mk("div", "scroll-progress");
const nav = mk("nav", "main-nav");
const rail = mk("aside", "rail");
const langSwitch = mk("div", "lang-switch");
["fr", "de", "en"].forEach((lg) => {
  const b = new El("button"); b.className = "lang-opt"; b.setAttribute("data-lang", lg); langSwitch.appendChild(b);
});
mk("button", "burger");
mk("p", "hero-role");
mk("p", "hero-tagline");
mk("div", "hero-portrait");
mk("span", null, { "data-i18n": "scrollHint" });
mk("span", "foot-name");
mk("span", null, { "data-i18n": "footNote" });
const sections = mk("div", "sections");

/* ---------- stubs navigateur ---------- */
global.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  requestAnimationFrame: () => {},
  innerWidth: 1280, innerHeight: 800,
  localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = v; } },
};
global.document = doc;
global.localStorage = global.window.localStorage;
global.requestAnimationFrame = () => {};
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };

/* ---------- charge data.js + app.js ---------- */
const dataCode = fs.readFileSync(path.join(__dirname, "js", "data.js"), "utf8");
const appCode = fs.readFileSync(path.join(__dirname, "js", "app.js"), "utf8");
new Function("window", "document", "localStorage", "requestAnimationFrame", "IntersectionObserver",
  dataCode + "\n" + appCode
)(global.window, doc, global.localStorage, global.requestAnimationFrame, global.IntersectionObserver);

/* ---------- helpers de test ---------- */
let pass = 0, fail = 0;
const check = (l, c) => { c ? pass++ : fail++; console.log((c ? "  OK   " : "  FAIL ") + l); };
function deepText(n) {
  let s = (n._html || "") + " " + (n._text || "");
  (n.children || []).forEach((c) => { s += " " + deepText(c); });
  return s;
}
const navText = () => nav.children.map((a) => deepText(a)).join(" | ");
const sectionsText = () => stripTags(sections.children.map(deepText).join(" "));
function clickLang(lg) {
  const btn = langSwitch.children.find((b) => b.attributes["data-lang"] === lg);
  (btn.listeners.click || []).forEach((fn) => fn());
}

console.log("=== Démarrage (défaut FR) ===");
check("Nav en français (Accueil)", /Accueil/.test(navText()));
check("Hero rôle FR", /Apprentie/.test(byId["hero-role"].textContent));
check("Sections contiennent 'Mon profil'", /Mon profil/.test(sectionsText()));
check("Sections contiennent la citation gym FR", /au-delà du tapis/.test(sectionsText()));
check("Note éditoriale FR présente (Qui je suis)", /Qui je suis/.test(sectionsText()));

console.log("\n=== Passage en allemand ===");
clickLang("de");
check("Nav traduite (Start/Ausbildung)", /Start/.test(navText()) && /Ausbildung/.test(navText()));
check("Hero rôle DE", /Lernende Entwicklerin/.test(byId["hero-role"].textContent));
check("Sections : 'Mein Profil'", /Mein Profil/.test(sectionsText()));
check("Sections : championnes -> Waadtländer Meisterinnen", /Waadtl.nder Meisterinnen/.test(sectionsText()));
check("Sections : citation gym DE", /uber die Matte|über die Matte/.test(sectionsText()));
check("Note éditoriale DE présente (Wer ich bin)", /Wer ich bin/.test(sectionsText()));

console.log("\n=== Passage en anglais ===");
clickLang("en");
check("Nav traduite (Home/Education)", /Home/.test(navText()) && /Education/.test(navText()));
check("Hero rôle EN", /Digital Business Developer/.test(byId["hero-role"].textContent));
check("Sections : 'My profile'", /My profile/.test(sectionsText()));
check("Sections : Vaud champions 2026", /Vaud cantonal champions 2026/.test(sectionsText()));
check("Sections : citation gym EN (beyond the mat)", /beyond the mat/.test(sectionsText()));
check("Note éditoriale EN présente (Who I am)", /Who I am/.test(sectionsText()));

console.log("\n=== Retour au français ===");
clickLang("fr");
check("Nav de nouveau FR", /Accueil/.test(navText()));
check("Sections de nouveau FR (Mon profil)", /Mon profil/.test(sectionsText()));
check("Langue persistée dans localStorage", global.localStorage.getItem("cv-lang") === "fr");

console.log(`\nRésultat : ${pass} réussis, ${fail} échoués.`);
process.exit(fail === 0 ? 0 : 1);
