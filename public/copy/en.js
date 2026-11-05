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
    description: "An open architecture for the AI inference stack. Clear interface contracts connect all layers and components, so you can replace any component. The reference implementation uses the best open source components. A Mozilla × Mila research collaboration.",
  },

  header: {
    codename: "codename:",
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
    eyebrow: "Technical Teaser",
    title: "Introducing the sovereign, open source AI stack",
    goal: "Our goal is to define clear interface contracts between every layer and component of the stack, so that you can:",
    points: [
      {
        title: "Make all components work together",
        text: "Components that follow the same contracts need no custom integration code.",
      },
      {
        title: "Replace any component",
        text: "Anything that follows the same contract can replace it. The rest of the stack does not change.",
      },
      {
        title: "Use the best of open source",
        text: "We test open source projects against each contract. Our reference implementation uses the best one for each layer.",
      },
    ],
  },

  diagram: {
    label: "Architecture of the open source AI inference stack",
    hint: "Hover over or tap any layer or component to see what it does.",
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
    },
  },

  // The architecture schema, in reading order: top to bottom, left to right.
  //   name:    the label shown in the box
  //   detail:  an optional smaller line under the name (none in use)
  //   tooltip: the short description that pops up on hover, tap or keyboard focus
  stack: {
    local: {
      name: "Local",
      tooltip: "Above the line: applications and SDKs. They run on user devices or inside your products, and connect to the stack through the stack API.",
    },
    server: {
      name: "Server",
      tooltip: "Below the line: the stack. It runs on infrastructure that your organization controls: in-house, at a partner or at a compute provider.",
    },

    application: {
      name: "Application",
      tooltip: "The tools that users work with every day. Teams keep their current assistants and agents, and connect them to the stack.",
      chatUi: {
        name: "Chat UI",
        tooltip: "A chat interface for questions, writing and analysis.",
      },
      codingHarness: {
        name: "Coding Harness",
        tooltip: "A coding agent that reads, writes and runs code with developers.",
      },
      knowledgeWorkHarness: {
        name: "Knowledge-Work Harness",
        tooltip: "Agents for research, writing and analysis. They use your organization’s documents and tools.",
      },
    },

    sdk: {
      name: "SDK",
      tooltip: "Libraries to build your own applications and agents on the stack.",
      llmSdk: {
        name: "LLM SDK",
        tooltip: "A client library that calls models through the stack API. Your code does not change when the engine or the hardware changes.",
      },
      agentSdk: {
        name: "Agent SDK",
        tooltip: "A framework to build agents that plan, call tools, use memory and do multi-step tasks on the stack.",
      },
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
