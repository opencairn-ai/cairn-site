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
 *   - Pour prévisualiser, ouvrez public/index.html?lang=fr dans un navigateur, ou lancez `npx wrangler dev`.
 *
 * Les textes anglais se trouvent dans en.js et suivent exactement la même structure.
 */
window.CAIRN_COPY = window.CAIRN_COPY || {};
window.CAIRN_COPY.fr = {
  meta: {
    title: "Cairn : l’architecture de la pile d’IA souveraine à code source ouvert",
    // Browser tab title of the pages without their own title: {page} is the name of the tab.
    pageTitle: "Cairn : {page}",
    description: "Une architecture ouverte pour exécuter des modèles et des agents d’IA sur une infrastructure que votre organisation contrôle. Les composants respectent des contrats d’interface clairs, si bien que vous ne dépendez d’aucun projet ni d’aucun fournisseur. Une collaboration de recherche Mozilla × Mila.",
  },

  // The tabs under the header, in order. Each one is a page.
  nav: {
    label: "Pages",
    hello: "Hello World",
    stack: "La pile",
    recipes: "Recettes",
    roadmap: "Feuille de route",
  },

  header: {
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
    title: "Découvrez la pile d’IA souveraine à code source ouvert",
    goal: "Notre objectif est de définir des contrats d’interface clairs entre chaque couche et composant de la pile afin que vous puissiez :",
    points: [
      {
        title: "Connecter les composants d’une couche à l’autre",
        text: "Un composant qui respecte les contrats se connecte au reste de la pile avec un minimum de code d’intégration sur mesure.",
      },
      {
        title: "Remplacer un composant",
        text: "Utilisez un autre composant qui réussit les mêmes tests de contrat. Vous ne dépendez d’aucun projet ni d’aucun fournisseur.",
      },
      {
        title: "Partir de composants par défaut testés",
        text: "Dans chaque couche, notre implémentation de référence utilise les composants à code source ouvert qui obtiennent les meilleurs résultats aux tests de contrat.",
      },
    ],
  },

  diagram: {
    // Le titre de la page de la pile.
    title: "Une architecture de référence pour l’IA auto-hébergée",
    label: "Architecture de la pile d’inférence d’IA à code source ouvert",
    // La ligne au-dessus du schéma. Un grand écran montre la case sélectionnée dans la
    // fiche à côté du schéma ; un petit écran la montre dans une infobulle.
    hint: "Sélectionnez une couche ou un composant pour découvrir son rôle.",
    // La fiche à côté du schéma : les faits sous la description de la case sélectionnée.
    // Les noms de couches et de composants dans ces faits sont des liens vers leurs cases.
    sheet: {
      components: "Composants",
      layer: "Couche",
      alsoInLayer: "Aussi dans cette couche",
      appliesTo: "S’applique à",
      allLayers: "Toutes les couches",
      // Le bouton au-dessus de la fiche. La fiche est masquée au départ : le schéma prend
      // toute la largeur. Un clic sur une case ouvre la fiche ; Échap la ferme.
      hide: "Masquer les détails",
      show: "Afficher les détails",
    },
    // The name of the group of cross-cutting layers (Security, Observability, Control Plane).
    crossLabel: "S’applique à toutes les couches",
    // Marque les composants et les couches de la version alpha, sur les cases, dans la
    // légende et dans les infobulles. Une couche reçoit la marque quand un de ses
    // composants l’a.
    status: {
      alpha: "Version alpha",
    },
    // Petite étiquette affichée en haut de chaque infobulle.
    kinds: {
      boundary: "Frontière",
      layer: "Couche",
      crossCutting: "Couche transversale",
      component: "Composant",
      endpoint: "Point de terminaison",
    },
  },

  // Le schéma d’architecture, dans l’ordre de lecture : de haut en bas, de gauche à droite.
  //   name :    le libellé affiché dans la case
  //   detail :  une petite ligne facultative sous le libellé (aucune n’est utilisée)
  //   tooltip : la courte description qui s’affiche au survol, au toucher ou au clavier
  stack: {
    local: {
      name: "Côté client",
      tooltip: "Au-dessus de la ligne : vos applications. Elles ne font pas partie de la pile. Elles se connectent à la pile par son point de terminaison d’API. Elles peuvent s’exécuter sur les appareils des utilisateurs, dans vos produits ou dans le nuage.",
    },
    server: {
      name: "Côté serveur",
      tooltip: "Sous la ligne : la pile. Elle s’exécute sur une infrastructure que votre organisation contrôle : en interne, chez un partenaire ou chez un fournisseur de calcul.",
    },
    localApi: {
      name: "Point de terminaison d’API",
      tooltip: "Le point où les clients se connectent à la pile.",
    },

    application: {
      name: "Apportez votre application",
      tooltip: "Les applications ne font pas partie de la pile. Les équipes conservent leurs assistants et leurs agents actuels, ou créent les leurs avec un SDK. Ils se connectent à la pile par son point de terminaison d’API.",
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

  // La page des recettes. Les recettes viennent du dépôt de la pile
  // (js/recipes-data.js) ; seuls les mots autour d’elles sont ici.
  //   {hardware} et {server} sont des noms tirés de la recette, par exemple « GB10 » et « vLLM ».
  //   {count} est un nombre tiré de la recette, écrit dans le format de la langue.
  recipes: {
    // Le titre de la page, une ligne sur ce qu’est une recette, puis une ligne sur la
    // limite actuelle des recettes.
    title: "Recettes de référence pour les modèles locaux",
    lead: "Une recette contient la configuration pour servir un modèle. Elle utilise un serveur de modèles et s’exécute sur un type de matériel.",
    limit: "Pour l’instant, les recettes visent seulement les installations sur un seul nœud.",
    // L’indication au-dessus des filtres.
    hint: "Sélectionnez une recette pour voir ses fichiers.",
    // Le nom de la liste, pour les lecteurs d’écran.
    listLabel: "Recettes",
    filters: {
      // Le nom de la rangée de filtres, pour les lecteurs d’écran.
      label: "Filtres",
      // Le nom du menu. Le menu affiche son nom jusqu’à ce qu’un choix soit fait.
      hardware: "Matériel",
      useCase: "Cas d’utilisation",
      // Le premier choix du menu : il retire le filtre.
      all: "Tous",
      // Le champ de recherche : son nom pour les lecteurs d’écran, et le texte qu’il affiche quand il est vide.
      model: "Modèle",
      modelPlaceholder: "Nom du modèle",
    },
    // Les en-têtes des colonnes du tableau. La fiche utilise les mêmes noms pour ses faits.
    columns: {
      model: "Modèle",
      hardware: "Matériel",
      server: "Serveur de modèles",
      context: "Contexte",
      // Dans le tableau, quand la recette ne fixe pas de longueur de contexte.
      contextDefault: "Défaut",
      tools: "Appel d’outils",
      reasoning: "Raisonnement",
      useCase: "Cas d’utilisation",
    },
    // Les faits de la recette sélectionnée, dans la fiche. {count} est un nombre de jetons.
    facts: {
      // Sous « Serveur de modèles » dans la fiche : le nom court suffit.
      image: "Image du serveur",
      context: "{count} jetons",
      contextDefault: "Valeur par défaut du serveur de modèles",
      model: "Modèle",
      yes: "Oui",
      no: "Non",
    },
    // Le serveur de modèles et le matériel d’une recette, par exemple « vLLM sur GB10 ».
    where: "{server} sur {hardware}",
    empty: "Aucune recette ne correspond à ces filtres. Retirez un filtre pour voir plus de recettes.",
    noSelection: "Sélectionnez une recette pour voir sa configuration.",
    // Les cas d’utilisation auxquels une recette convient le mieux : les mots du tableau,
    // et les choix du menu « Cas d’utilisation ». Les règles sont dans tools/use-cases.mjs.
    useCases: {
      chat: "Conversation",
      coding: "Programmation",
      documents: "Documents",
      // L’infobulle du bouton « ? » à côté de l’en-tête « Cas d’utilisation » :
      // « … de Hugging Face et Artificial Analysis. » Les liens suivent ce texte.
      credit: "Les cas d’utilisation s’appuient sur des données d’évaluation de",
      // Le nom du bouton « ? », pour les lecteurs d’écran et comme info-bulle.
      about: "À propos des cas d’utilisation",
      creditAnd: "et",
    },
    // L’infobulle d’un en-tête de colonne ou d’un cas d’utilisation : son type, son nom, puis sa description.
    tips: {
      kinds: {
        useCase: "Cas d’utilisation",
        fact: "Configuration",
      },
      useCases: {
        chat: "Une personne converse avec le modèle : questions, rédaction et explications.",
        coding: "Le modèle écrit et modifie du code, dans un éditeur ou dans un outil de programmation.",
        documents: "Le modèle lit des documents sous forme d’images : pages, tableaux, graphiques et formulaires.",
      },
      tags: {
        context: "La longueur maximale d’une requête, en jetons : l’entrée plus la réponse.",
        tools: "Le serveur de modèles renvoie les appels d’outils dans un format structuré. Les outils de programmation et les agents s’en servent.",
        reasoning: "Le serveur de modèles renvoie le raisonnement du modèle à part de sa réponse.",
      },
    },
    sheet: {
      // Le nom de la fiche, pour les lecteurs d’écran.
      label: "Recette sélectionnée",
      files: "Fichiers de la recette",
      copy: "Copier",
      copied: "Copié",
      copyFailed: "Échec de la copie",
      modelCard: "Fiche du modèle",
      // Les textes suivants ne s’affichent que lorsque le dépôt de la pile est public (STACK_IS_PUBLIC dans js/recipes.js).
      github: "Ouvrir la recette sur GitHub",
      use: {
        title: "Utiliser cette recette",
        select: "Définissez ces valeurs dans le fichier .env, ou lancez ./model-selection.sh et sélectionnez-les.",
        start: "Démarrez la pile.",
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
