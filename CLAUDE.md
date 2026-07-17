# Cairn Landing Page

Public landing page for **Cairn** (domain: opencairn.ai), a collaboration between Mila and Mozilla on the architecture of an opinionated, sovereign, open source AI stack. The page has one job: explain what Cairn is and point people at the GitHub org (https://github.com/opencairn-ai).

## Confidentiality — read before writing any copy

Everything in this repo is public. Internal project context lives in a separate private repo (`~/Documents/cairn/`); do not copy from it. The page must never mention:

- The engagement structure, budget, timeline, or phased discovery process
- Internal codenames or document names (SOW, discovery brief, insight-card IDs)
- Specific component selections (e.g. vLLM, LibreChat, Qdrant, Langfuse, OLMo). The stack layers may be described conceptually, but the picks are not yet public.

Mila and Mozilla are named as partners. Do not go beyond what the page already says about their roles (Mozilla convening and investing, Mila leading the research).

## Messaging

Model capability is no longer the bottleneck; deployment is. Cairn is foundational research on the architecture of a stack organizations can actually run: eight conceptual layers (application, orchestration, retrieval/memory, evaluation/observability, model serving, models, data, infrastructure) plus cross-cutting concerns. The aspiration: be for open source AI what Ubuntu was for Linux — a curated, opinionated distribution.

## Voice

Crisp and informative, not sales-y. Explain, don't sell. Support claims, avoid hype language, prefer plain declarative sentences. US spelling, no em-dashes. Show drafts of substantive copy for review before writing them to files.

## Architecture

Plain static site — no framework, no build step. `public/` is served as-is by Cloudflare Workers static assets (`wrangler deploy`, config in `wrangler.jsonc`, custom domain route to opencairn.ai; workers.dev and preview URLs disabled).

The page exists in English (`/`) and French (`/fr/`), linked by the EN/FR toggle in the top-right corner and `hreflang` alternates in both heads. Copy changes must be applied to both files.

```
public/
├── index.html            # the whole page (English)
├── fr/index.html         # French version (root-absolute asset paths)
├── css/styles.css
├── assets/               # header video (webm+mp4), logo, arrow, partner logos
├── robots.txt            # Pre-launch: blocks all crawlers
└── .assetsignore
```

Local preview: `npx wrangler dev` → http://localhost:8787.

## Design

Dark theme: purple-to-green gradient background (`#1d0d26` → `#283f33`), white text, magenta accent `#fd70f5`, gold `#b09273`. Space Grotesk throughout, loaded from Google Fonts. Tokens are CSS variables at the top of `css/styles.css`.

## Pre-launch state

The site is unlisted until launch: `noindex` meta tag and `robots.txt` disallow (both marked with `Pre-launch` comments), plus a Cloudflare Access gate configured in the dashboard, not in this repo. At launch: remove the two markers, delete the Access application, redeploy.
