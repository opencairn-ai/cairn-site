/*
 * Textes français d’opencairn.ai.
 *
 * Pour modifier :
 *   - Changez uniquement le texte entre les guillemets droits.
 *   - Laissez tels quels les clés (les mots avant chaque deux-points), les guillemets et les virgules.
 *   - Dans le texte, utilisez les guillemets « » et l’apostrophe typographique (’) plutôt qu’un
 *     guillemet droit ("), qui terminerait le texte trop tôt.
 *   - Les espaces avant « : » sont des espaces insécables, pour éviter qu’un deux-points se
 *     retrouve seul en début de ligne.
 *   - {mozilla} et {mila}, dans la ligne du pied de page, indiquent l’emplacement des deux liens.
 *   - Pour prévisualiser, ouvrez public/index.html?lang=fr dans un navigateur, ou lancez `npx wrangler dev`.
 *
 * Les textes anglais se trouvent dans en.js et suivent exactement la même structure.
 */
window.CAIRN_COPY = window.CAIRN_COPY || {};
window.CAIRN_COPY.fr = {
  meta: {
    title: "Cairn — L’architecture de la pile d’inférence d’IA à code source ouvert",
    description: "Une architecture ouverte pour la pile d’inférence d’IA : des contrats d’interface clairs entre chaque couche et chaque composant, des composants interchangeables et une implémentation de référence bâtie avec les meilleurs composants à code source ouvert. Une collaboration de recherche Mozilla × Mila.",
  },

  header: {
    codename: "codename:",
    languageLabel: "Langue",
    download: "Télécharger l’image",
    downloadBusy: "Préparation de l’image…",
    downloadFailed: "Échec du téléchargement, réessayez",
    github: "Suivez-nous sur GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    eyebrow: "Aperçu technique",
    title: "Découvrez la pile d’inférence d’IA à code source ouvert",
    goal: "Notre objectif : définir des contrats d’interface clairs entre chaque couche et chaque composant de la pile, pour que :",
    points: [
      {
        title: "Tout fonctionne ensemble",
        text: "Les composants conçus selon les mêmes contrats s’assemblent, sans développement sur mesure.",
      },
      {
        title: "Chaque composant est interchangeable",
        text: "Tout composant conforme à un contrat peut en remplacer un autre, sans retoucher le reste.",
      },
      {
        title: "Le meilleur du code source ouvert",
        text: "Notre implémentation de référence réunit les meilleurs composants à code source ouvert disponibles aujourd’hui.",
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

  // Le diagramme d’architecture, dans l’ordre de lecture : de haut en bas, de gauche à droite.
  //   name :    le libellé affiché dans la case
  //   detail :  la petite ligne sous le libellé (facultative ; seul le Registre en a une)
  //   tooltip : la courte description qui s’affiche au survol, au toucher ou au clavier
  stack: {
    local: {
      name: "Local",
      tooltip: "Au-dessus de la ligne : les applications que les gens utilisent et les SDK avec lesquels elles sont conçues, sur leurs propres appareils. Elles accèdent à la pile par une seule API.",
    },
    server: {
      name: "Serveur",
      tooltip: "Sous la ligne : la pile elle-même, sur une infrastructure que votre organisation contrôle, en interne, chez un partenaire ou chez un fournisseur de calcul.",
    },

    application: {
      name: "Application",
      tooltip: "Les outils avec lesquels les gens travaillent au quotidien. Les équipes conservent leurs assistants et leurs agents, et les connectent à la pile.",
      chatUi: {
        name: "Interface conversationnelle",
        tooltip: "Une interface de conversation pour les questions, la rédaction et l’analyse du quotidien, propulsée par les modèles de votre organisation.",
      },
      codingHarness: {
        name: "Harnais de programmation",
        tooltip: "Un agent de programmation qui lit, écrit et exécute du code aux côtés des développeurs, grâce aux modèles et aux outils de la pile.",
      },
      knowledgeWorkHarness: {
        name: "Harnais de travail intellectuel",
        tooltip: "Des agents de recherche, de rédaction et d’analyse qui s’appuient sur les documents, les connaissances et les outils de votre organisation.",
      },
    },

    sdk: {
      name: "SDK",
      tooltip: "Les bibliothèques avec lesquelles les développeurs créent leurs propres applications et agents sur la pile.",
      llmSdk: {
        name: "SDK pour LLM",
        tooltip: "Une bibliothèque cliente pour appeler les modèles par l’API de la pile, quels que soient le moteur ou le matériel qui les servent.",
      },
      agentSdk: {
        name: "SDK pour agents",
        tooltip: "Un cadre de développement pour créer des agents qui planifient, appellent des outils, se souviennent et mènent des tâches en plusieurs étapes sur la pile.",
      },
    },

    persistence: {
      name: "Persistance",
      tooltip: "Là où les connaissances survivent à une simple requête : les documents consultables de votre organisation et la mémoire à long terme de ses agents.",
      semanticSearch: {
        name: "Système de recherche sémantique",
        tooltip: "Transforme vos documents en connaissances consultables : il les ingère et les indexe, puis les retrouve par le sens comme par les mots-clés pour étayer les réponses.",
      },
      agentMemory: {
        name: "Système de mémoire des agents",
        tooltip: "Permet aux agents de retenir d’une session à l’autre ce qu’une personne ou une équipe a appris, décidé ou préfère, pour ne jamais repartir de zéro.",
      },
    },

    agentRuntime: {
      name: "Exécution des agents",
      tooltip: "Là où les agents passent à l’action : les environnements qui exécutent leur code et leurs outils, isolés de tout le reste.",
      localToolServer: {
        name: "Serveur d’outils local",
        tooltip: "Héberge les outils dont l’agent se sert directement dans son environnement d’exécution, comme un moteur d’exécution local et un navigateur web.",
      },
      sandbox: {
        name: "Bac à sable",
        tooltip: "Un environnement isolé où les agents exécutent du code et des commandes pour accomplir leurs tâches, sans atteindre ce qui ne les concerne pas.",
      },
    },

    modelAccess: {
      name: "Accès aux modèles",
      tooltip: "Comment chaque requête atteint un modèle : un point d’entrée unique devant les serveurs qui exécutent vos modèles.",
      modelGateway: {
        name: "Passerelle de modèles",
        tooltip: "La porte d’entrée unique vers tous les modèles. Elle oriente chaque requête, met les réponses en cache, applique les quotas et garde les clés des fournisseurs hors de portée des utilisateurs.",
      },
      modelServer: {
        name: "Serveur de modèles",
        tooltip: "Exécute les modèles sur votre matériel et les sert par une API standard. Il réunit le service d’API, le cycle de vie des modèles et un moteur d’inférence.",
      },
    },

    toolAccess: {
      name: "Accès aux outils",
      tooltip: "Comment les agents atteignent les outils et les données : un point d’entrée unique et encadré devant les serveurs qui les fournissent.",
      toolGateway: {
        name: "Passerelle d’outils",
        tooltip: "La porte d’entrée unique vers tous les outils. Elle regroupe les serveurs d’outils, décide qui peut utiliser quoi, injecte les identifiants pour que les agents ne les détiennent jamais, et démarre ou arrête les serveurs au besoin.",
      },
      toolServer: {
        name: "Serveur d’outils",
        tooltip: "Héberge les outils que les agents appellent à distance, comme des serveurs MCP reliés à vos API et à vos données, ou la recherche web.",
      },
    },

    registry: {
      name: "Registre",
      detail: "Approvisionnement en artefacts : consommés au déploiement ou à l’ouverture d’une session",
      tooltip: "Le catalogue des briques approuvées (compétences, invites, modèles et outils) où la pile puise lors de son déploiement ou à l’ouverture d’une session.",
      skillRegistry: {
        name: "Registre de compétences",
        tooltip: "Des compétences versionnées : instructions et ressources regroupées qui apprennent aux agents à mener des tâches précises.",
      },
      promptRegistry: {
        name: "Registre d’invites",
        tooltip: "Des invites et des instructions système versionnées et révisées, partagées entre les équipes plutôt que copiées de l’une à l’autre.",
      },
      modelRegistry: {
        name: "Registre de modèles",
        tooltip: "Les modèles approuvés pour la pile, avec leurs versions, leurs sources et les réglages pour les servir sur votre matériel.",
      },
      toolRegistry: {
        name: "Registre d’outils (MCP)",
        tooltip: "Le répertoire des serveurs d’outils MCP approuvés que les agents ont le droit de découvrir et d’utiliser.",
      },
    },

    security: {
      name: "Sécurité",
      tooltip: "Traverse toutes les couches : qui accède à quoi, ce qui entre dans les modèles et en sort, et si ce que vous installez est digne de confiance.",
      iam: {
        name: "IAM",
        tooltip: "Gestion des identités et des accès : vérifie qui sont les personnes et les agents, et contrôle ce à quoi chacun peut accéder.",
      },
      guardrails: {
        name: "Garde-fous",
        tooltip: "Vérifie ce qui entre dans les modèles et les agents et ce qui en sort selon vos politiques, et bloque, masque ou signale ce qui ne doit pas passer.",
      },
      registryScanners: {
        name: "Analyseurs de registres",
        tooltip: "Analysent les modèles, compétences, invites et outils avant leur entrée dans les registres, pour repérer les artefacts altérés ou vulnérables.",
      },
    },

    observability: {
      name: "Observabilité",
      tooltip: "Traverse toutes les couches : ce que fait la pile, ce qu’elle coûte et comment les agents arrivent à leurs résultats.",
      telemetry: {
        name: "Collecte de télémétrie",
        tooltip: "Rassemble en un seul endroit les journaux, les métriques et les traces de chaque composant, selon la norme ouverte OpenTelemetry (OTel).",
      },
      costUsage: {
        name: "Analyse des coûts et de l’usage",
        tooltip: "Montre qui utilise quoi : jetons et dépenses par équipe, par modèle et par application, pour planifier la capacité et les budgets.",
      },
      agentTracing: {
        name: "Traçage des agents",
        tooltip: "Suit l’exécution d’un agent étape par étape, à chaque appel de modèle, appel d’outil et décision, pour déboguer et auditer son comportement.",
      },
    },

    controlPlane: {
      name: "Plan de contrôle",
      tooltip: "Traverse toutes les couches : comment les opérateurs installent, configurent, encadrent et optimisent l’ensemble de la pile.",
      adminConsole: {
        name: "Console d’administration",
        tooltip: "Un seul endroit pour exploiter la pile au quotidien : utilisateurs, modèles, outils et réglages.",
      },
      deployment: {
        name: "Déploiement et cycle de vie",
        tooltip: "Installe la pile, la met à niveau en toute sécurité et gère sa configuration dans la durée.",
      },
      policyTenancy: {
        name: "Politiques et locataires",
        tooltip: "Fixe les paramètres par défaut de toute l’organisation et cloisonne les équipes ou les locataires, chacun avec ses modèles, ses outils, ses limites et ses frontières de données.",
      },
      magicModel: {
        name: "MagicModel",
        tooltip: "Associe automatiquement les modèles à votre matériel et à chaque requête, et ajuste leur service pour la vitesse et le coût.",
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
