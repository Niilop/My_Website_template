# 001 — Template baseline

- Status: complete
- Updated: 2026-09-27
- Branch / PR: main (uncommitted at time of writing)
- Related decisions: D001–D006

## Goal

A reusable Astro + TypeScript starter that someone unfamiliar with the repository can rebrand, fill with content, extend with a page, trim, and deploy by following the README.

## Scope

- Included: config and tokens; accessible components; home, about, services, projects (list + detail), blog, contact, 404; content collections; metadata, sitemap, robots, images; optional contact form; formatting, linting, type checks, unit/browser/accessibility tests, CI, Dependabot; Netlify deploy; README, integration guide, AGENTS.md, md/.
- Deferred: CMS, analytics, custom fonts, i18n (documented extension points only); RSS; theme toggle.

## Acceptance checks

- [x] Runs locally with `npm install && npm run dev`, no accounts or keys.
- [x] Branding in `src/site.config.ts` and `src/styles/tokens.css`; logo, favicon, and social image are replaceable files.
- [x] All pages pass metadata and axe WCAG 2.1 AA checks in light and dark themes at desktop and mobile sizes.
- [x] Blog can be removed and projects/services emptied without breaking type checks, build, or tests.
- [x] Contact form enables with an adapter and delivers via webhook; validation, honeypot, origin check, and unconfigured (503) behavior confirmed.
- [x] CI workflow runs format, lint, type, unit, build, and browser checks.

## Validation results

| Check / command                                          | Result                                                                                                                                                                                | Context                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `npm run format:check`, `lint`, `check`                  | Pass (0 errors, 0 warnings)                                                                                                                                                           | Local, Node 24.21                                           |
| `npm run test:unit`                                      | 12/12 pass                                                                                                                                                                            | Local                                                       |
| `npm run test:e2e`                                       | 16 pass, 2 skipped (viewport-specific by design)                                                                                                                                      | Host Chromium, after `npx playwright install-deps chromium` |
| `npm run test:e2e:docker`                                | 16 pass, 2 skipped                                                                                                                                                                    | Playwright 1.63.0 image                                     |
| Blog removed + projects/services emptied (scratch copy)  | check, build, e2e pass (12 pass, 6 skipped as no projects)                                                                                                                            | Build logs empty-collection warnings                        |
| Contact form enabled with `@astrojs/node` (scratch copy) | Valid → webhook delivered; invalid → 400 with field errors; honeypot → 200, not delivered; no-JS → 303 `/contact/sent/`; cross-origin → 403; unconfigured → 503; axe passes with form | Local fake webhook                                          |
| CI on GitHub                                             | Not run yet                                                                                                                                                                           | Runs on first push                                          |

## Handoff / completion

- Implemented: as scoped above.
- Remaining: first CI run on GitHub; replace the placeholder images and copy when used for a real site.
- Deviations: `eslint-plugin-jsx-a11y` omitted (no ESLint 10 support); axe tests cover rendered accessibility.
