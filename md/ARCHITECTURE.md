# Implemented architecture

This describes the template as it exists. Proposed additions belong in [plans](plans/README.md) until implemented.

## Build and request flow

```text
src/content/**/*.md --(glob loader + zod schema, src/content.config.ts)--> content collections
src/site.config.ts + collections + components --> src/pages/*.astro --(astro build)--> dist/ (static HTML, CSS, JS islands, optimized images)
@astrojs/sitemap --> dist/sitemap-index.xml;  src/pages/robots.txt.ts --> dist/robots.txt

Optional (off by default): POST /api/contact --> src/pages/api/contact.ts (on-demand, needs adapter)
  --> lib/contact/handler.ts: honeypot + time check --> validate --> Turnstile (if configured) --> deliver (Resend | webhook)
```

| Location                                                               | Responsibility                                                                                                 |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [src/site.config.ts](../src/site.config.ts)                            | Name, URL, description, language, nav, header CTA, contact details, social links, contact form switch          |
| [src/styles/tokens.css](../src/styles/tokens.css)                      | Design tokens (colors, type, spacing, widths, borders) with dark-mode overrides                                |
| [src/styles/global.css](../src/styles/global.css)                      | Base element styles, focus, reduced motion, `.container`, `.grid`, `.prose` helpers                            |
| [src/layouts/BaseLayout.astro](../src/layouts/BaseLayout.astro)        | Document shell: `Seo`, favicon, skip link, `Header`, `<main>`, `Footer`; adds `.js` class to `<html>`          |
| [src/components/](../src/components/)                                  | Presentational Astro components; `Seo` builds title, description, canonical, Open Graph tags                   |
| [src/components/react/](../src/components/react/)                      | React islands; `ProjectFilter` is the only one                                                                 |
| [src/content.config.ts](../src/content.config.ts)                      | `projects`, `services`, `blog` collections and their schemas                                                   |
| [src/lib/content.ts](../src/lib/content.ts)                            | Draft filtering (drafts only in dev) and sort order                                                            |
| [src/lib/contact/](../src/lib/contact/)                                | Framework-free contact form logic: validation, spam checks, delivery; unit tested                              |
| [src/pages/](../src/pages/)                                            | Routes; `[id].astro` files generate detail pages from collections; `api/_contact.ts` is unrouted until renamed |
| [starters/](../starters/), [scripts/starter.ts](../scripts/starter.ts) | Alternative site versions (overlay files + removal list) and the `list`/`apply`/`verify` command               |
| [tests/unit/](../tests/unit/), [tests/e2e/](../tests/e2e/)             | `node:test` unit tests; Playwright page, navigation, gallery viewer, and React island tests                    |

## Content model

- `projects`: title, summary, date, optional cover `{src, alt}`, tags, featured, draft, links, gallery. Listing at `/projects/` (React filter island), detail at `/projects/<file-name>/`. Home shows up to three `featured` projects.
- `services`: title, summary, order, draft. Listed on `/services/` with body text; cards on the home page.
- `blog`: title, description, pubDate, updatedDate, optional cover, draft. Listing and detail under `/blog/`.
- Entry IDs come from file names. Images are referenced relative to the Markdown file and optimized by `astro:assets`.
- Empty collections render without errors (sections hidden or "nothing yet" message); the build logs a warning.

## Starters

A starter is `starters/<name>/starter.json` (`name`, `description`, `remove`) plus `files/`, which mirrors the repository root. `apply` deletes the `remove` paths, copies `files/` over the root, and deletes `starters/` (unless `--keep`); it refuses to run with uncommitted Git changes unless `--force`. Paths outside the repository are rejected. `verify` copies the repository to a temporary directory (symlinking `node_modules`), applies the starter, and runs `check`, `lint`, `test:unit`, and `test:e2e` with `CI=1`.

Starter files are full replacements: a starter's `site.config.ts`, `tokens.css`, `content.config.ts`, and `lib/content.ts` do not inherit later additions to the template's versions. Type or content-schema drift is caught by `verify`; a new CSS token is not, so add new tokens to each starter's `tokens.css`.

| Starter  | Replaces / adds                                                                                                                                                                                                                                                                                     | Removes                                                                                          |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `artist` | Config, tokens (serif headings, square corners), `works` collection (Markdown) and `exhibitions` (YAML via `file()` loader), home, works list (grouped by series), work detail (feature gallery, details list, enquiry `mailto:`, previous/next), about, logo, icons, social image, `works.spec.ts` | Projects, services, blog pages and content, `ProjectFilter`, template images, `projects.spec.ts` |

## Key behaviors

- Static output. `astro.config.ts` fails the build if the contact form is enabled without its route.
- Navigation: `aria-current="page"` for the current page, `"true"` for a parent section. The mobile menu is a disclosure button (Escape closes and restores focus). Without JavaScript, the menu stays expanded.
- Metadata: title template `Page · Site`, canonical from `site.url` + path, `og:image` defaults to `public/og-default.png`; detail pages generate a 1200×630 image from their cover. `noindex` for 404 and `/contact/sent/`, which is also excluded from the sitemap.
- Theme follows `prefers-color-scheme`; there is no manual toggle.
- Gallery: `grid` (cropped tiles), `natural` (equal-height rows sized by aspect ratio), `feature` (first image large). Items without `href` open in a `<dialog>` viewer (arrow keys, swipe, Escape; focus returns to the thumbnail); without JavaScript they link to the large image. Items with `href` link to a page.
- Contact form: honeypot and minimum fill time always; a missing timestamp (no JavaScript) is allowed; Turnstile when `TURNSTILE_SECRET_KEY` is set. Spam gets a success response without delivery. Unconfigured delivery gives 503. Origin checking is Astro's default `security.checkOrigin`.

## Current limits

- No rate limiting on the contact endpoint beyond spam checks; add it at the host/CDN if abuse occurs.
- No RSS feed, search, manual theme toggle, or cookie consent.
- Browser tests run in Chromium only.
- The gallery viewer has no pinch-zoom or deep links to a specific image.
- The React filter duplicates card markup from `Card.astro`; keep their styles aligned when changing cards.

These are extension points to assess for a concrete website, not an automatic backlog.
