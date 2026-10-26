/*
 * English copy for opencairn.ai.
 *
 * How to edit:
 *   - Change only the text between the double quotes.
 *   - Leave the keys (the words before each colon), the quotes and the commas as they are.
 *   - Inside the text, use typographic quotes (“ ” ’) rather than a straight double quote ("),
 *     which would end the text early.
 *   - {mozilla} and {mila} in the footer line are where the two links go; move them freely.
 *   - Preview by opening public/index.html in a browser, or with `npx wrangler dev`.
 *
 * The French copy lives in fr.js and follows exactly the same structure.
 */
window.CAIRN_COPY = window.CAIRN_COPY || {};
window.CAIRN_COPY.en = {
  meta: {
    title: "Cairn — The open source AI inference stack architecture",
    description: "An open architecture for the AI inference stack: clear interface contracts between every layer and component, swappable parts, and a reference implementation built from the best open source components. A Mozilla × Mila research collaboration.",
  },

  header: {
    languageLabel: "Language",
    download: "Download image",
    downloadBusy: "Preparing image…",
    downloadFailed: "Download failed, try again",
    github: "Follow us on GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    eyebrow: "The architecture",
    title: "Introducing the open source AI inference stack",
    goal: "Our goal is to define clear interface contracts between every layer and component of the stack, so that:",
    points: [
      {
        title: "Everything works together",
        text: "Components built against the same contracts fit together, without custom glue.",
      },
      {
        title: "Any component can be swapped",
        text: "Anything built against a contract can replace another, without reworking the rest.",
      },
      {
        title: "The best of open source",
        text: "Our reference implementation brings together the best open source components available today.",
      },
    ],
  },

  diagram: {
    label: "Architecture of the open source AI inference stack",
    hint: "Hover over or tap any layer or component to see what it does.",
    // Small label shown at the top of each pop-up.
    kinds: {
      boundary: "Boundary",
      layer: "Layer",
      crossCutting: "Cross-cutting layer",
      component: "Component",
    },
  },

  // The architecture diagram, in reading order: top to bottom, left to right.
  //   name:    the label shown in the box
  //   detail:  the smaller line under the name (optional)
  //   tooltip: the short description that pops up on hover, tap or keyboard focus
  stack: {
    local: {
      name: "Local",
      tooltip: "Above the line: the applications people use and the SDKs they are built with, running on their own devices. They reach the stack through a single API.",
    },
    server: {
      name: "Server",
      tooltip: "Below the line: the stack itself, running on infrastructure your organization controls, whether in-house, at a partner or with a compute provider.",
    },

    application: {
      name: "Application",
      tooltip: "The tools people work in every day. Teams keep the assistants and agents they already use and point them at the stack.",
      chatUi: {
        name: "Chat UI",
        tooltip: "A chat interface for everyday questions, writing and analysis, answered by models your organization runs.",
      },
      codingHarness: {
        name: "Coding Harness",
        tooltip: "A coding agent that reads, writes and runs code alongside developers, powered by the stack’s models and tools.",
      },
      knowledgeWorkHarness: {
        name: "Knowledge-Work Harness",
        tooltip: "Agents for research, writing and analysis that draw on your organization’s documents, knowledge and tools.",
      },
    },

    sdk: {
      name: "SDK",
      tooltip: "Libraries developers use to build their own applications and agents on top of the stack.",
      llmSdk: {
        name: "LLM SDK",
        tooltip: "A client library for calling models through the stack’s API, whichever engine or hardware serves them.",
      },
      agentSdk: {
        name: "Agent SDK",
        tooltip: "A framework for building agents that plan, call tools, remember and carry out multi-step tasks on the stack.",
      },
    },

    persistence: {
      name: "Persistence",
      tooltip: "Where knowledge outlives a single request: your organization’s searchable documents and the long-term memory of its agents.",
      semanticSearch: {
        name: "Semantic Search System",
        detail: "ingestion, index, hybrid retrieval",
        tooltip: "Turns your documents into searchable knowledge: ingests and indexes them, then retrieves by both meaning and keywords to ground answers.",
      },
      agentMemory: {
        name: "Agent Memory System",
        detail: "long-term, cross-session individual/team knowledge",
        tooltip: "Lets agents remember across sessions what a person or a team has learned, decided or prefers, so work never starts from zero.",
      },
    },

    agentRuntime: {
      name: "Agent Runtime",
      tooltip: "Where agents take action: the environments that run agent code and tools, isolated from everything else.",
      localToolServer: {
        name: "Local Tool Server",
        detail: "local engine, browser",
        tooltip: "Hosts the tools an agent uses right next to it in the runtime, such as a local execution engine and a web browser.",
      },
      sandbox: {
        name: "Sandbox",
        detail: "isolated agent code, shell, task harness",
        tooltip: "An isolated environment where agents run code and shell commands to complete tasks, without reaching anything they shouldn’t.",
      },
    },

    modelAccess: {
      name: "Model Access",
      tooltip: "How every request reaches a model: one entry point in front of the servers that run your models.",
      modelGateway: {
        name: "Model Gateway",
        detail: "routing - cache - quotas - key custody",
        tooltip: "The single front door to every model. It routes each request, caches answers, enforces quotas and keeps provider keys out of users’ hands.",
      },
      modelServer: {
        name: "Model Server",
        tooltip: "Runs models on your hardware and serves them through a standard API. It combines API serving, model lifecycle and an inference engine.",
        apiServing: {
          name: "API Serving",
          tooltip: "Exposes the model through a standard, OpenAI-compatible API, so anything upstream can call it.",
        },
        modelLifecycle: {
          name: "Model Lifecycle",
          tooltip: "Fetches, loads, updates and retires models on the server, and keeps track of their health.",
        },
        inferenceEngine: {
          name: "Inference Engine",
          tooltip: "Runs the model on the hardware and generates tokens as fast and efficiently as that hardware allows.",
        },
      },
    },

    toolAccess: {
      name: "Tool Access",
      tooltip: "How agents reach tools and data: one governed entry point in front of the servers that provide them.",
      toolGateway: {
        name: "Tool Gateway",
        detail: "aggregation, access policy, credential injection, server lifecycle",
        tooltip: "The single front door to every tool. It gathers tool servers in one place, decides who may use what, injects credentials so agents never hold them, and starts or stops servers as needed.",
      },
      toolServer: {
        name: "Tool Server",
        detail: "remote MCP, web search",
        tooltip: "Hosts the tools agents call remotely, such as MCP servers connected to your APIs and data, or web search.",
      },
    },

    registry: {
      name: "Registry",
      detail: "Artifact Supply: consumed at deploy/session init",
      tooltip: "The catalog of approved building blocks (skills, prompts, models and tools) that the stack draws from when it is deployed or a session starts.",
      skillRegistry: {
        name: "Skill Registry",
        tooltip: "Versioned skills: packaged instructions and resources that teach agents how to carry out specific tasks.",
      },
      promptRegistry: {
        name: "Prompt Registry",
        tooltip: "Versioned, reviewed prompts and system instructions, shared across teams instead of copied around.",
      },
      modelRegistry: {
        name: "Model Registry",
        tooltip: "The models approved to run on the stack, with their versions, sources and the settings to serve them on your hardware.",
      },
      toolRegistry: {
        name: "Tool Registry (MCP)",
        tooltip: "The directory of approved MCP tool servers that agents are allowed to discover and use.",
      },
    },

    security: {
      name: "Security",
      tooltip: "Cuts across every layer: who can access what, what goes in and out of models, and whether what you install can be trusted.",
      iam: {
        name: "IAM",
        detail: "authentication, authorization, access control",
        tooltip: "Identity and access management: verifies who people and agents are, and controls what each of them can reach.",
      },
      guardrails: {
        name: "Guardrails",
        detail: "input/output policy",
        tooltip: "Checks what goes into and comes out of models and agents against your policies, and blocks, redacts or flags what shouldn’t pass.",
      },
      registryScanners: {
        name: "Registry Scanners",
        detail: "supply-chain checks",
        tooltip: "Scan models, skills, prompts and tools before they enter the registries, to catch tampered or vulnerable artifacts.",
      },
    },

    observability: {
      name: "Observability",
      tooltip: "Cuts across every layer: what the stack is doing, what it costs and how agents reach their results.",
      telemetry: {
        name: "Telemetry Collection",
        detail: "OTel, logs, metrics, traces",
        tooltip: "Gathers logs, metrics and traces from every component into one place, using the OpenTelemetry (OTel) open standard.",
      },
      costUsage: {
        name: "Cost & Usage Analytics",
        detail: "spend, tokens",
        tooltip: "Shows who uses what: tokens and spend by team, model and application, to plan capacity and budgets.",
      },
      agentTracing: {
        name: "Agent Tracing",
        detail: "step-level traces",
        tooltip: "Follows an agent’s run step by step, through every model call, tool call and decision, to debug and audit its behavior.",
      },
    },

    controlPlane: {
      name: "Control Plane",
      tooltip: "Cuts across every layer: how operators install, configure, govern and tune the whole stack.",
      adminConsole: {
        name: "Admin Console",
        detail: "operate the stack",
        tooltip: "One place for operators to run the stack day to day: users, models, tools and settings.",
      },
      deployment: {
        name: "Deployment & Lifecycle",
        detail: "install, upgrade, config",
        tooltip: "Installs the stack, upgrades it safely and manages its configuration over time.",
      },
      policyTenancy: {
        name: "Policy & Tenancy",
        detail: "org-wide defaults",
        tooltip: "Sets organization-wide defaults and keeps teams or tenants apart, each with the right models, tools, limits and data boundaries.",
      },
      magicModel: {
        name: "MagicModel",
        detail: "auto-selector & optimisation",
        tooltip: "Automatically matches models to your hardware and to each request, and tunes how they are served for speed and cost.",
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
