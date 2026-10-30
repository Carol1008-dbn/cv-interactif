/*
 * check-pdf.js — Vérifie la structure des PDF générés (sans dépendance) :
 * en-tête, trailer, startxref valide, présence des objets Page, et que le
 * texte des rubriques est présent. Usage : node tools/check-pdf.js <fichier>
 */
"use strict";
const fs = require("fs");
const file = process.argv[2];
const buf = fs.readFileSync(file);
const s = buf.toString("latin1");

let pass = 0, fail = 0;
const check = (label, cond) => { cond ? pass++ : fail++; console.log((cond ? "  OK   " : "  FAIL ") + label); };

check("En-tête %PDF-", s.startsWith("%PDF-"));
check("Trailer présent", /trailer\s*<<[\s\S]*\/Root/.test(s));
check("startxref présent", /startxref\s+(\d+)/.test(s));
check("%%EOF final", s.trimEnd().endsWith("%%EOF"));

// startxref pointe sur 'xref'
const m = s.match(/startxref\s+(\d+)/);
if (m) {
  const off = parseInt(m[1], 10);
  check("startxref pointe sur la table xref", s.slice(off, off + 4) === "xref");
}

const pageCount = (s.match(/\/Type \/Page[^s]/g) || []).length;
check("Au moins une page", pageCount >= 1);
const countM = s.match(/\/Count (\d+)/);
check("Count de pages cohérent", countM && parseInt(countM[1], 10) === pageCount);

check("Polices Helvetica/Times déclarées", /Helvetica/.test(s) && /Times-Bold/.test(s));
check("Contenu texte présent (Tj)", /Tj/.test(s));

console.log(`\n${file} -> ${pass} OK, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
