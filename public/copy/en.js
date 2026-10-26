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
    title: "Cairn: The open source AI inference stack architecture",
    description: "An open architecture for the AI inference stack: clear interface contracts between every layer and component, swappable parts, and a reference implementation built from the best open source components. A Mozilla × Mila research collaboration.",
  },

  header: {
    codename: "codename:",
    languageLabel: "Language",
    download: "Download image",
    downloadBusy: "Preparing image…",
    downloadFailed: "Download failed, try again",
    github: "Follow us on GitHub",
    githubUrl: "https://github.com/opencairn-ai",
  },

  intro: {
    eyebrow: "Technical Teaser",
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
        title: "The best of open source can plug in",
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
  //   detail:  the smaller line under the name (optional; only the Registry has one)
  //   tooltip: the short description that pops up on hover, tap or keyboard focus
  stack: {
    local: {
      name: "Local",
      tooltip: "Above the line: the applications and the SDKs people, running locally on their own devices or in their product. Reach the stack through an API.",
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
      tooltip: "Your organization’s searchable documents and the long-term memory of its agents.",
      semanticSearch: {
        name: "Semantic Search System",
        tooltip: "Turns your documents into searchable knowledge: ingests and indexes them, then retrieves by both meaning and keywords to ground answers.",
      },
      agentMemory: {
        name: "Agent Memory System",
        tooltip: "Centralized memory that lets agents remember across sessions and devices what a person or a team has learned, decided or prefers.",
      },
    },

    agentRuntime: {
      name: "Agent Runtime",
      tooltip: "The environments that run agent code and tools, isolated from everything else.",
      localToolServer: {
        name: "Local Tool Server",
        tooltip: "Hosts the tools an agent uses right next to it in the runtime, such as a local execution engine and a web browser.",
      },
      sandbox: {
        name: "Sandbox",
        tooltip: "An isolated environment where agents run code and shell commands to complete tasks.",
      },
    },

    modelAccess: {
      name: "Model Access",
      tooltip: "One entry point in front of the servers that run your models.",
      modelGateway: {
        name: "Model Gateway",
        tooltip: "The single point of entry to every model. It routes each request, caches answers, enforces quotas and unify access to model providers.",
      },
      modelServer: {
        name: "Model Server",
        tooltip: "Runs models on your hardware and serves them through a standard API. It combines API serving, model lifecycle and an inference engine.",
      },
    },

    toolAccess: {
      name: "Tool Access",
      tooltip: "One governed entry point in front of the servers that run your tools.",
      toolGateway: {
        name: "Tool Gateway",
        tooltip: "The single point of entry to every tool. It gathers tool servers in one place, decides who may use what, injects credentials, and starts or stops servers as needed.",
      },
      toolServer: {
        name: "Tool Server",
        tooltip: "Hosts the tools agents call remotely, such as tool servers connected to your APIs and data, or web search.",
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
        tooltip: "Versioned, reviewed prompts and system instructions, shared across teams.",
      },
      modelRegistry: {
        name: "Model Registry",
        tooltip: "The models approved to run on the stack, with their versions, sources and the settings to serve them on your hardware.",
      },
      toolRegistry: {
        name: "Tool Registry",
        tooltip: "The directory of approved tool servers that agents are allowed to discover and use.",
      },
    },

    security: {
      name: "Security",
      tooltip: "Cuts across every layer. Who can access what, what goes in and out of any component, and whether vetted registry elements can be trusted.",
      iam: {
        name: "Identity Access Management",
        tooltip: "Verifies who people and agents are, and controls what each of them can reach.",
      },
      guardrails: {
        name: "Guardrails",
        tooltip: "Checks what goes into and comes out of models and agents against your policies, and blocks, redacts or flags what shouldn’t pass.",
      },
      registryScanners: {
        name: "Registry Scanners",
        tooltip: "Scan models, skills, prompts and tools before they enter the registries, to catch tampered or vulnerable artifacts.",
      },
    },

    observability: {
      name: "Observability",
      tooltip: "Cuts across every layer. What the stack is doing, what it costs and how agents reach their results.",
      telemetry: {
        name: "Telemetry Collection",
        tooltip: "Gathers logs, metrics and traces from every component into one place.",
      },
      costUsage: {
        name: "Cost & Usage Analytics",
        tooltip: "Shows tokens and spend by team, model and application, to plan capacity and budgets.",
      },
      agentTracing: {
        name: "Agent Tracing",
        tooltip: "Follows an agent’s run step by step, through every model call, tool call and decision.",
      },
    },

    controlPlane: {
      name: "Control Plane",
      tooltip: "Cuts across every layer. How operators install, configure, govern and maintain the whole stack.",
      adminConsole: {
        name: "Admin Console",
        tooltip: "One place for operators to run the stack day to day.",
      },
      deployment: {
        name: "Deployment & Lifecycle",
        tooltip: "Installs the stack, upgrades it safely and manages its configuration. This includes model lifecyle.",
      },
      policyTenancy: {
        name: "Policy & Tenancy",
        tooltip: "Sets organization-wide defaults and keeps teams or tenants apart, each with the right models, tools, limits and data boundaries.",
      },
      magicModel: {
        name: "Hardware-to-Model Selector",
        tooltip: "Automatically matches models to your hardware, use cases and workloads, and optimize the configuration for speed.",
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
