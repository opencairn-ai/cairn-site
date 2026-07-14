# OpenCairn Landing Page

This repo holds the public landing page for **OpenCairn**, hosted on Cloudflare. OpenCairn is an opinionated, enterprise-ready, open-source AI stack: the full vertical path from infrastructure up to a developer API and chat GUI, packaged to run on infrastructure the organization controls.

The page has one job: explain what OpenCairn is and collect emails from interested people via a waitlist signup.

## Confidentiality — read before writing any copy

Everything in this repo is public. The internal project context lives in a separate private repo (`~/Documents/cairn/`); do not copy from it without checking against this list. The page and this repo's contents must **never** mention:

- The engagement structure between the partner organizations
- Budget, timeline, or the phased discovery process
- Internal codenames or document names (SOW, discovery brief, insight-card IDs)
- Specific component selections (e.g. vLLM, LibreChat, Qdrant, Langfuse, OLMo). The stack layers may be described conceptually, but the picks are not yet public.

The public name is **OpenCairn**. Mozilla and Mila may be named as the partner organizations behind the project, but nothing beyond the fact of the partnership: no engagement details, roles, budget, or timeline.

## Public messaging

The headline is **opinionated and deployable**: no open, self-hostable assembly today gives an organization one opinionated install that spans infrastructure up to a developer API and a chat GUI, with cross-layer concerns handled by default. Existing open platforms stop partway up the stack; integrated platforms deliver the full surface only with lock-in.

Openness, no lock-in, an auditable supply chain, and a sovereign path are properties the packaging delivers — present them as consequences of the opinionated open assembly, not as the lead. Self-hosting alone is not the pitch; hyperscalers offer residency too.

Supporting frame: model capability is no longer the bottleneck. Deployment complexity, integration burden, and the gap between a model and a system an organization can run are the real barriers. The work is packaging, not invention — the value is coordination: a justified primary choice at each layer, documented well enough to change later, removing the fifty-decisions problem.

The eight stack layers, describable conceptually on the page:

1. **Application / API** — chat GUI and OpenAI-compatible developer API
2. **Agents / Orchestration** — durable agent workflows behind stable interop boundaries
3. **Retrieval / Memory** — RAG ingestion, vector search, and memory
4. **Evaluation / Observability** — tracing and evaluation on open standards
5. **Model Serving / Inference** — workload-tuned serving, single node to cluster
6. **Models** — open-weight models with clean licensing and provenance
7. **Data** — storage, pipelines, and the AI-facing glue between them
8. **Infrastructure** — Kubernetes-based GPU orchestration, no lock-in

Target reader: a CTO/CIO or IT administrator without deep ML experience who wants to run AI on infrastructure they control and is skeptical of operational burden and lock-in. Secondary reader: the Linux-plus-Python generalist who would actually install it.

## Voice

Crisp and informative, not sales-y. Explain, don't sell. This is a landing page, but the register stays factual: support claims, avoid hype language ("game-changing", "unleash", "revolutionary"), and prefer plain declarative sentences. US spelling, no em-dashes. Don't stack bold, italics, and nested bullets; prose is fine. One sentence often suffices.

Show drafts of substantive copy for review before writing them to files.

## Design system

Derived from the kickoff deck (`~/Documents/cairn/Cairn_Kickoff.pptx`). The brand motif is a cairn of painted stones (terracotta, chartreuse, magenta).

- Type: Space Grotesk for headings, DM Sans for body. Self-hosted via `@fontsource-variable/*`; no external font requests.
- Light theme: white content sections, cream `#EDE8DF` hero and CTA surfaces, dark slate `#24303A` text, gray `#6C7680` muted.
- Accent: terracotta `#C2653B` (buttons, eyebrow, layer numbers). Supporting tones used sparingly: plum `#5F185E`, sage `#5A7D6E`, chartreuse `#D4C22F` (hero stones illustration, favicon).
- Dark theme inverts to slate `#24303A` background with the accents lightened for contrast; both themes live as CSS variables in `src/styles/global.css`.

## Architecture

- **Framework**: Astro with the `@astrojs/cloudflare` adapter. All pages are prerendered static; the only server-rendered code is the waitlist API route.
- **Hosting**: Cloudflare Workers with static assets (not Pages — Workers is Cloudflare's recommended path for new projects). Deployed with `wrangler deploy`; config in `wrangler.jsonc`.
- **Waitlist**: `POST /api/waitlist` (Astro endpoint running in the Worker). Validates the email, verifies a Cloudflare Turnstile token server-side, then inserts into a **D1** database (`waitlist` table, email as primary key, idempotent insert). Schema migrations live in `migrations/`.
- **Spam protection**: Cloudflare Turnstile (invisible mode) on the form; secret key stored as a Worker secret, never committed.
- **Domain**: opencairn.ai via Cloudflare DNS.

Layout:

```
src/
├── pages/
│   ├── index.astro          # single landing page composed of section components
│   └── api/waitlist.ts      # the one server endpoint
├── components/              # Hero, Problem, StackLayers, Principles, WaitlistForm
├── layouts/Base.astro       # head, meta/OG tags, global styles
└── styles/global.css
```

Page sections, in order: hero with waitlist form, the problem (deployment, not capability, is the barrier), what OpenCairn is (opinionated packaging), the eight layers, the properties it delivers (open, no lock-in, auditable, sovereign), footer with repeated CTA.
