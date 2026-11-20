# Security

## Report a vulnerability

Send an email to **security@opencairn.ai**, or click **Report a vulnerability**
on the Security tab of this repository. Do not open a public issue for a security
problem.

Tell us:

- what you found,
- how to reproduce it,
- what an attacker can do with it.

If you have a proof of concept, include it. If you are not sure that the problem
is a vulnerability, send it.

## What to expect

We are a small team before the Alpha release. We acknowledge reports when we
can. We do not promise a response time or a date for a fix. We tell you what we
will do about your report. When we fix the problem, we credit you, unless you
ask us not to.

## Scope

This repository holds the website opencairn.ai. In scope:

- the pages and scripts in `public/`,
- the deployment workflow in `.github/workflows/`,
- how we configure the services that host the site.

Not in scope:

- **The Cairn stack** has its own repository. Report a vulnerability in the
  stack to the same address.
- **The services that host the site** (GitHub Pages and Cloudflare). If the
  problem is in the service itself, report it to GitHub or to Cloudflare. If the
  problem is in how we configure the service, it is in scope.

## Supported versions

Only the site that is on opencairn.ai now: the `main` branch.
