/*
 * test-dom.js — Tests structurels du HTML (sélecteur de langue, PDF, page continue).
 */
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const code = fs.readFileSync(path.join(__dirname, "js", "data.js"), "utf8");
new Function(code + "\n;globalThis.__BASE = CV_BASE;")();
const BASE = globalThis.__BASE;

let pass = 0, fail = 0;
const check = (l, c) => { c ? pass++ : fail++; console.log((c ? "  OK   " : "  FAIL ") + l); };

console.log("=== Structure page continue + sélecteur de langue ===");
check("Section #accueil (hero) présente", /id="accueil"/.test(html));
check("Conteneur unique #sections présent", /id="sections"/.test(html));
check("Pas d'ancienne appli à onglets (#views)", !/id="views"/.test(html));
check("Nom en deux lignes", /hero-name-1">Carolina/.test(html) && /hero-name-2">Dias(&nbsp;| )Mota/.test(html));
check("Police serif Cormorant Garamond", /Cormorant\+Garamond/.test(html));
check("Repères éditoriaux de couverture (N°01)", /hero-corner/.test(html));
check("Trajectoire signature (hero-trace)", /hero-trace/.test(html));

console.log("\n=== Sélecteur de langue FR / DE / EN ===");
check("Conteneur #lang-switch présent", /id="lang-switch"/.test(html));
check("Bouton FR", /data-lang="fr"/.test(html));
check("Bouton DE", /data-lang="de"/.test(html));
check("Bouton EN", /data-lang="en"/.test(html));
check("Indicateur de langue actif", /lang-ind/.test(html));
check("Attributs data-i18n présents", (html.match(/data-i18n=/g) || []).length >= 5);

console.log("\n=== Boutons PDF retirés (demande utilisateur) ===");
check("Plus de bouton PDF dans la barre (#pdf-top absent)", !/id="pdf-top"/.test(html));
check("Plus de carte PDF (#pdf-card absent)", !/id="pdf-card"/.test(html));
check("Aucune classe .btn-pdf dans le HTML", !/btn-pdf/.test(html));
check("Les 3 fichiers PDF restent sur disque (archivés)", ["fr", "de", "en"].every((lg) =>
  fs.existsSync(path.join(__dirname, BASE.pdf[lg]))));

console.log(`\nRésultat : ${pass} réussis, ${fail} échoués.`);
process.exit(fail === 0 ? 0 : 1);
