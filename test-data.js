/*
 * test-data.js — Vérifie la cohérence des données multilingues (sans framework).
 * Source : CV/CV Carol.pdf. Rien ne doit être inventé.
 */
const fs = require("fs");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "js", "data.js"), "utf8");
new Function(code + "\n;globalThis.__BASE = CV_BASE; globalThis.__I18N = CV_I18N;")();
const BASE = globalThis.__BASE, I18N = globalThis.__I18N;

let pass = 0, fail = 0;
const check = (l, c) => { c ? pass++ : fail++; console.log((c ? "  OK   " : "  FAIL ") + l); };

console.log("=== Données de base (stables) ===");
check("Nom = Carolina Dias Mota", BASE.profil.prenom === "Carolina" && BASE.profil.nom === "Dias Mota");
check("Email intact", BASE.contact.email === "Carolina.DiasMota1@swisscom.com");
check("Téléphone intact", BASE.contact.telephone === "079 324 78 37");
check("4 langues", BASE.langues.length === 4);
check("Anglais B2", BASE.langues.some((l) => l.code === "en" && l.level === "B2"));
check("Allemand B1", BASE.langues.some((l) => l.code === "de" && l.level === "B1"));
check("Portugais + Français = langue maternelle", BASE.langues.filter((l) => l.mother).length === 2);
check("5 expériences", BASE.experiences.length === 5);
check("FSG a le badge trophée", BASE.experiences.some((x) => x.id === "fsg" && x.feature === "trophy"));
check("Gym a la mise en forme éditoriale", BASE.experiences.some((x) => x.id === "gym" && x.feature === "editorial"));
check("4 formations", BASE.formations.length === 4);
check("Projet LIFT présent", BASE.formations.some((f) => f.id === "lift"));
check("École de culture générale (2024-2026) présente", BASE.formations.some((f) => f.id === "ecg" && /2024/.test(f.annee) && /2026/.test(f.annee)));
check("ECG option santé dans les 3 langues", ["fr", "de", "en"].every((lg) => /sant|Gesundheit|health/i.test(I18N[lg].formTitles.ecg)));
check("Outils IA", ["Kiro", "Unique AI", "n8n"].every((o) => BASE.experiences.some((x) => x.outils.includes(o))));
check("3 fichiers PDF référencés (fr/de/en)", BASE.pdf.fr && BASE.pdf.de && BASE.pdf.en);
check("Aucun pourcentage inventé", !/\d+\s*%/.test(JSON.stringify(I18N)));

console.log("\n=== Complétude des 3 langues (FR/DE/EN) ===");
const keysOf = (o) => Object.keys(o).sort().join(",");
["fr", "de", "en"].forEach((lg) => {
  const t = I18N[lg];
  check(`[${lg}] bloc présent`, !!t);
  check(`[${lg}] UI.nav complète (sans certificats)`, keysOf(t.ui.nav) === "accueil,competences,contact,experiences,formation,langues,profil");
  check(`[${lg}] 8 compétences techniques traduites`, BASE.competences.techniques.every((k) => t.skills[k] && t.skills[k][0]));
  check(`[${lg}] 5 compétences perso traduites`, BASE.competences.personnelles.every((k) => t.skills[k] && t.skills[k][0]));
  check(`[${lg}] titres expériences traduits`, BASE.experiences.every((x) => t.expTitles[x.id]));
  check(`[${lg}] FSG : paragraphes + achievement`, t.fsg.paragraphs.length >= 2 && !!t.fsg.achievement);
  check(`[${lg}] Gym : 3 paragraphes + citation`, t.gym.paragraphs.length === 3 && !!t.gym.quote);
  check(`[${lg}] 4 valeurs gym`, t.ui.values.length === 4);
  check(`[${lg}] bouton PDF traduit`, !!t.ui.pdfBtn);
});

console.log("\n=== Contenu spécifique demandé ===");
check("FR mentionne championnes vaudoises 2026", /championnes vaudoises 2026/i.test(I18N.fr.fsg.achievement));
check("FR citation gym présente", /au-delà du tapis/i.test(I18N.fr.gym.quote));
check("DE mentionne Waadtländer Meisterinnen 2026", /Waadtl.nder Meisterinnen 2026/i.test(I18N.de.ui.trophyTitle + I18N.de.fsg.achievement));
check("EN mentions Vaud champions 2026", /Vaud cantonal champions 2026/i.test(I18N.en.fsg.achievement));

console.log("\n=== Confidentialité : adresse retirée ===");
const dump = JSON.stringify(BASE) + JSON.stringify(I18N);
check("Champ adresse absent de CV_BASE.contact", BASE.contact.adresse === undefined);
check("Aucune trace de l'adresse (Perrey / Chesalles)", !/Perrey|Chesalles/i.test(dump));
check("Aucun libellé 'Adresse/Address' résiduel", !/labelAddress/.test(dump));

console.log(`\nRésultat : ${pass} réussis, ${fail} échoués.`);
process.exit(fail === 0 ? 0 : 1);
