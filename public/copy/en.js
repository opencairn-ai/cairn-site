/*
 * English copy for opencairn.ai.
 *
 * How to edit:
 *   - Change only the text between the double quotes.
 *   - Leave the keys (the words before each colon), the quotes and the commas as they are.
 *   - Inside the text, use typographic quotes (“ ” ’) rather than a straight double quote ("),
 *     which would end the text early.
 *   - Wrap words in *asterisks* to highlight them in pink, and in _underscores_ to
 *     put them in italic. On the Hello World page, the
 *     highlighted sentence of `hello.lead` also starts on a new line.
 *   - {mozilla} and {mila} in the footer line are where the two links go; move them freely.
 *   - Preview by opening public/index.html in a browser, or with `npx wrangler dev`.
 *
 * The French copy lives in fr.js and follows exactly the same structure.
 */
window.CAIRN_COPY = window.CAIRN_COPY || {};
window.CAIRN_COPY.en = {
  meta: {
    title: "Cairn: The sovereign, open source AI stack architecture",
    // Browser tab title of the pages without their own title: {page} is the name of the tab.
    pageTitle: "Cairn: {page}",
    description: "An open architecture to run AI models and agents on infrastructure that your organization controls. Components follow clear interface contracts, so you do not depend on one project or vendor. A Mozilla × Mila research collaboration.",
  },

  // The tabs under the header, in order. Each one is a page.
  nav: {
    label: "Pages",
    hello: "Hello World",
    stack: "LaStack",
    recipes: "Model Recipes",
    roadmap: "Roadmap",
  },

  header: {
    languageLabel: "Language",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    download: "Download schema",
    downloadBusy: "Preparing schema…",
    downloadFailed: "Download failed. Try again.",
    contact: "Drop us a pebble",
    contactUrl: "mailto:bonjourhi@opencairn.ai",
    github: "Contribute on GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    // The title of the Hello World page.
    title: "Introducing the sovereign,\nopen source AI stack",
    // The goal and its three points, on the stack page.
    goal: "Our goal is to define clear interface contracts between every layer and component of the stack, so that you can:",
    points: [
      {
        title: "Connect components across layers",
        text: "A component that follows the contracts connects to the rest of the stack with minimal custom integration code.",
      },
      {
        title: "Replace a component",
        text: "Use another component that passes the same contract tests. You do not depend on one project or vendor.",
      },
      {
        title: "Start from tested defaults",
        text: "In each layer, our reference implementation uses the open source components with the best contract test results.",
      },
    ],
  },

  // The Hello World page, for business leaders.
  // The heading on the page is `hello.title`. `intro.title` stays plain: the downloaded schema uses it.
  hello: {
    // The heading. `mark` is Default Lingo, one step larger. `before` and `after` stay in Space Grotesk.
    title: {
      line: "Introducing the sovereign,",
      before: "",
      mark: "open source",
      after: " AI stack",
    },
    // The two lines under the title. The first is Medium. The second is hello.what.title, Bold, in magenta.
    lead: "The models are not the problem. Deploying and running them is.",
    points: [
      {
        title: "Your data and your policies stay on your infrastructure",
        text: "Everything runs on infrastructure that you control. You can inspect and replace each component.",
      },
      {
        title: "Open source, without the assembly",
        text: "A tested stack. You install, upgrade and operate it from its documentation.",
      },
      {
        title: "You own your capacity and your choices",
        text: "AI runs on infrastructure that you own or share. Costs are predictable, and you do not depend on one vendor.",
      },
    ],

    // What Cairn is, then the link to the stack page and the contact address.
    what: {
      title: "Cairn is an open source AI stack that your organization deploys and runs on infrastructure it controls",
      stack: "Explore LaStack",
      contact: "Drop us a pebble",
      contactUrl: "mailto:bonjourhi@opencairn.ai",
    },

    // The carousel shows these four principles, one at a time, each with a picture.
    // The page has four slides: keep four principles, in this order.
    // tag: the small label on the card. The text shows only while the card is open.
    principles: [
      {
        tag: "Transparency",
        name: "Tested open source components",
        text: "We define what each layer must do. Then we test existing open source components against that specification and select the best fit.",
      },
      {
        tag: "Portability",
        name: "Replaceable by contract",
        text: "We publish the interface contracts that each component must satisfy. A component that satisfies them can replace another one without rework.",
      },
      {
        tag: "Sovereignty",
        name: "Your teams keep their tools",
        text: "Your teams keep the chat assistants and coding agents they use today. They connect them to one point of entry, on your organization's compute.",
      },
      {
        tag: "Philosophy",
        name: "Composition, not creation",
        text: "We write the code that connects components, not new components. Where no suitable open source component exists, we publish a specification.",
      },
    ],

    carousel: {
      // The heading of the list of the principles, and the name of the carousel for screen readers.
      label: "Our approach to building Cairn",
      pause: "Pause the carousel",
      play: "Play the carousel",
      // The name of a principle of the list for screen readers, for example "2 of 4: Replaceable by contract".
      position: "{index} of {count}: {name}",
    },

    // The texts in the four pictures. The layer and component names in the pictures
    // are the names under `stack`.
    pictures: {
      // Picture 1: three components and their test results.
      tests: {
        components: "Open source components",
        tests: "Tests",
        componentA: "Component A",
        componentB: "Component B",
        componentC: "Component C",
        selected: "Selected",
      },
      // Picture 2: a Model Gateway and a Model Server, each with two choices.
      contract: {
        interface: "Interface",
        contractWord: "contract",
        passed: "Contract tests passed",
      },
      // Picture 3: the tools of the teams, Cairn, then the compute.
      tools: {
        chat: "Chat assistant",
        coding: "Coding agent",
        applications: "Your applications",
        api: "One point of entry",
        cairn: "Cairn",
        where: "On your infrastructure",
        local: "Local compute",
        localDetail: "Your GPUs",
        remote: "Remote compute",
        remoteDetail: "Cloud, hosted APIs",
        compute: "Compute for AI models",
      },
      // Picture 4: what the three signs of the picture mean.
      skeleton: {
        component: "Open source component",
        code: "Connection code",
        specification: "Component specification",
      },
    },
  },

  diagram: {
    // The title of the stack page.
    title: "A reference architecture for self-hosted AI",
    label: "Architecture of the open source AI inference stack",
    // The line above the schema. A wide screen shows the selected box in the sheet
    // beside the schema; a narrow screen shows it in a pop-up.
    // The heading above the schema.
    heading: "LaStack, layer by layer, component by component",
    hint: "Select any box to see what it does.",
    // The sheet beside the schema: the facts under the description of the selected box.
    // The names of layers and components in these facts are links to their boxes.
    sheet: {
      components: "Components",
      layer: "Part of the layer",
      // One other component: singular, no count. Two or more: plural, and the script
      // adds the count, "Other components in this layer (2)".
      alsoInLayerOne: "Other component in this layer",
      alsoInLayer: "Other components in this layer",
      appliesTo: "Applies to",
      allLayers: "All layers",
      // The button above the sheet, with an arrow. The sheet is hidden at first: the
      // schema takes the full width. A click on a box opens the sheet; Escape closes it.
      title: "Description card",
      // The name of the × in the top right corner of the sheet, for screen readers and on hover.
      close: "Close the card",
    },
    // The name of the group of cross-cutting layers (Security, Observability, Control Plane).
    crossLabel: "Applies to all layers",
    // Marks the components and layers in the Alpha release, on the boxes, in the
    // legend and in the pop-ups. A layer gets the mark when one of its components has it.
    status: {
      alpha: "Alpha release",
    },
    // Small label shown at the top of each pop-up.
    kinds: {
      boundary: "Boundary",
      layer: "Layer",
      crossCutting: "Cross-cutting layer",
      component: "Component",
      endpoint: "Endpoint",
    },
  },

  // The architecture schema, in reading order: top to bottom, left to right.
  //   name:    the label shown in the box
  //   detail:  an optional smaller line under the name (none in use)
  //   tooltip: the short description that pops up on hover, tap or keyboard focus
  stack: {
    local: {
      name: "Client side",
      tooltip: "Above the line: your applications. They are not part of the stack. They connect to the stack through its API endpoint. They can run on user devices, in your products or in the cloud.",
    },
    server: {
      name: "Server side",
      tooltip: "Below the line: the stack. It runs on infrastructure that your organization controls: in-house, at a partner or at a compute provider.",
    },
    localApi: {
      name: "API Endpoint",
      tooltip: "The point where clients connect to the stack.",
    },

    application: {
      name: "Bring-Your-Own Application",
      tooltip: "Applications are not part of the stack. Teams keep their current assistants and agents, or build their own with an SDK. They connect to the stack through its API endpoint.",
    },

    persistence: {
      name: "Persistence",
      tooltip: "Stores your organization’s documents for search, and the long-term memory of your agents.",
      semanticSearch: {
        name: "Semantic Search System",
        tooltip: "Ingests and indexes your documents. It finds relevant content by meaning and by keyword, so models can answer from your documents.",
      },
      agentMemory: {
        name: "Agent Memory System",
        tooltip: "Central memory for agents. It keeps what a user or a team has learned, decided or prefers, across sessions and devices.",
      },
    },

    agentRuntime: {
      name: "Agent Runtime",
      tooltip: "Isolated environments that run agent code and tools.",
      localToolServer: {
        name: "Local Tool Server",
        tooltip: "Runs tools next to the agent, in the runtime: for example, a local execution engine or a web browser.",
      },
      sandbox: {
        name: "Sandbox",
        tooltip: "An isolated environment where agents run code and shell commands to complete tasks.",
      },
    },

    modelAccess: {
      name: "Model Access",
      tooltip: "Connects applications and agents to models: a gateway in front of the model servers.",
      modelGateway: {
        name: "Model Gateway",
        tooltip: "The single entry point to all models. It routes requests, caches responses, applies quotas and gives one API for all model providers.",
      },
      modelServer: {
        name: "Model Server",
        tooltip: "Runs models on your hardware with an inference engine, and serves them through a standard API.",
      },
    },

    toolAccess: {
      name: "Tool Access",
      tooltip: "Connects agents to tools: a gateway in front of the tool servers.",
      toolGateway: {
        name: "Tool Gateway",
        tooltip: "The single entry point to all tools. It collects tool servers in one catalog, controls who can use each tool, injects credentials, and starts or stops tool servers when necessary.",
      },
      toolServer: {
        name: "Tool Server",
        tooltip: "Hosts the tools that agents call remotely: for example, connectors to your APIs and data, or web search.",
      },
    },

    registry: {
      name: "Registry",
      tooltip: "The catalog of approved skills, prompts, models and tools. The stack uses it at deployment and at the start of each session.",
      skillRegistry: {
        name: "Skill Registry",
        tooltip: "Versioned skills: packages of instructions and resources that tell agents how to do specific tasks.",
      },
      promptRegistry: {
        name: "Prompt Registry",
        tooltip: "Versioned, approved prompts and system instructions, shared across teams.",
      },
      modelRegistry: {
        name: "Model Registry",
        tooltip: "Approved models, with their versions, sources and serving settings for your hardware.",
      },
      toolRegistry: {
        name: "Tool Registry",
        tooltip: "Approved tool servers that agents can find and use.",
      },
    },

    security: {
      name: "Security",
      tooltip: "Applies to all layers. It controls access, checks the data that goes in and out of components, and makes sure that registry artifacts are safe.",
      iam: {
        name: "Identity and Access Management",
        tooltip: "Verifies the identity of users and agents, and controls what each one can access.",
      },
      guardrails: {
        name: "Guardrails",
        tooltip: "Checks model and agent inputs and outputs against your policies. It blocks, redacts or flags content that breaks a policy.",
      },
      registryScanners: {
        name: "Registry Scanners",
        tooltip: "Scan models, skills, prompts and tools before they enter a registry, to find tampered or vulnerable artifacts.",
      },
    },

    observability: {
      name: "Observability",
      tooltip: "Applies to all layers. It shows what the stack does, what it costs and how agents get their results.",
      telemetry: {
        name: "Telemetry Collection",
        tooltip: "Collects logs, metrics and traces from all components in one place.",
      },
      costUsage: {
        name: "Cost & Usage Analytics",
        tooltip: "Shows token use and cost by team, model and application, to plan capacity and budgets.",
      },
      agentTracing: {
        name: "Agent Tracing",
        tooltip: "Records each step of an agent run: every model call, tool call and decision.",
      },
    },

    controlPlane: {
      name: "Control Plane",
      tooltip: "Applies to all layers. Operators use it to install, configure, govern and maintain the stack.",
      adminConsole: {
        name: "Admin Console",
        tooltip: "The interface that operators use to run the stack every day.",
      },
      deployment: {
        name: "Deployment & Lifecycle",
        tooltip: "Installs and upgrades the stack, and manages its configuration and the model lifecycle.",
      },
      policyTenancy: {
        name: "Policy & Tenancy",
        tooltip: "Sets defaults for the whole organization and isolates teams or tenants. Each one gets its own models, tools, limits and data boundaries.",
      },
      magicModel: {
        name: "Hardware-to-Model Selector",
        tooltip: "Automatically selects the best model for your hardware, use cases and workloads, and tunes the serving configuration for speed.",
      },
    },
  },

  // The Recipes page. The recipes come from the stack repository
  // (js/recipes-data.js); only the words around them are here.
  //   {hardware} and {server} are names from the recipe, for example "GB10" and "vLLM".
  //   {count} is a number from the recipe, written in the format of the language.
  recipes: {
    // The title of the page, one line about a recipe, then one line about the limit
    // of the recipes at this time.
    title: "Reference recipes for local models",
    lead: "A recipe contains the configuration to serve one model. It uses one model server and runs on one hardware type.",
    limit: "At the moment, the recipes are for single-node setups only.",
    // The hint above the filters.
    hint: "Select a recipe to see its files.",
    // The name of the list panel.
    listLabel: "Recipes",
    filters: {
      // The name of the row of filters for screen readers.
      label: "Filters",
      // The name of the menu. The menu shows its name until the visitor selects a choice.
      hardware: "Hardware",
      useCase: "Use case",
      // The first choice of the menu: it removes the filter.
      all: "All",
      // The search field: its name for screen readers, and the text it shows while empty.
      model: "Model",
      modelPlaceholder: "Model name",
    },
    // The column headings of the table. The sheet uses the same names for its facts.
    columns: {
      model: "Model",
      hardware: "Hardware",
      server: "Model server",
      context: "Context",
      // In the table, when the recipe does not set a context length.
      contextDefault: "Default",
      tools: "Tool calling",
      reasoning: "Reasoning",
      useCase: "Use case",
    },
    // The facts of the selected recipe, in the sheet. {count} is a number of tokens.
    facts: {
      image: "Model server image",
      context: "{count} tokens",
      contextDefault: "Model server default",
      model: "Model",
      yes: "Yes",
      no: "No",
    },
    // The model server and the hardware of a recipe, for example "vLLM on GB10".
    where: "{server} on {hardware}",
    empty: "No recipe matches these filters. Remove a filter to see more recipes.",
    noSelection: "Select a recipe to see its configuration.",
    // The use cases that a recipe fits best: tags, and the choices of the "Use case" menu.
    // The rules that give a use case to a recipe are in tools/use-cases.mjs.
    useCases: {
      chat: "Chat",
      coding: "Coding",
      documents: "Documents",
      // The pop-up of the "?" button next to the "Use case" heading:
      // "… from Hugging Face and Artificial Analysis." The links go after this text.
      credit: "The use cases use benchmark data from",
      // The name of the "?" button, for screen readers and as its tooltip.
      about: "About the use cases",
      creditAnd: "and",
    },
    // The pop-up of a column heading or a use case: its kind, its name, then its description.
    tips: {
      kinds: {
        useCase: "Use case",
        fact: "Configuration",
      },
      useCases: {
        chat: "A person talks with the model: questions, writing and explanations.",
        coding: "The model writes and changes code, in an editor or in a coding tool.",
        documents: "The model reads documents as images: pages, tables, charts and forms.",
      },
      tags: {
        context: "The maximum length of one request, in tokens: the input plus the answer.",
        tools: "The model server returns tool calls in a structured format. Coding tools and agents use them.",
        reasoning: "The model server returns the reasoning of the model apart from its answer.",
      },
    },
    sheet: {
      // The name of the sheet for screen readers.
      label: "Selected recipe",
      // The button above the sheet, with an arrow, as on the stack page. The sheet is
      // open at first; the button closes it and the table takes the full width.
      title: "Deployment card",
      files: "Recipe files",
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Copy failed",
      modelCard: "Model card",
      // The next texts show only when the stack repository is public (STACK_IS_PUBLIC in js/recipes.js).
      github: "Open the recipe on GitHub",
      use: {
        title: "Use this recipe",
        select: "Set these values in the file .env, or run ./model-selection.sh and select them.",
        start: "Start the stack.",
      },
    },
  },

  // The Roadmap page: a table. Each row is a workstream. Each column is a time.
  roadmap: {
    title: "The roadmap of the stack",
    lead: "What we build now, what comes next, and where the stack goes after that.",
    // For screen readers: the name of the table. Then the name of its first column.
    label: "Roadmap of the stack, by workstream",
    workstreamsLabel: "Workstreams",
    // The three times. `text` tells how sure the items are.
    columns: {
      now: { name: "Now", text: "In progress." },
      next: { name: "Next", text: "Planned." },
      later: { name: "Later", text: "The direction. Not planned yet." },
    },
    // The hint on the layer tag of an item. {layer} is the name of the layer.
    layerLink: "See {layer} on the Stack page",
    // The workstreams, with the items of each time between the square brackets.
    // An item is one line:
    //   { title: "Name of the item", text: "One sentence about it.", layer: "modelAccess" },
    // - `title` shows at each time.
    // - `text` shows under "Now" only. Leave it out for a title alone.
    // - `layer` shows as a tag under "Now" and "Next". A click on the tag opens that
    //   layer on the Stack page. Use a key from `stack` in this file: a layer
    //   ("modelAccess") or a component ("modelAccess.modelServer"). Leave it out for no tag.
    // An empty pair of brackets shows an empty cell.
    workstreams: {
      deploy: {
        name: "Deploy",
        text: "Install and operate the stack.",
        now: [
          { title: "Single-node deployment", text: "Installation instructions in the README, and setup scripts.", layer: "controlPlane.deployment" },
        ],
        next: [
          { title: "Components on several nodes, with Docker", layer: "controlPlane.deployment" },
          { title: "Several models on several nodes, with Docker", layer: "controlPlane.deployment" },
        ],
        later: [
          "One model on several nodes, after the release candidate",
          "Kubernetes",
          "Ansible module",
          "Terraform",
        ],
      },
      features: {
        name: "New features",
        text: "New layers and components.",
        now: [
          { title: "Model gateway", text: "One API for all models, with keys and quotas.", layer: "modelAccess.modelGateway" },
          { title: "Basic recipes", text: "The configuration to serve a model on your hardware.", layer: "modelAccess.modelServer" },
          { title: "Security", text: "Single sign-on, network isolation between the containers, and SSL.", layer: "security" },
          { title: "Grafana as the interface of operators", text: "Dashboards to monitor and operate the stack.", layer: "controlPlane.adminConsole" },
        ],
        next: [
          { title: "Agent tracing", layer: "observability.agentTracing" },
          { title: "Model registry", layer: "registry.modelRegistry" },
        ],
        later: [
          "Tool access: tool server, then tool gateway, then tool registry. Or guardrails first",
          "Better isolation of the containers",
        ],
      },
      improvements: {
        name: "Improvements",
        text: "Better results from what exists.",
        now: [
          { title: "Contribution guide", text: "How to contribute to the stack: CONTRIBUTING.md." },
        ],
        next: [
          { title: "New recipes", layer: "modelAccess.modelServer" },
          { title: "Bug fixes" },
        ],
        later: [
          "Bug fixes",
          "Documentation",
        ],
      },
      contracts: {
        name: "Contracts",
        text: "The interface between two layers, and its tests.",
        now: [],
        next: [
          { title: "On hold until more proofs of concept" },
        ],
        later: [
          "Model access contracts",
        ],
      },
    },
  },

  footer: {
    collaboration: "A research collaboration between {mozilla} and {mila}",
    a: "A",
    role: "Research collaboration",
    contact: "Drop us a pebble",
    contactUrl: "mailto:bonjourhi@opencairn.ai",
    report: "Report a vulnerability",
    reportUrl: "mailto:security@opencairn.ai?subject=Vulnerability%20report",
    mozilla: { name: "Mozilla", url: "https://www.mozilla.org/en-US/" },
    mila: { name: "Mila", url: "https://mila.quebec/en" },
  },

  // The downloaded PNG of the architecture.
  image: {
    fileName: "cairn-inference-stack-architecture",
    site: "opencairn.ai",
  },
};
