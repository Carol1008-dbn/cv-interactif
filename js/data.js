/*
 * data.js — Source de vérité du CV interactif (multilingue FR / DE / EN).
 *
 * Toutes les informations proviennent du CV source : CV/CV Carol.pdf
 * (Carolina Dias Mota, créé le 29/10/2026). Rien n'a été inventé.
 *
 * Organisation :
 *  - CV_BASE   : données non traduisibles (nom, coordonnées, dates, outils, PDF).
 *  - CV_I18N   : textes traduits par langue. Structure identique pour FR / DE / EN.
 *  - Les entrées des listes sont reliées par un identifiant stable (id).
 *
 * Noms officiels (établissements, diplômes, organisations, compétitions) :
 * conservés tels quels dans les trois langues ; une explication traduite est
 * ajoutée seulement quand elle améliore la compréhension.
 */

/* ------------------------------------------------------------------ */
/* Données stables, indépendantes de la langue                         */
/* ------------------------------------------------------------------ */
const CV_BASE = {
  profil: {
    prenom: "Carolina",
    nom: "Dias Mota",
    // Photos fournies par l'utilisatrice (copiées proprement dans assets/images/).
    // photoHero : image d'accueil (Titre.jpg) ; photo : portrait de la section Profil.
    photoHero: "assets/images/titre.jpg",
    photo: "assets/images/profil.jpg",
    initiales: "CDM",
  },

  contact: {
    telephone: "079 324 78 37",
    email: "Carolina.DiasMota1@swisscom.com",
    // Adresse volontairement non publiée (demande utilisateur).
  },

  // Niveaux exacts du CV. Le nom de la langue et le libellé du niveau
  // sont traduits dans CV_I18N ; "code" relie les deux.
  langues: [
    { code: "pt", mother: true, flag: "🇵🇹" },
    { code: "fr", mother: true, flag: "🇫🇷" },
    { code: "en", level: "B2", flag: "🇬🇧" },
    { code: "de", level: "B1", flag: "🇩🇪" },
  ],

  // Expériences : dates/lieux/outils stables ; textes dans CV_I18N par id.
  experiences: [
    { id: "optima", lieu: "Lausanne", periode: "optima", outils: ["Kiro", "Unique AI", "n8n"] },
    { id: "firststeps", lieu: "Lausanne", periode: "firststeps", outils: [] },
    { id: "swisstech", lieu: "Ecublens", periode: "swisstech", outils: [] },
    { id: "fsg", lieu: "FSG Lucens", periode: null, outils: [], feature: "trophy" },
    { id: "gym", lieu: "Lausanne Amis-Gymnastes", periode: null, outils: [], feature: "editorial" },
  ],

  // Formations : année stable ; intitulé dans CV_I18N par id.
  formations: [
    { id: "ecg", annee: "2024 – 2026" },
    { id: "rac1", annee: "2024" },
    { id: "vg222", annee: "2023" },
    { id: "lift", annee: "2023" },
  ],

  // Compétences : clés stables ; nom/description traduits par id.
  competences: {
    techniques: ["word", "powerpoint", "excel", "outlook", "teams", "kiro", "uniqueai", "n8n"],
    personnelles: ["organisation", "accueil", "admin", "feedback", "apprentissage"],
  },

  // PDF réels existants par langue (voir vérification/génération).
  pdf: {
    fr: "documents/CV-Carolina-Dias-Mota.pdf",
    de: "documents/CV-Carolina-Dias-Mota-DE.pdf",
    en: "documents/CV-Carolina-Dias-Mota-EN.pdf",
  },
};

