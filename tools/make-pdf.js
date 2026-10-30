/*
 * make-pdf.js — Génère de vrais PDF A4 (texte sélectionnable) pour les
 * versions DE et EN du CV, sans aucune dépendance externe.
 *
 * Le PDF français reste le CV source officiel (Canva) :
 *   documents/CV-Carolina-Dias-Mota.pdf
 * Ce script ne le modifie pas.
 *
 * Usage : node tools/make-pdf.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

/* --------- Encodage WinAnsi (Latin-1) pour les accents --------- */
function toWinAnsi(str) {
  // Les polices standard PDF (Helvetica) utilisent WinAnsiEncoding.
  // On encode en latin1 ; les caractères hors table sont approchés.
  const map = { "–": "-", "—": "-", "’": "'", "‘": "'", "“": '"', "”": '"', "€": "EUR", "•": "-", "·": "-" };
  let out = "";
  for (const ch of str) {
    if (map[ch]) { out += map[ch]; continue; }
    const code = ch.charCodeAt(0);
    out += code <= 0xff ? ch : "?";
  }
  return out;
}
function esc(s) { return toWinAnsi(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

/* --------- Découpe un paragraphe en lignes selon largeur max --------- */
function wrap(text, max) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) { if (line) lines.push(line); line = w; }
    else line = (line ? line + " " : "") + w;
  }
  if (line) lines.push(line);
  return lines;
}

