# Architecture and development decisions

Record choices that future maintainers would otherwise have to rediscover. Routine edits belong in Git history. Proposed decisions are not permission to implement them.

## D001 — Static Astro site with React islands

- Status: accepted template baseline.
- Date: 2026-09-27.
- Decision: Astro 7 with `output: 'static'`; Astro components by default, React (`@astrojs/react`) only for stateful interactive UI.
- Reason: content-focused sites are fastest and cheapest as static HTML; Astro allows React where it is useful without making every page a client app.
- Consequences: features needing a server (contact form) require an adapter and on-demand routes; pages otherwise need a rebuild to change.

## D002 — Configuration file and CSS tokens, not a page builder

- Status: accepted template baseline.
- Decision: one TypeScript config (`src/site.config.ts`) for site facts and CSS variables (`src/styles/tokens.css`) for visual design; pages are ordinary `.astro` files composed from components.
- Reason: easy rebranding without a custom abstraction to learn; editors change text in pages and Markdown.
- Consequences: non-developers edit pages via a CMS or with help; structural changes are code changes.

## D003 — Contact form off by default, with explicit delivery

- Status: accepted template baseline.
- Decision: ship the form and endpoint disabled (`_contact.ts` is unrouted). Enabling requires an adapter, an explicit delivery service (Resend or webhook), and has honeypot + time-trap spam checks, with optional Turnstile. No silent fallback delivery.
- Reason: the default site must run and deploy statically without accounts; a form that silently drops messages is worse than none.
- Consequences: each project decides delivery and hosting; the build fails if the form is enabled without its route.

## D004 — System fonts by default

- Status: accepted template baseline.
- Decision: system font stack; custom fonts through the Astro Fonts API when a project needs them.
- Reason: no network access at build time, no layout shift, no third-party requests.

## D005 — Netlify as the documented deployment

- Status: accepted template baseline.
- Decision: document one path (Netlify, `netlify.toml`). `dist/` remains deployable anywhere static.
- Reason: Git-connected deploys with previews and no base-path complications; its adapter supports the optional contact form.
- Consequences: projects on other hosts add their own config and, if needed, adapter; record that choice here.

## D006 — Tooling: node:test for unit tests, Playwright + axe for browser tests

- Status: accepted template baseline.
- Decision: unit tests with Node's built-in runner (type stripping, no extra framework); Playwright with `@axe-core/playwright` against the production build, discovering pages from the sitemap. `eslint-plugin-jsx-a11y` is not used because it does not support ESLint 10 yet; axe covers rendered accessibility.
- Reason: fewer dependencies; tests follow the site's actual pages without maintenance.
- Consequences: unit-tested modules must be framework-free and use erasable TypeScript. A Docker script covers hosts without Chromium system libraries; `@playwright/test` is pinned to the image version.

## D007 — Site versions as starter overlays on main

- Status: accepted.
- Date: 2026-09-27.
- Context: different kinds of sites (general portfolio, artist, later CV) share most components, checks, and deployment but differ in pages, content model, and look.
- Decision: keep one branch. Shared components live in `src/`; each version is `starters/<name>/` with a removal list and overlay files, applied once with `npm run starter -- apply <name>`. CI verifies every starter in a temporary copy.
- Alternatives: a branch or repository per version (simple, but every shared improvement has to be merged into each and they drift); a runtime theme/config switch (turns the template into a page-builder framework).
- Consequences: a small copy script to maintain; starter files are full replacements, so new config fields or tokens must be added to each starter (type drift is caught by `verify`, CSS tokens are not). Apply a starter before customizing; there is no way to switch afterwards.
- References: [plan 002](plans/002-starters-and-artist.md), `scripts/starter.ts`.

## Adding a decision

```markdown
## D00N — Short decision title

- Status: proposed | accepted | superseded by D00N
- Date: YYYY-MM-DD
- Context: the problem and relevant constraints.
- Decision: the choice and why it fits.
- Alternatives: meaningful options considered, if any.
- Consequences: costs, limitations, and follow-up work.
- References: related plan, code, issue, or PR.
```

When a choice changes, mark the old entry superseded and link the replacement. When copying the template, review whether these baseline decisions still apply.
