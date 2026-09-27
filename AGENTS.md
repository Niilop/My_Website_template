# Working in this repository

## Start here

- Read [md/README.md](md/README.md) for the development context map.
- Read [project context](md/PROJECT.md), [current status](md/STATUS.md), and [architecture](md/ARCHITECTURE.md) before changing site behavior or structure. Follow any active plan linked from the status file.
- Use [development guidance](md/DEVELOPMENT.md) for setup, conventions, and validation. Consult [decisions](md/DECISIONS.md) when changing an established approach.
- Check the actual code and working tree. Documentation may be stale; report and correct discrepancies. Planned work is not implemented behavior.

## Conventions

- Astro 7 + TypeScript (strict), static output. Pages in `src/pages/`, components in `src/components/`, content in `src/content/` with schemas in `src/content.config.ts`.
- Site-wide values come from `src/site.config.ts`; visual values come from CSS variables in `src/styles/tokens.css`. Do not hard-code brand names, URLs, contact details, or colors in components.
- Compose pages from the existing components (`Hero`, `Section`, `Card`, `Button`, `Gallery`). Keep one `<h1>` per page (from `Hero` or the page itself). Do not build a page-builder abstraction or configuration language.
- Use Astro components and small `<script>` blocks by default. Use React (`src/components/react/`, hydrated with `client:*`) only for stateful interactive UI.
- Images: import from `src/assets/` and render with `astro:assets` (`Image`, `getImage`) so dimensions and formats are generated. Every image needs meaningful `alt` text, or `alt=""` if decorative.
- Accessibility is a requirement: semantic HTML, keyboard operability, visible focus, sufficient contrast in light and dark themes, reduced-motion support.
- Optional sections (blog, services, projects, React filter, contact form) must remain removable without breaking the build. Guard empty collections.
- Starters (`starters/<name>/`) are alternative site versions applied with `npm run starter -- apply <name>`. Shared components stay in `src/`; a starter's `files/` holds only what differs. When changing a shared component, config field, token, or test, check whether starters need the same change (a starter's `site.config.ts` and `tokens.css` are full replacements), and run `npm run starter -- verify`. `starters/` is excluded from `astro check` and ESLint in the template itself; `verify` checks them after applying.
- Secrets only in environment variables declared in `astro.config.ts` (`env.schema`) and documented in `.env.example`. Never commit `.env` or real keys.
- Prefer existing dependencies and the platform. Use npm (project-local). Ask before installing anything globally, including browser system libraries.

## Verify

```bash
npm run format:check && npm run lint && npm run check && npm run test:unit
npm run test:e2e          # builds, then Playwright (needs Chromium + system libraries)
npm run test:e2e:docker   # same, in the Playwright Docker image, if host libraries are missing
```

`npm run verify` runs all of it. After changing shared code or a starter, also run `npm run starter -- verify`. Run checks relevant to the change and report what actually ran and the results; if a check could not run (for example, missing browser libraries), say so rather than presenting it as passed. Documentation-only changes need link/path checks, not the full suite.

## Working style

- Explain the plan before multi-file changes. Keep changes focused on the user's request.
- For substantial work, create or update a plan from [md/plans/TEMPLATE.md](md/plans/TEMPLATE.md). Small fixes do not need a plan file.
- Preserve unrelated local changes. These documents provide context, not permission to deploy, publish, or modify external services.

## Leave useful context

- Update architecture when structure, content model, or integrations change; record consequential choices in decisions; update project context when goals or scope change.
- Update the active plan and status when substantial work finishes or pauses: what changed, validation results, remaining work, next step.
- Update the README when a user-facing workflow (branding, content, pages, deployment) changes.
- Keep these files short and current. Git holds history; do not paste transcripts or command output logs.

When this template becomes a new website, follow the initialization checklist in `md/README.md` before treating template examples as requirements.