/* --------- Constructeur de PDF minimal multi-pages --------- */
function buildPDF(blocks, meta) {
  // A4 : 595 x 842 pt
  const PW = 595, PH = 842, M = 56;
  const pages = [];       // chaque page : tableau d'ops de contenu
  let ops = [];
  let y = PH - M;
  const links = [];       // {page, rect, uri}
  let pageIdx = 0;

  function newPage() { if (ops.length) pages.push(ops); ops = []; y = PH - M; pageIdx = pages.length; }
  function ensure(space) { if (y - space < M) newPage(); }

  function text(str, size, font, color, indent) {
    ensure(size + 4);
    const x = M + (indent || 0);
    const c = color || [0.15, 0.1, 0.18];
    ops.push(`BT /${font} ${size} Tf ${c[0]} ${c[1]} ${c[2]} rg ${x} ${y} Td (${esc(str)}) Tj ET`);
    y -= size + 4;
    return { x, y: y + size + 4, size };
  }
  function para(str, size, font, color, maxChars, gap, indent) {
    wrap(str, maxChars).forEach((l) => text(l, size, font, color, indent));
    y -= gap || 0;
  }
  function rule() { ensure(14); ops.push(`${0.9} ${0.24} ${0.66} RG 1 w ${M} ${y} m ${PW - M} ${y} l S`); y -= 14; }
  function gap(n) { y -= n; }

  for (const b of blocks) {
    if (b.t === "title") { ensure(30); const r = text(b.v, 26, "F2", [0.1, 0.07, 0.13]); gap(2); }
    else if (b.t === "subtitle") { const r = text(b.v, 12, "F3", [0.62, 0.12, 0.42]); gap(4); }
    else if (b.t === "h") { gap(6); rule(); const r = text(b.v, 13, "F1", [0.1, 0.07, 0.13]); gap(4); }
    else if (b.t === "p") { para(b.v, 10.5, "F3", [0.25, 0.2, 0.28], 95, 4, b.indent); }
    else if (b.t === "li") { ensure(14); const bx = M + 6; ops.push(`BT /F3 10.5 Tf 0.9 0.24 0.66 rg ${bx} ${y} Td (-) Tj ET`); para(b.v, 10.5, "F3", [0.25, 0.2, 0.28], 90, 2, 16); }
    else if (b.t === "kv") { ensure(14); ops.push(`BT /F1 10.5 Tf 0.1 0.07 0.13 rg ${M} ${y} Td (${esc(b.k)}) Tj ET`);
      const link = b.link;
      const vx = M + 95;
      ops.push(`BT /F3 10.5 Tf 0.25 0.2 0.28 rg ${vx} ${y} Td (${esc(b.v)}) Tj ET`);
      if (link) links.push({ page: pageIdx, rect: [vx, y - 2, vx + b.v.length * 5.5, y + 10], uri: link });
      y -= 15;
    }
    else if (b.t === "gap") { gap(b.v); }
  }
  if (ops.length) pages.push(ops);

  /* ---- Sérialisation PDF ---- */
  const objs = [];
  const ref = (n) => `${n} 0 R`;
  function add(s) { objs.push(s); return objs.length; } // 1-based obj number

  // placeholders pour fonts
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const fontSerif = add("<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>");
  const fontReg = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");

  const pageObjNums = [];
  const contentObjNums = [];
  const annotObjNums = [];

  // Catalog + Pages à remplir après
  const catalogNum = add("PLACEHOLDER_CATALOG");
  const pagesNum = add("PLACEHOLDER_PAGES");

  pages.forEach((pageOps, i) => {
    const content = pageOps.join("\n");
    const stream = `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`;
    const cNum = add(stream);
    contentObjNums.push(cNum);

    // annotations (liens) de cette page
    const pageLinks = links.filter((l) => l.page === i);
    const annots = pageLinks.map((l) => {
      const [x0, y0, x1, y1] = l.rect;
      const a = add(`<< /Type /Annot /Subtype /Link /Rect [${x0} ${y0} ${x1} ${y1}] /Border [0 0 0] /A << /S /URI /URI (${esc(l.uri)}) >> >>`);
      return a;
    });
    annotObjNums.push(annots);

    const annotStr = annots.length ? ` /Annots [${annots.map(ref).join(" ")}]` : "";
    const pNum = add(`<< /Type /Page /Parent ${ref(pagesNum)} /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 ${ref(fontBold)} /F2 ${ref(fontSerif)} /F3 ${ref(fontReg)} >> >> /Contents ${ref(cNum)}${annotStr} >>`);
    pageObjNums.push(pNum);
  });

  objs[catalogNum - 1] = `<< /Type /Catalog /Pages ${ref(pagesNum)} /Lang (${meta.lang}) >>`;
  objs[pagesNum - 1] = `<< /Type /Pages /Kids [${pageObjNums.map(ref).join(" ")}] /Count ${pageObjNums.length} >>`;

  // Infos document
  const infoNum = add(`<< /Title (${esc(meta.title)}) /Author (${esc(meta.author)}) /Creator (Kiro CV Generator) >>`);

  // Assemblage avec table xref
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];
  objs.forEach((body, idx) => {
    offsets[idx] = Buffer.byteLength(pdf, "latin1");
    pdf += `${idx + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => { pdf += String(off).padStart(10, "0") + " 00000 n \n"; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root ${ref(catalogNum)} /Info ${ref(infoNum)} >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
}

/* --------- Contenu des CV par langue (repris de data.js) --------- */
function buildBlocks(L) {
  const b = [];
  b.push({ t: "title", v: `${L.prenom} ${L.nom}` });
  b.push({ t: "subtitle", v: L.role });
  b.push({ t: "gap", v: 4 });
  b.push({ t: "kv", k: L.lbl.email, v: L.email, link: "mailto:" + L.email });
  b.push({ t: "kv", k: L.lbl.phone, v: L.phone });

  b.push({ t: "h", v: L.sec.profile });
  b.push({ t: "p", v: L.presentation });

  b.push({ t: "h", v: L.sec.experience });
  L.experiences.forEach((e) => {
    b.push({ t: "kv", k: "", v: `${e.title}${e.meta ? "  (" + e.meta + ")" : ""}` });
    e.lines.forEach((ln) => b.push({ t: "li", v: ln }));
    b.push({ t: "gap", v: 4 });
  });

  b.push({ t: "h", v: L.sec.education });
  L.education.forEach((e) => b.push({ t: "li", v: `${e.year} — ${e.title}` }));

  b.push({ t: "h", v: L.sec.skills });
  b.push({ t: "p", v: L.techTitle + " : " + L.tech.join(", ") });
  b.push({ t: "p", v: L.persoTitle + " : " + L.perso.join(", ") });

  b.push({ t: "h", v: L.sec.languages });
  L.languages.forEach((l) => b.push({ t: "li", v: `${l.name} — ${l.level}` }));

  return b;
}

function main() {
  const docsDir = path.join(__dirname, "..", "documents");

  const DE = {
    lang: "de", title: "Lebenslauf — Carolina Dias Mota", author: "Carolina Dias Mota",
    prenom: "Carolina", nom: "Dias Mota", role: "Lernende Entwicklerin digitales Business",
    email: "Carolina.DiasMota1@swisscom.com", phone: "079 324 78 37",
    lbl: { email: "E-Mail", phone: "Telefon" },
    sec: { profile: "Profil", experience: "Erfahrung", education: "Ausbildung", skills: "Kompetenzen", languages: "Sprachen" },
    presentation: "Zuverlassig und organisiert, habe ich bereits Erfahrung im Kundenempfang, in der Administration und im Kundenkontakt gesammelt. Ich mochte mich in einem beruflichen Umfeld weiterentwickeln, in dem ich lernen und wachsen kann.",
    experiences: [
      { title: "Swisscom — Projet Optima", meta: "Lausanne, August 2026 – Januar 2027", lines: ["Einblick in die kunstliche Intelligenz", "Entwicklung eines Chatbots im Team fur das B2B-Team"] },
      { title: "Swisscom — FirstSteps", meta: "Lausanne, 3.–14. August 2026", lines: ["Einrichtung und Nutzung der IT-Infrastruktur", "Beherrschung der Ausbildungsmethoden und -formate", "Konstruktives Feedback geben und annehmen"] },
      { title: "SwissTech Convention Center", meta: "Ecublens, 16.–20. Februar 2026", lines: ["Einblick in mehrere Bereiche: Marketing, Projektmanagement, SwissTech Hotel, Empfang"] },
      { title: "Hilfsleiterin im Turnen — FSG Lucens", meta: "", lines: ["Begleitung junger Turnerinnen und Mithilfe bei Kursen und Testvorbereitung", "Jahrliche Weiterbildungskurse", "Waadtlander Meisterinnen 2026, Kategorie Jugend, im Team"] },
      { title: "Turnerin im Einzel — Lausanne Amis-Gymnastes", meta: "", lines: ["Werte: Sorgfalt, Ausdauer, Teamgeist und Umgang mit Druck", "Regelmassigkeit und Prazision pragen meine Arbeitsweise, weit uber die Matte hinaus"] },
    ],
    education: [
      { year: "2024-2026", title: "Ecole de culture generale (Fachmittelschule), Schwerpunkt Gesundheit" },
      { year: "2024", title: "Abschlusszeugnis der Sekundarstufe RAC1 VG222" },
      { year: "2023", title: "Abschlusszeugnis der Sekundarstufe VG222" },
      { year: "2023", title: "Teilnahmediplom am Projekt LIFT" },
    ],
    techTitle: "Technik & Werkzeuge", tech: ["Word", "PowerPoint", "Excel", "Outlook", "Teams", "Kiro", "Unique AI", "n8n"],
    persoTitle: "Personlich", perso: ["Organisationstalent", "Kundenempfang", "Administrative Arbeit", "Konstruktives Feedback", "Lernbereitschaft"],
    languages: [ { name: "Portugiesisch", level: "Muttersprache" }, { name: "Franzosisch", level: "Muttersprache" }, { name: "Englisch", level: "B2" }, { name: "Deutsch", level: "B1" } ],
  };

  const EN = {
    lang: "en", title: "Curriculum Vitae — Carolina Dias Mota", author: "Carolina Dias Mota",
    prenom: "Carolina", nom: "Dias Mota", role: "Digital Business Developer Apprentice",
    email: "Carolina.DiasMota1@swisscom.com", phone: "079 324 78 37",
    lbl: { email: "Email", phone: "Phone" },
    sec: { profile: "Profile", experience: "Experience", education: "Education", skills: "Skills", languages: "Languages" },
    presentation: "Reliable and organised, I have already gained experience in customer reception, administrative work and client contact. I am looking to grow in a professional environment where I can learn and develop.",
    experiences: [
      { title: "Swisscom — Projet Optima", meta: "Lausanne, August 2026 – January 2027", lines: ["Getting to know AI", "Building a chatbot as a team for the B2B team"] },
      { title: "Swisscom — FirstSteps", meta: "Lausanne, 3–14 August 2026", lines: ["Setting up and using the IT infrastructure", "Mastering training methods and formats", "Giving and receiving constructive feedback"] },
      { title: "SwissTech Convention Center", meta: "Ecublens, 16–20 February 2026", lines: ["Observation across several areas: marketing, project management, SwissTech Hotel, reception"] },
      { title: "Assistant gymnastics coach — FSG Lucens", meta: "", lines: ["Supporting young gymnasts and helping run classes and test preparation", "Advanced training courses attended every year", "Vaud cantonal champions 2026, youth category, as a team"] },
      { title: "Individual gymnast — Lausanne Amis-Gymnastes", meta: "", lines: ["Values: rigour, perseverance, team spirit and handling pressure", "Consistency and precision have shaped the way I work, far beyond the mat"] },
    ],
    education: [
      { year: "2024-2026", title: "Ecole de culture generale (general education school), health option" },
      { year: "2024", title: "Secondary school leaving certificate RAC1 VG222" },
      { year: "2023", title: "Secondary school leaving certificate VG222" },
      { year: "2023", title: "Certificate of participation in the LIFT programme" },
    ],
    techTitle: "Technical & tools", tech: ["Word", "PowerPoint", "Excel", "Outlook", "Teams", "Kiro", "Unique AI", "n8n"],
    persoTitle: "Personal", perso: ["Organisational skills", "Customer reception", "Administrative work", "Constructive feedback", "Eagerness to learn"],
    languages: [ { name: "Portuguese", level: "Native language" }, { name: "French", level: "Native language" }, { name: "English", level: "B2" }, { name: "German", level: "B1" } ],
  };

  fs.writeFileSync(path.join(docsDir, "CV-Carolina-Dias-Mota-DE.pdf"), buildPDF(buildBlocks(DE), DE));
  fs.writeFileSync(path.join(docsDir, "CV-Carolina-Dias-Mota-EN.pdf"), buildPDF(buildBlocks(EN), EN));
  console.log("PDF DE et EN generes dans documents/");
}

main();