/* ------------------------------------------------------------------ */
/* Traductions                                                         */
/* ------------------------------------------------------------------ */
const CV_I18N = {
  /* ===================== FRANÇAIS ===================== */
  fr: {
    htmlLang: "fr",
    ui: {
      hello: "Bonjour,",
      iam: "je suis",
      role: "Apprentie Développeuse de Business Numérique",
      tagline: "Sérieuse et organisée, je construis mon parcours dans le numérique et l'intelligence artificielle.",
      explore: "EXPLORER MON PROFIL",
      scrollHint: "DÉFILER POUR DÉCOUVRIR",
      coverIssue: "DIGITAL IDENTITY — N°01",
      portraitTag: "PORTRAIT",
      pdfShort: "CV PDF",
      pdfCardKicker: "MON CV",
      pdfCardTitle: "Télécharger mon CV PDF",
      pdfCardMeta: "Version classique · A4",
      langLabel: "Langue",
      railFoot: "Des projets aujourd'hui,<br>des opportunités demain.",
      footNote: "« Chaque compétence est une opportunité »",
      contactLead: "Discutons de mon parcours.",
      contactThanks: "Merci pour votre temps.",
      labelEmail: "E-mail",
      labelPhone: "Téléphone",
      skillsTech: "Techniques & outils",
      skillsPerso: "Personnelles",
      pdfBtn: "Télécharger mon CV",
      heroQuote: "« Les grands projets commencent toujours par une grande curiosité. »",
      profilQuote: "« Chaque défi est une opportunité d'apprendre et de grandir. »",
      expAside: "Des idées aux solutions",
      langAside: "Trois langues, une même envie : communiquer et découvrir le monde.",
      langFootnote: "« La langue est une forme de liberté. »",
      levelLabel: "NIVEAU",
      nativeShort: "Natif",
      langDesc: {
        pt: "Langue maternelle, parlée en famille et au quotidien.",
        fr: "Langue maternelle, utilisée dans la vie personnelle et professionnelle.",
        en: "Bon niveau, à l'oral comme à l'écrit, en contexte professionnel et personnel.",
        de: "Bon niveau, acquis à travers ma formation et mes expériences.",
      },
      nav: {
        accueil: "Accueil", profil: "Profil", formation: "Formation",
        experiences: "Expériences", competences: "Compétences",
        langues: "Langues", contact: "Contact",
      },
      sections: {
        profil: "Mon profil", formation: "Formation", experiences: "Expériences",
        competences: "Compétences", langues: "Langues",
        contact: "Me contacter",
      },
      notes: {
        profil: "Qui je suis",
        formation: "Mon parcours",
        experiences: "Sur le terrain",
        competences: "Mes outils",
        langues: "Quatre voix",
        contact: "À bientôt",
      },
      langIntro: "Quatre langues qui ouvrent autant de portes.",
      mother: "Langue maternelle",
      valuesTitle: "Ce que la gymnastique m'a transmis",
      values: ["Rigueur", "Persévérance", "Esprit d'équipe", "Gestion de la pression"],
      trophyLabel: "DISTINCTION",
      trophyTitle: "Championnes vaudoises 2026",
      trophySub: "Catégorie jeunesse · en équipe",
    },
    presentation:
      "Sérieuse et organisée, j'ai déjà acquis de l'expérience dans l'accueil de la clientèle, le travail administratif et le contact client. Je souhaite évoluer dans un environnement professionnel où je peux apprendre et évoluer.",
    periodes: {
      optima: "Août 2026 – janvier 2027",
      firststeps: "3 – 14 août 2026",
      swisstech: "16 – 20 février 2026",
    },
    langNames: { pt: "Portugais", fr: "Français", en: "Anglais", de: "Allemand" },
    expTypes: {
      optima: "Apprentissage", firststeps: "Apprentissage", swisstech: "Stage",
      fsg: "Engagement associatif", gym: "Parcours sportif",
    },
    expTitles: {
      optima: "Swisscom — Projet Optima",
      firststeps: "Swisscom — FirstSteps",
      swisstech: "SwissTech Convention Center",
      fsg: "Aide-monitrice en gymnastique",
      gym: "Gymnaste en individuel",
    },
    expDetails: {
      optima: ["Faire connaissance de l'IA", "Automatisation et réalisation d'un chatbot en équipe pour l'équipe B2B"],
      firststeps: ["Mise en place et utilisation de l'infrastructure informatique", "Maîtrise des modalités et méthodes de formation", "Capacité à donner et recevoir des feedbacks constructifs"],
      swisstech: ["Observation dans plusieurs secteurs : marketing, gestion de projet, SwissTech Hotel, accueil"],
    },
    // Expérience FSG Lucens — mise en forme éditoriale (paragraphes + points)
    fsg: {
      paragraphs: [
        "J'accompagne les jeunes gymnastes dans leur apprentissage en contribuant à l'encadrement des cours et à la préparation des tests. Cette expérience me permet de transmettre mes connaissances, de soutenir leur progression et de développer mes compétences pédagogiques.",
        "Chaque année, je participe à des cours de perfectionnement afin de mieux préparer les jeunes à leurs tests.",
      ],
      highlights: [
        "Encadrement des cours et accompagnement des jeunes gymnastes",
        "Transmission des connaissances et développement pédagogique",
        "Cours de perfectionnement suivis chaque année",
      ],
      achievement: "Grâce au travail de toute l'équipe, nous avons obtenu le titre de championnes vaudoises 2026 en catégorie jeunesse.",
    },
    // Expérience gymnastique individuelle — composition immersive
    gym: {
      paragraphs: [
        "Je pratique la gymnastique depuis toute petite. J'ai d'abord évolué en groupe avant de poursuivre mon parcours en individuel.",
        "Au fil des années, la gymnastique m'a appris bien plus que des mouvements techniques. Elle m'a transmis des valeurs essentielles que j'applique aussi dans ma vie quotidienne : la rigueur, la persévérance, l'esprit d'équipe et la capacité à gérer la pression.",
        "Cette discipline m'a appris à travailler régulièrement, à rester concentrée sur mes objectifs et à continuer à progresser même lorsque les résultats demandent du temps.",
      ],
      quote: "La régularité et la précision qu'exige ce sport ont construit ma façon de travailler, bien au-delà du tapis.",
    },
    formTitles: {
      ecg: "École de culture générale, option santé",
      rac1: "Certificat de fin d'études secondaires RAC1 VG222",
      vg222: "Certificat de fin d'études secondaires VG222",
      lift: "Diplôme de participation au projet LIFT",
    },
    skills: {
      word: ["Word", "Traitement de texte et documents professionnels."],
      powerpoint: ["PowerPoint", "Création de présentations."],
      excel: ["Excel", "Tableaux et suivi de données."],
      outlook: ["Outlook", "Gestion de la messagerie professionnelle."],
      teams: ["Teams", "Collaboration et communication d'équipe."],
      kiro: ["Kiro", "Environnement de développement assisté par IA."],
      uniqueai: ["Unique AI", "Outil d'intelligence artificielle."],
      n8n: ["n8n", "Automatisation de flux de travail."],
      organisation: ["Sens de l'organisation", "Sérieuse et organisée dans mon travail."],
      accueil: ["Accueil de la clientèle", "Expérience de l'accueil et du contact client."],
      admin: ["Travail administratif", "Expérience du travail administratif."],
      feedback: ["Feedback constructif", "Capacité à donner et recevoir des feedbacks constructifs."],
      apprentissage: ["Esprit d'apprentissage", "Volonté d'apprendre et d'évoluer."],
    },
  },

  /* ===================== DEUTSCH ===================== */
  de: {
    htmlLang: "de",
    ui: {
      hello: "Hallo,",
      iam: "ich bin",
      role: "Lernende Entwicklerin digitales Business",
      tagline: "Zuverlässig und organisiert, baue ich meinen Weg im digitalen Bereich und in der künstlichen Intelligenz auf.",
      explore: "MEIN PROFIL ENTDECKEN",
      scrollHint: "ZUM ENTDECKEN SCROLLEN",
      coverIssue: "DIGITAL IDENTITY — NR. 01",
      portraitTag: "PORTRÄT",
      pdfShort: "PDF",
      pdfCardKicker: "MEIN CV",
      pdfCardTitle: "Lebenslauf als PDF herunterladen",
      pdfCardMeta: "Klassische Version · A4",
      langLabel: "Sprache",
      railFoot: "Projekte heute,<br>Chancen morgen.",
      footNote: "« Jede Kompetenz ist eine Chance »",
      contactLead: "Sprechen wir über meinen Werdegang.",
      contactThanks: "Danke für Ihre Zeit.",
      labelEmail: "E-Mail",
      labelPhone: "Telefon",
      skillsTech: "Technik & Werkzeuge",
      skillsPerso: "Persönlich",
      pdfBtn: "Lebenslauf herunterladen",
      heroQuote: "« Grosse Projekte beginnen immer mit grosser Neugier. »",
      profilQuote: "« Jede Herausforderung ist eine Chance, zu lernen und zu wachsen. »",
      expAside: "Von Ideen zu Lösungen",
      langAside: "Drei Sprachen, ein Wunsch: kommunizieren und die Welt entdecken.",
      langFootnote: "« Sprache ist eine Form von Freiheit. »",
      levelLabel: "NIVEAU",
      nativeShort: "Nativ",
      langDesc: {
        pt: "Muttersprache, in der Familie und im Alltag gesprochen.",
        fr: "Muttersprache, im privaten und beruflichen Alltag verwendet.",
        en: "Gutes Niveau, mündlich wie schriftlich, im beruflichen und privaten Kontext.",
        de: "Gutes Niveau, erworben durch meine Ausbildung und meine Erfahrungen.",
      },
      nav: {
        accueil: "Start", profil: "Profil", formation: "Ausbildung",
        experiences: "Erfahrung", competences: "Kompetenzen",
        langues: "Sprachen", contact: "Kontakt",
      },
      sections: {
        profil: "Mein Profil", formation: "Ausbildung", experiences: "Erfahrung",
        competences: "Kompetenzen", langues: "Sprachen",
        contact: "Kontakt aufnehmen",
      },
      notes: {
        profil: "Wer ich bin",
        formation: "Mein Werdegang",
        experiences: "In der Praxis",
        competences: "Meine Werkzeuge",
        langues: "Vier Stimmen",
        contact: "Bis bald",
      },
      langIntro: "Vier Sprachen, die ebenso viele Türen öffnen.",
      mother: "Muttersprache",
      valuesTitle: "Was mir das Turnen vermittelt hat",
      values: ["Sorgfalt", "Ausdauer", "Teamgeist", "Umgang mit Druck"],
      trophyLabel: "AUSZEICHNUNG",
      trophyTitle: "Waadtländer Meisterinnen 2026",
      trophySub: "Kategorie Jugend · im Team",
    },
    presentation:
      "Zuverlässig und organisiert, habe ich bereits Erfahrung im Kundenempfang, in der Administration und im Kundenkontakt gesammelt. Ich möchte mich in einem beruflichen Umfeld weiterentwickeln, in dem ich lernen und wachsen kann.",
    periodes: {
      optima: "August 2026 – Januar 2027",
      firststeps: "3. – 14. August 2026",
      swisstech: "16. – 20. Februar 2026",
    },
    langNames: { pt: "Portugiesisch", fr: "Französisch", en: "Englisch", de: "Deutsch" },
    expTypes: {
      optima: "Lehre", firststeps: "Lehre", swisstech: "Praktikum",
      fsg: "Ehrenamtliches Engagement", gym: "Sportlicher Werdegang",
    },
    expTitles: {
      optima: "Swisscom — Projet Optima",
      firststeps: "Swisscom — FirstSteps",
      swisstech: "SwissTech Convention Center",
      fsg: "Hilfsleiterin im Turnen",
      gym: "Turnerin im Einzel",
    },
    expDetails: {
      optima: ["Einblick in die künstliche Intelligenz", "Entwicklung eines Chatbots im Team für das B2B-Team"],
      firststeps: ["Einrichtung und Nutzung der IT-Infrastruktur", "Beherrschung der Ausbildungsmethoden und -formate", "Fähigkeit, konstruktives Feedback zu geben und anzunehmen"],
      swisstech: ["Einblick in mehrere Bereiche: Marketing, Projektmanagement, SwissTech Hotel, Empfang"],
    },
    fsg: {
      paragraphs: [
        "Ich begleite junge Turnerinnen in ihrem Lernprozess, indem ich bei der Leitung der Kurse und der Vorbereitung auf die Tests mithelfe. Diese Erfahrung erlaubt es mir, mein Wissen weiterzugeben, ihren Fortschritt zu unterstützen und meine pädagogischen Fähigkeiten zu entwickeln.",
        "Jedes Jahr besuche ich Weiterbildungskurse, um die Jugendlichen besser auf ihre Tests vorzubereiten.",
      ],
      highlights: [
        "Leitung der Kurse und Begleitung der jungen Turnerinnen",
        "Wissensvermittlung und pädagogische Entwicklung",
        "Jährlich besuchte Weiterbildungskurse",
      ],
      achievement: "Dank der Arbeit des ganzen Teams haben wir den Titel der Waadtländer Meisterinnen 2026 in der Kategorie Jugend gewonnen.",
    },
    gym: {
      paragraphs: [
        "Ich turne seit meiner frühesten Kindheit. Zuerst war ich in der Gruppe aktiv, bevor ich meinen Weg im Einzel fortsetzte.",
        "Über die Jahre hat mir das Turnen weit mehr als technische Bewegungen beigebracht. Es hat mir wesentliche Werte vermittelt, die ich auch im Alltag anwende: Sorgfalt, Ausdauer, Teamgeist und den Umgang mit Druck.",
        "Diese Disziplin hat mich gelehrt, regelmässig zu arbeiten, meine Ziele im Blick zu behalten und weiter Fortschritte zu machen, auch wenn Ergebnisse Zeit brauchen.",
      ],
      quote: "Die Regelmässigkeit und Präzision, die dieser Sport verlangt, haben meine Arbeitsweise geprägt — weit über die Matte hinaus.",
    },
    formTitles: {
      ecg: "École de culture générale (Fachmittelschule), Schwerpunkt Gesundheit",
      rac1: "Abschlusszeugnis der Sekundarstufe RAC1 VG222",
      vg222: "Abschlusszeugnis der Sekundarstufe VG222",
      lift: "Teilnahmediplom am Projekt LIFT",
    },
    skills: {
      word: ["Word", "Textverarbeitung und professionelle Dokumente."],
      powerpoint: ["PowerPoint", "Erstellung von Präsentationen."],
      excel: ["Excel", "Tabellen und Datenverfolgung."],
      outlook: ["Outlook", "Verwaltung der beruflichen E-Mails."],
      teams: ["Teams", "Zusammenarbeit und Kommunikation im Team."],
      kiro: ["Kiro", "KI-gestützte Entwicklungsumgebung."],
      uniqueai: ["Unique AI", "Werkzeug für künstliche Intelligenz."],
      n8n: ["n8n", "Automatisierung von Arbeitsabläufen."],
      organisation: ["Organisationstalent", "Zuverlässig und organisiert in meiner Arbeit."],
      accueil: ["Kundenempfang", "Erfahrung im Empfang und im Kundenkontakt."],
      admin: ["Administrative Arbeit", "Erfahrung in der administrativen Arbeit."],
      feedback: ["Konstruktives Feedback", "Fähigkeit, konstruktives Feedback zu geben und anzunehmen."],
      apprentissage: ["Lernbereitschaft", "Wille zu lernen und sich weiterzuentwickeln."],
    },
  },

  /* ===================== ENGLISH ===================== */
  en: {
    htmlLang: "en",
    ui: {
      hello: "Hello,",
      iam: "I'm",
      role: "Digital Business Developer Apprentice",
      tagline: "Reliable and organised, I'm building my path in digital technology and artificial intelligence.",
      explore: "EXPLORE MY PROFILE",
      scrollHint: "SCROLL TO DISCOVER",
      coverIssue: "DIGITAL IDENTITY — NO. 01",
      portraitTag: "PORTRAIT",
      pdfShort: "CV PDF",
      pdfCardKicker: "MY CV",
      pdfCardTitle: "Download my CV (PDF)",
      pdfCardMeta: "Classic version · A4",
      langLabel: "Language",
      railFoot: "Projects today,<br>opportunities tomorrow.",
      footNote: "“Every skill is an opportunity”",
      contactLead: "Let's talk about my journey.",
      contactThanks: "Thank you for your time.",
      labelEmail: "Email",
      labelPhone: "Phone",
      skillsTech: "Technical & tools",
      skillsPerso: "Personal",
      pdfBtn: "Download my CV",
      heroQuote: "“Great projects always begin with great curiosity.”",
      profilQuote: "“Every challenge is a chance to learn and grow.”",
      expAside: "From ideas to solutions",
      langAside: "Three languages, one wish: to communicate and discover the world.",
      langFootnote: "“Language is a form of freedom.”",
      levelLabel: "LEVEL",
      nativeShort: "Native",
      langDesc: {
        pt: "Native language, spoken with family and in daily life.",
        fr: "Native language, used in personal and professional life.",
        en: "Good level, spoken and written, in professional and personal contexts.",
        de: "Good level, acquired through my studies and experiences.",
      },
      nav: {
        accueil: "Home", profil: "Profile", formation: "Education",
        experiences: "Experience", competences: "Skills",
        langues: "Languages", contact: "Contact",
      },
      sections: {
        profil: "My profile", formation: "Education", experiences: "Experience",
        competences: "Skills", langues: "Languages",
        contact: "Get in touch",
      },
      notes: {
        profil: "Who I am",
        formation: "My path",
        experiences: "In the field",
        competences: "My tools",
        langues: "Four voices",
        contact: "See you soon",
      },
      langIntro: "Four languages that open just as many doors.",
      mother: "Native language",
      valuesTitle: "What gymnastics taught me",
      values: ["Rigour", "Perseverance", "Team spirit", "Handling pressure"],
      trophyLabel: "DISTINCTION",
      trophyTitle: "Vaud Cantonal Champions 2026",
      trophySub: "Youth category · as a team",
    },
    presentation:
      "Reliable and organised, I have already gained experience in customer reception, administrative work and client contact. I'm looking to grow in a professional environment where I can learn and develop.",
    periodes: {
      optima: "August 2026 – January 2027",
      firststeps: "3 – 14 August 2026",
      swisstech: "16 – 20 February 2026",
    },
    langNames: { pt: "Portuguese", fr: "French", en: "English", de: "German" },
    expTypes: {
      optima: "Apprenticeship", firststeps: "Apprenticeship", swisstech: "Internship",
      fsg: "Volunteer involvement", gym: "Sporting journey",
    },
    expTitles: {
      optima: "Swisscom — Projet Optima",
      firststeps: "Swisscom — FirstSteps",
      swisstech: "SwissTech Convention Center",
      fsg: "Assistant gymnastics coach",
      gym: "Individual gymnast",
    },
    expDetails: {
      optima: ["Getting to know AI", "Building a chatbot as a team for the B2B team"],
      firststeps: ["Setting up and using the IT infrastructure", "Mastering training methods and formats", "Ability to give and receive constructive feedback"],
      swisstech: ["Observation across several areas: marketing, project management, SwissTech Hotel, reception"],
    },
    fsg: {
      paragraphs: [
        "I support young gymnasts in their learning by helping to run the classes and prepare them for their tests. This experience lets me pass on my knowledge, support their progress and develop my teaching skills.",
        "Every year I attend advanced training courses to better prepare the youngsters for their tests.",
      ],
      highlights: [
        "Running the classes and supporting young gymnasts",
        "Passing on knowledge and developing teaching skills",
        "Advanced training courses attended every year",
      ],
      achievement: "Thanks to the whole team's work, we won the title of Vaud cantonal champions 2026 in the youth category.",
    },
    gym: {
      paragraphs: [
        "I have practised gymnastics since I was very young. I first trained in a group before continuing my journey as an individual.",
        "Over the years, gymnastics has taught me far more than technical moves. It has passed on essential values that I also apply in everyday life: rigour, perseverance, team spirit and the ability to handle pressure.",
        "This discipline taught me to work consistently, to stay focused on my goals and to keep improving even when results take time.",
      ],
      quote: "The consistency and precision this sport demands have shaped the way I work, far beyond the mat.",
    },
    formTitles: {
      ecg: "École de culture générale (general education school), health option",
      rac1: "Secondary school leaving certificate RAC1 VG222",
      vg222: "Secondary school leaving certificate VG222",
      lift: "Certificate of participation in the LIFT programme",
    },
    skills: {
      word: ["Word", "Word processing and professional documents."],
      powerpoint: ["PowerPoint", "Creating presentations."],
      excel: ["Excel", "Spreadsheets and data tracking."],
      outlook: ["Outlook", "Managing professional email."],
      teams: ["Teams", "Team collaboration and communication."],
      kiro: ["Kiro", "AI-assisted development environment."],
      uniqueai: ["Unique AI", "Artificial intelligence tool."],
      n8n: ["n8n", "Workflow automation."],
      organisation: ["Organisational skills", "Reliable and organised in my work."],
      accueil: ["Customer reception", "Experience in reception and client contact."],
      admin: ["Administrative work", "Experience in administrative work."],
      feedback: ["Constructive feedback", "Able to give and receive constructive feedback."],
      apprentissage: ["Eagerness to learn", "Willingness to learn and grow."],
    },
  },
};
