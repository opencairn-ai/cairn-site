/*
 * Textes français (Canada) d’opencairn.ai, selon les recommandations de l’Office québécois
 * de la langue française (OQLF).
 *
 * Pour modifier :
 *   - Changez uniquement le texte entre les guillemets droits.
 *   - Laissez tels quels les clés (les mots avant chaque deux-points), les guillemets et les virgules.
 *   - Dans le texte, utilisez les guillemets « » et l’apostrophe typographique (’) plutôt qu’un
 *     guillemet droit ("), qui terminerait le texte trop tôt.
 *   - Les espaces avant « : » sont des espaces insécables, pour éviter qu’un deux-points se
 *     retrouve seul en début de ligne.
 *   - Entourez des mots d’*astérisques* pour les surligner en rose (aucun ne l’est pour l’instant).
 *   - {mozilla} et {mila}, dans la ligne du pied de page, indiquent l’emplacement des deux liens.
 *   - Pour prévisualiser, ouvrez public/index.html?lang=fr dans un navigateur, ou lancez `python3 -m http.server -d public 8080`.
 *
 * Les textes anglais se trouvent dans en.js et suivent exactement la même structure.
 */
window.CAIRN_COPY = window.CAIRN_COPY || {};
window.CAIRN_COPY.fr = {
  meta: {
    title: "Cairn : l’architecture de la pile d’inférence d’IA à code source ouvert",
    description: "Une architecture ouverte pour la pile d’inférence d’IA. Des contrats d’interface clairs relient toutes les couches et tous les composants, pour que vous puissiez remplacer n’importe quel composant. L’implémentation de référence utilise les meilleurs composants à code source ouvert. Une collaboration de recherche Mozilla × Mila.",
  },

  header: {
    codename: "codename:",
    languageLabel: "Langue",
    themeToDark: "Passer au thème sombre",
    themeToLight: "Passer au thème clair",
    download: "Télécharger le schéma",
    downloadBusy: "Préparation du schéma…",
    downloadFailed: "Échec du téléchargement. Réessayez.",
    github: "Suivez-nous sur GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    eyebrow: "Avant-goût technique",
    title: "Découvrez la pile d’inférence d’IA à code source ouvert",
    goal: "Notre objectif est de définir des contrats d’interface clairs entre chaque couche et composant de la pile afin que vous puissiez :",
    points: [
      {
        title: "Faire fonctionner tous les composants ensemble",
        text: "Les composants qui respectent les mêmes contrats ne demandent aucun code d’intégration sur mesure.",
      },
      {
        title: "Remplacer n’importe quel composant",
        text: "Tout ce qui respecte le même contrat peut le remplacer. Le reste de la pile ne change pas.",
      },
      {
        title: "Utiliser le meilleur du code source ouvert",
        text: "Nous testons des projets à code source ouvert par rapport à chaque contrat. Notre implémentation de référence utilise le meilleur pour chaque couche.",
      },
    ],
  },

  diagram: {
    label: "Architecture de la pile d’inférence d’IA à code source ouvert",
    hint: "Survolez ou touchez une couche ou un composant pour découvrir son rôle.",
    // Petite étiquette affichée en haut de chaque infobulle.
    kinds: {
      boundary: "Frontière",
      layer: "Couche",
      crossCutting: "Couche transversale",
      component: "Composant",
    },
  },

  // Le schéma d’architecture, dans l’ordre de lecture : de haut en bas, de gauche à droite.
  //   name :    le libellé affiché dans la case
  //   detail :  une petite ligne facultative sous le libellé (aucune n’est utilisée)
  //   tooltip : la courte description qui s’affiche au survol, au toucher ou au clavier
  stack: {
    local: {
      name: "Local",
      tooltip: "Au-dessus de la ligne : les applications et les SDK. Ils s’exécutent sur les appareils des utilisateurs ou dans vos produits, et se connectent à la pile par son API.",
    },
    server: {
      name: "Serveur",
      tooltip: "Sous la ligne : la pile. Elle s’exécute sur une infrastructure que votre organisation contrôle : en interne, chez un partenaire ou chez un fournisseur de calcul.",
    },

    application: {
      name: "Application",
      tooltip: "Les outils de travail quotidien des utilisateurs. Les équipes conservent leurs assistants et leurs agents actuels, et les connectent à la pile.",
      chatUi: {
        name: "Interface conversationnelle",
        tooltip: "Une interface de conversation pour les questions, la rédaction et l’analyse, avec les réponses des modèles de votre organisation.",
      },
      codingHarness: {
        name: "Harnais de programmation",
        tooltip: "Un agent de programmation qui lit, écrit et exécute du code avec les développeurs. Il utilise les modèles et les outils de la pile.",
      },
      knowledgeWorkHarness: {
        name: "Harnais de travail",
        tooltip: "Des agents de recherche, de rédaction et d’analyse. Ils utilisent les documents et les outils de votre organisation.",
      },
    },

    sdk: {
      name: "SDK",
      tooltip: "Des trousses de développement logiciel (SDK) pour créer vos propres applications et agents sur la pile.",
      llmSdk: {
        name: "SDK pour grands modèles de langage",
        tooltip: "Une bibliothèque cliente qui appelle les modèles par l’API de la pile. Votre code ne change pas quand le moteur ou le matériel change.",
      },
      agentSdk: {
        name: "SDK pour agents",
        tooltip: "Un cadre d'applications pour créer des agents qui planifient, appellent des outils, utilisent la mémoire et réalisent des tâches en plusieurs étapes sur la pile.",
      },
    },

    persistence: {
      name: "Persistance",
      tooltip: "Enregistre les documents de votre organisation pour la recherche, et la mémoire à long terme de vos agents.",
      semanticSearch: {
        name: "Système de recherche sémantique",
        tooltip: "Ingère et indexe vos documents. Il trouve le contenu pertinent par le sens et par mot-clé, pour que les modèles répondent à partir de vos documents.",
      },
      agentMemory: {
        name: "Système de mémoire des agents",
        tooltip: "Une mémoire centrale pour les agents. Elle conserve ce qu’un utilisateur ou une équipe a appris, décidé ou préfère, d’une session et d’un appareil à l’autre.",
      },
    },

    agentRuntime: {
      name: "Exécution des agents",
      tooltip: "Des environnements isolés qui exécutent le code et les outils des agents.",
      localToolServer: {
        name: "Serveur d’outils local",
        tooltip: "Exécute des outils à côté de l’agent, dans l’environnement d’exécution : par exemple un moteur d’exécution local ou un navigateur Web.",
      },
      sandbox: {
        name: "Bac à sable",
        tooltip: "Un environnement isolé où les agents exécutent du code et des commandes système pour accomplir leurs tâches.",
      },
    },

    modelAccess: {
      name: "Accès aux modèles",
      tooltip: "Relie les applications et les agents aux modèles : une passerelle devant les serveurs de modèles.",
      modelGateway: {
        name: "Passerelle de modèles",
        tooltip: "Le point d’entrée unique vers tous les modèles. Il oriente les requêtes, met les réponses en cache, applique les quotas et offre une seule API pour tous les fournisseurs de modèles.",
      },
      modelServer: {
        name: "Serveur de modèles",
        tooltip: "Exécute les modèles sur votre matériel avec un moteur d’inférence, et les sert par une API standard.",
      },
    },

    toolAccess: {
      name: "Accès aux outils",
      tooltip: "Relie les agents aux outils : une passerelle devant les serveurs d’outils.",
      toolGateway: {
        name: "Passerelle d’outils",
        tooltip: "Le point d’entrée unique vers tous les outils. Il regroupe les serveurs d’outils dans un seul catalogue, contrôle qui peut utiliser chaque outil, injecte les identifiants, et démarre ou arrête les serveurs d’outils au besoin.",
      },
      toolServer: {
        name: "Serveur d’outils",
        tooltip: "Héberge les outils que les agents appellent à distance : par exemple des connecteurs vers vos API et vos données, ou la recherche Web.",
      },
    },

    registry: {
      name: "Registre",
      tooltip: "Le catalogue des compétences, invites, modèles et outils approuvés. La pile l’utilise au déploiement et au début de chaque session.",
      skillRegistry: {
        name: "Registre de compétences",
        tooltip: "Des compétences versionnées : des ensembles d’instructions et de ressources qui indiquent aux agents comment réaliser des tâches précises.",
      },
      promptRegistry: {
        name: "Registre d’invites",
        tooltip: "Des invites et des instructions système versionnées et approuvées, partagées entre les équipes.",
      },
      modelRegistry: {
        name: "Registre de modèles",
        tooltip: "Les modèles approuvés, avec leurs versions, leurs sources et leurs réglages de service pour votre matériel.",
      },
      toolRegistry: {
        name: "Registre d’outils",
        tooltip: "Les serveurs d’outils approuvés que les agents peuvent trouver et utiliser.",
      },
    },

    security: {
      name: "Sécurité",
      tooltip: "S’applique à toutes les couches. Elle contrôle les accès, vérifie les données qui entrent dans les composants et en sortent, et s’assure que les artefacts des registres sont sûrs.",
      iam: {
        name: "Gestion des identités et des accès",
        tooltip: "Vérifie l’identité des utilisateurs et des agents, et contrôle ce à quoi chacun peut accéder.",
      },
      guardrails: {
        name: "Garde-fous",
        tooltip: "Vérifient les entrées et les sorties des modèles et des agents selon vos politiques. Ils bloquent, caviardent ou signalent le contenu qui enfreint une politique.",
      },
      registryScanners: {
        name: "Analyseurs de registres",
        tooltip: "Analysent les modèles, compétences, invites et outils avant leur entrée dans un registre, pour trouver les artefacts altérés ou vulnérables.",
      },
    },

    observability: {
      name: "Observabilité",
      tooltip: "S’applique à toutes les couches. Elle montre ce que fait la pile, ce qu’elle coûte et comment les agents obtiennent leurs résultats.",
      telemetry: {
        name: "Collecte de télémétrie",
        tooltip: "Collecte en un seul endroit les journaux, les mesures et les traces de tous les composants.",
      },
      costUsage: {
        name: "Analyse des coûts et de l’utilisation",
        tooltip: "Montre l’utilisation des jetons et les coûts par équipe, par modèle et par application, pour planifier la capacité et les budgets.",
      },
      agentTracing: {
        name: "Traçage des agents",
        tooltip: "Enregistre chaque étape de l’exécution d’un agent : chaque appel de modèle, chaque appel d’outil et chaque décision.",
      },
    },

    controlPlane: {
      name: "Plan de contrôle",
      tooltip: "S’applique à toutes les couches. Les opérateurs l’utilisent pour installer, configurer, encadrer et maintenir la pile.",
      adminConsole: {
        name: "Console d’administration",
        tooltip: "L’interface que les opérateurs utilisent pour exploiter la pile chaque jour.",
      },
      deployment: {
        name: "Déploiement et cycle de vie",
        tooltip: "Installe et met à niveau la pile, et gère sa configuration et le cycle de vie des modèles.",
      },
      policyTenancy: {
        name: "Politiques et locataires",
        tooltip: "Fixe les paramètres par défaut de toute l’organisation et isole les équipes ou les locataires. Chacun obtient ses propres modèles, outils, limites et frontières de données.",
      },
      magicModel: {
        name: "Sélecteur matériel-modèle",
        tooltip: "Sélectionne automatiquement le meilleur modèle pour votre matériel, vos cas d’utilisation et vos charges de travail, et ajuste la configuration de service pour la vitesse.",
      },
    },
  },

  footer: {
    collaboration: "Une collaboration de recherche entre {mozilla} et {mila}",
    mozilla: { name: "Mozilla", url: "https://www.mozilla.org/fr/" },
    mila: { name: "Mila", url: "https://mila.quebec/fr" },
  },

  // L’image PNG de l’architecture à télécharger.
  image: {
    fileName: "cairn-architecture-pile-inference",
    site: "opencairn.ai",
  },
};
