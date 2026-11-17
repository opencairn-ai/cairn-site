/*
 * English copy for opencairn.ai.
 *
 * How to edit:
 *   - Change only the text between the double quotes.
 *   - Leave the keys (the words before each colon), the quotes and the commas as they are.
 *   - Inside the text, use typographic quotes (“ ” ’) rather than a straight double quote ("),
 *     which would end the text early.
 *   - Wrap words in *asterisks* to highlight them in pink (none are highlighted now).
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
    stack: "The Stack",
    recipes: "Recipes",
    roadmap: "Roadmap",
  },

  header: {
    languageLabel: "Language",
    themeToDark: "Switch to dark theme",
    themeToLight: "Switch to light theme",
    download: "Download schema",
    downloadBusy: "Preparing schema…",
    downloadFailed: "Download failed. Try again.",
    github: "Follow us on GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    title: "Introducing the sovereign, open source AI stack",
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

  diagram: {
    eyebrow: "Explore the architecture",
    label: "Architecture of the open source AI inference stack",
    hint: "Hover over or tap any layer or component to see what it does.",
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
    title: "Find a recipe for your hardware",
    lead: "A recipe contains the configuration to serve one model. It uses one model server and runs on one hardware type.",
    // The label and the hint above the panels, as on the stack page.
    eyebrow: "Explore the recipes",
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
    // The column headings of the list.
    columns: {
      model: "Model",
      hardware: "Hardware",
      server: "Model server",
      tags: "Tags",
    },
    // The model server and the hardware of a recipe, for example "vLLM on GB10".
    where: "{server} on {hardware}",
    empty: "No recipe matches these filters. Remove a filter to see more recipes.",
    noSelection: "Select a recipe to see its configuration.",
    // The use cases that a recipe fits best: tags, and the choices of the "Use case" menu.
    // The rules that give a use case to a recipe are in tools/use-cases.mjs.
    useCases: {
      chat: "Chat",
      tasks: "Tasks",
      coding: "Coding",
      agents: "Agents",
      documents: "Documents",
      // Under the list, before the links to the sources: "… from Hugging Face and Artificial Analysis".
      credit: "The use case tags use benchmark data from",
      creditAnd: "and",
    },
    // The pop-up of a tag: the kind of tag, the name of the tag, then its description.
    tips: {
      kinds: {
        useCase: "Use case",
        fact: "Configuration",
        more: "Hidden tags",
      },
      useCases: {
        chat: "A person talks with the model: questions, writing and explanations.",
        tasks: "An application sends one job at a time: extract, classify, summarize or translate.",
        coding: "The model writes and changes code, in an editor or in a coding tool.",
        agents: "The model does work in many steps and calls tools. A person does not approve each step.",
        documents: "The model reads documents as images: pages, tables, charts and forms.",
      },
      tags: {
        context: "The maximum length of one request, in tokens: the input plus the answer.",
        tools: "The model server returns tool calls in a structured format. Agents and coding tools use them.",
        reasoning: "The model server returns the reasoning of the model apart from its answer.",
      },
    },
    tags: {
      context: "Context: {count} tokens",
      // The name of the tag "+2", which shows when the tags of a recipe do not fit
      // on one line of the list. Its pop-up gives the names of the hidden tags.
      moreOne: "1 more tag",
      more: "{count} more tags",
      tools: "Tool calling",
      reasoning: "Reasoning",
    },
    sheet: {
      // The name of the sheet for screen readers.
      label: "Selected recipe",
      files: "Recipe files",
      image: "Model server image:",
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

  footer: {
    collaboration: "A research collaboration between {mozilla} and {mila}",
    mozilla: { name: "Mozilla", url: "https://www.mozilla.org/en-US/" },
    mila: { name: "Mila", url: "https://mila.quebec/en" },
  },

  // The downloaded PNG of the architecture.
  image: {
    fileName: "cairn-inference-stack-architecture",
    site: "opencairn.ai",
  },
};
