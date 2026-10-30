# Digital Identity — CV interactif cinématographique (multilingue)

CV interactif de **Carolina Dias Mota**, apprentie développeuse de business numérique.
Expérience **en page continue** : on parcourt tout le CV en faisant défiler l'écran.
Composition cinématographique sombre et élégante — grand nom en typographie serif
(Cormorant Garamond), portrait mis en valeur à droite, halos magenta, animations fluides,
et téléchargement du CV classique en PDF.

Le CV est **disponible en trois langues** : français (par défaut), allemand et anglais.
Un sélecteur **FR / DE / EN** dans la barre supérieure change tout le contenu
instantanément, sans rechargement, et mémorise le choix du visiteur.

La barre supérieure et le rail latéral servent de **sommaire** : ils font défiler la page
jusqu'à la bonne rubrique. Un scroll-spy indique la section visible et une barre de
progression suit le défilement.

Projet **100 % indépendant** : HTML, CSS et JavaScript natifs, aucune dépendance de build.
Les polices Google Fonts sont chargées en ligne avec un repli local (Georgia / système) si
la connexion échoue. Aucun autre projet du dossier de travail n'a été modifié.

## Structure

```
CV-Interactif/
├── index.html                # Page continue (hero + sommaire + sélecteur de langue)
├── css/
│   └── style.css             # Direction artistique cinématographique
├── js/
│   ├── data.js               # Données stables (CV_BASE) + traductions (CV_I18N : FR/DE/EN)
│   └── app.js                # Rendu, moteur i18n, scroll-spy, révélations, fond animé
├── documents/
│   ├── CV-Carolina-Dias-Mota.pdf      # CV PDF officiel (source Canva) — FR
│   ├── CV-Carolina-Dias-Mota-DE.pdf   # CV PDF allemand (généré, texte sélectionnable)
│   └── CV-Carolina-Dias-Mota-EN.pdf   # CV PDF anglais (généré, texte sélectionnable)
├── assets/images/            # Emplacement pour une éventuelle photo de profil
├── tools/
│   ├── make-pdf.js           # Génère les PDF DE et EN (node tools/make-pdf.js)
│   └── check-pdf.js          # Valide la structure d'un PDF
├── serve.js                  # Serveur statique local (node serve.js)
├── test-data.js              # Tests de fidélité + complétude des 3 langues
├── test-dom.js               # Tests structurels (sélecteur de langue, PDF)
└── test-i18n.js              # Test fonctionnel du changement de langue
```

## Lancer le projet

Ouvrez `index.html` dans un navigateur, ou servez le dossier localement :

```powershell
# depuis le dossier CV-Interactif (Node est fourni dans Test-CarlaSport-Playwright)
node serve.js
# puis http://localhost:8000
```

## Multilingue (FR / DE / EN)

- Les textes sont centralisés dans `js/data.js` : `CV_BASE` (données stables : nom,
  coordonnées, dates, outils, chemins PDF) et `CV_I18N` (traductions par langue).
- Le sélecteur de langue est utilisable au clavier (flèches gauche/droite) et le
  choix est mémorisé via `localStorage` (défaut : français).
- Les noms officiels (Swisscom, SwissTech Convention Center, VG222, LIFT, FSG Lucens…)
  sont conservés dans les trois langues.

## PDF

- **FR** : le CV source officiel (Canva), inchangé.
- **DE / EN** : de vrais PDF A4, texte sélectionnable, générés à partir des mêmes
  données via `tools/make-pdf.js`. Pour les régénérer : `node tools/make-pdf.js`.
- Le bouton de la barre et celui du profil téléchargent la version correspondant à
  la langue active.

## Photo professionnelle

Aucune photo de profil dédiée et fiable n'a été trouvée dans l'environnement.
Un **emplacement portrait élégant** (halo magenta, cadre arrondi, initiales en serif)
est affiché — **aucun visage externe n'est utilisé**.

Pour utiliser votre vraie photo :
1. Déposez l'image dans `assets/images/` (ex. `profil.jpg`).
2. Dans `js/data.js`, dans `CV_BASE.profil`, remplacez `photo: null` par
   `photo: "assets/images/profil.jpg"`.

Le portrait du hero et celui de la section Profil se rempliront automatiquement.

## Source des données

Toutes les informations proviennent de `CV/CV Carol.pdf`. Rien n'a été inventé.
Les sections sans données ne sont pas affichées. Les niveaux de langue (Anglais B2,
Allemand B1, Portugais/Français langue maternelle) sont ceux du CV source.
