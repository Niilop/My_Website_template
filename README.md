# Website template

A reusable Astro + TypeScript starter for portfolios, business websites, landing pages, and blogs. Pages are static HTML by default, content is Markdown, branding is set in one config file and one stylesheet, and React is available for interactive parts.

**What's included:** accessible header with mobile menu, footer, buttons, cards, sections, image gallery; home, about, services, projects (list + detail), blog (optional), contact, and 404 pages; page metadata, social previews, sitemap, robots.txt, optimized images; formatting, linting, type checking, unit tests, browser and accessibility tests, CI; an optional contact form with server validation and spam protection.

## Quick start

Requirements: Node.js 22.18 or newer (24 recommended, see `.nvmrc`) and npm. No accounts, API keys, or external services are needed to run it.

```bash
npm install
npm run dev        # http://localhost:4321, reloads on save
```

| Command                   | What it does                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| `npm run dev`             | Start the development server                                          |
| `npm run build`           | Build the production site into `dist/`                                |
| `npm run preview`         | Serve `dist/` locally to check the production build                   |
| `npm run check`           | Type-check Astro, TypeScript, and content front matter                |
| `npm run lint`            | Lint with ESLint                                                      |
| `npm run format`          | Format all files with Prettier (`format:check` only reports)          |
| `npm run test:unit`       | Unit tests (Node's built-in test runner)                              |
| `npm run test:e2e`        | Build, then run browser and accessibility tests with Playwright       |
| `npm run test:e2e:docker` | Same, inside the Playwright Docker image (no browser install on host) |
| `npm run verify`          | Format check, lint, type check, unit and e2e tests                    |
| `npm run starter -- list` | Show the available [starters](#starters) (alternative site versions)  |

Browser tests need Chromium once: `npx playwright install chromium`. On Linux/WSL, Chromium also needs system libraries (`npx playwright install-deps chromium`, which uses sudo). If you would rather not install those, use `npm run test:e2e:docker`.

## Project structure

```text
src/
  site.config.ts        Site name, URL, navigation, contact details, social links, contact form switch
  styles/tokens.css     Colors, fonts, spacing, widths, borders (light and dark)
  styles/global.css     Base element styles and a few layout helpers
  assets/brand/         Logo (logo.svg)
  assets/images/        Images used by pages and content (optimized at build time)
  components/           Header, Footer, Button, Card, Section, Hero, Gallery, ContactForm, ...
  components/react/     React components (interactive "islands")
  layouts/BaseLayout.astro   Page shell: metadata, header, main, footer
  pages/                One file per route: index.astro -> /, about.astro -> /about/
  content/              Markdown content: projects/, services/, blog/
  content.config.ts     Front matter schemas for the content folders
  lib/                  Content helpers and contact form logic
public/                 Files served as-is: favicon.svg, apple-touch-icon.png, og-default.png
tests/unit/, tests/e2e/ Unit tests and Playwright browser tests
docs/integrations.md    Contact form, CMS, analytics, fonts, languages, React
starters/               Alternative versions of the site (e.g. artist portfolio); see Starters
scripts/starter.ts      The `npm run starter` command
md/, AGENTS.md          Development context for maintainers and AI coding agents
```

## Starters

The template ships as a general portfolio / small-business site. **Starters** are alternative versions that reuse the same components, checks, and deployment but change the pages, content model, and look:

| Starter  | For                                                                                                       |
| -------- | --------------------------------------------------------------------------------------------------------- |
| _(none)_ | Portfolio or small business: services, projects, blog                                                     |
| `artist` | Artists: works with medium, dimensions, series, availability; exhibitions; image-first layout, serif type |

To use one, do it first, in a fresh copy of the template:

```bash
npm run starter -- list           # see what is available
npm run starter -- apply artist   # swap in the artist version
npm run dev
```

`apply` deletes the example files the starter doesn't use, copies the starter's files into place, and removes the `starters/` folder, leaving an ordinary site. It refuses to run with uncommitted changes. Everything below (branding, content, pages, deployment) then works the same way.

<details>
<summary>How starters work, and how to add one</summary>

A starter is a folder `starters/<name>/` containing:

- `starter.json`: a name, a one-line description, and `remove`, the list of template files and folders to delete (for example `src/pages/blog`).
- `files/`: files copied over the template, at the same paths (for example `files/src/site.config.ts`, `files/src/pages/index.astro`). Only include files that differ.

Shared building blocks (header, footer, gallery and viewer, buttons, layout, SEO) stay in `src/` so that improvements reach every starter. Put a component in a starter only if it is specific to that kind of site.

`npm run starter -- verify` applies each starter in a temporary copy and runs the type check, lint, unit tests, build, and browser tests there. CI runs it on every push. To add a starter: copy `starters/artist/` as an example, change `starter.json`, replace the files, and run `verify`.

</details>

## Turn the template into a real website

Work through this checklist for each new project:

- [ ] **Version:** if a [starter](#starters) fits (e.g. `artist`), apply it first.
- [ ] **Identity:** edit `src/site.config.ts`: name, production `url`, description, language, navigation, contact details, social links.
- [ ] **Look:** adjust colors and fonts in `src/styles/tokens.css` (both light and dark sections).
- [ ] **Logo and icons:** replace `src/assets/brand/logo.svg`, `public/favicon.svg`, `public/apple-touch-icon.png` (180×180), and `public/og-default.png` (1200×630 social preview).
- [ ] **Home and about text:** edit `src/pages/index.astro` and `src/pages/about.astro`.
- [ ] **Content:** replace the example Markdown in `src/content/` and the images in `src/assets/images/`.
- [ ] **Remove what you don't need:** blog, services, projects, the React filter (see below).
- [ ] **Contact form:** leave it off (email/phone only) or enable it with [docs/integrations.md](docs/integrations.md#contact-form).
- [ ] **Project context:** replace the template documentation in `md/` (see [For AI agents and maintainers](#for-ai-agents-and-maintainers)).
- [ ] **Check and deploy:** run `npm run verify`, then [deploy](#deploy).

## Common tasks

### Change the branding

1. **Name, URL, navigation, contact details, social links:** `src/site.config.ts`. Each field has a comment. Set `url` to the real domain; canonical links, the sitemap, and social previews use it.
2. **Colors, typography, spacing, widths, borders:** CSS variables in `src/styles/tokens.css`. Components only use these variables, so changing `--color-accent` changes every button and link. Update the dark-mode block too, and run the tests: the accessibility check fails on low color contrast in either theme.
3. **Logo:** replace `src/assets/brand/logo.svg` (the header shows it at 32×32 next to the site name).
4. **Favicon and social image:** replace the files in `public/` with the same names.
5. **Fonts:** the default is the system font stack (fast, no downloads). To use a custom or Google font, see [docs/integrations.md](docs/integrations.md#fonts).

### Replace the content

Repeatable content is Markdown in `src/content/`, one file per entry. The file name becomes the URL (`src/content/projects/my-project.md` → `/projects/my-project/`).

```markdown
---
title: My project
summary: One sentence shown on cards and in search results.
date: 2026-03-01
cover:
  src: ../../assets/images/my-project.jpg
  alt: Describe what the image shows.
tags: [Design]
featured: true # show on the home page
draft: false # drafts are visible in `npm run dev` only
---

The body is regular Markdown.
```

- The allowed fields for each folder are defined in `src/content.config.ts`. If front matter is wrong, `npm run check` or `npm run build` names the file and field.
- Put images in `src/assets/images/` and reference them relative to the Markdown file. They are resized and converted to WebP automatically. Every image needs `alt` text; use `alt: ''` only for purely decorative images.
- Files starting with `_` are ignored, which is handy for keeping a template entry.
- Text on non-repeating pages (home, about, contact) is written directly in the page files in `src/pages/`.

### Add a page

Create a file in `src/pages/`. For example, `src/pages/pricing.astro` becomes `/pricing/`:

```astro
---
import Hero from '../components/Hero.astro';
import Section from '../components/Section.astro';
import Button from '../components/Button.astro';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Pricing" description="Plans and prices.">
  <Hero title="Pricing" lead="Simple, transparent pricing." />
  <Section title="Plans">
    <p>Your content here.</p>
    <Button href="/contact/">Ask for a quote</Button>
  </Section>
</BaseLayout>
```

Then add `{ label: 'Pricing', href: '/pricing/' }` to `nav` in `src/site.config.ts` if it belongs in the menu. The page is added to the sitemap and the browser tests automatically.

Available components (props are documented at the top of each file in `src/components/`):

| Component               | Use                                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Hero`                  | Page title (`<h1>`), lead text, optional image and buttons. One per page.                                              |
| `Section`               | A titled block of content with width (`narrow`/`default`/`wide`) and `muted` tone                                      |
| `Card`                  | Title, text, optional image and link. Use inside `<ul class="grid">`                                                   |
| `Button`                | Link (`href`) or button; `primary`/`secondary`/`ghost`, three sizes                                                    |
| `Gallery`               | Image gallery with a full-screen viewer; `grid`, `natural` (keeps proportions), or `feature` (one large image) layouts |
| `Tags`, `FormattedDate` | Small helpers for content pages                                                                                        |

### Remove an example section

Each example can be removed without affecting the rest. Run `npm run check && npm run build` afterwards.

- **Blog:** delete `src/pages/blog/` and `src/content/blog/`, remove the `Blog` entry from `nav` in `src/site.config.ts`, and remove the `blog` collection from `src/content.config.ts`.
- **Services or projects:** to hide them, delete the Markdown files; the home page skips empty sections and list pages show a short "nothing yet" message. To remove them entirely, also delete the page folder (`src/pages/services/` or `src/pages/projects/`), the `nav` entry, the section in `src/pages/index.astro`, the helper in `src/lib/content.ts`, and the collection in `src/content.config.ts`.
- **A section of a page:** delete the `<Section>…</Section>` block from the page file.
- **The React example:** replace `<ProjectFilter …/>` in `src/pages/projects/index.astro` with a `<ul class="grid">` of `<Card>`s (as on the home page) and delete `src/components/react/ProjectFilter.tsx`. To drop React completely, also remove `react()` from `astro.config.ts` and uninstall `@astrojs/react react react-dom @types/react @types/react-dom`.
- **Example images:** delete unused files in `src/assets/images/`. The build fails with a clear message if something still references one.

## Deploy

The site builds to static files in `dist/`, which any static host can serve. The documented path is **Netlify**, configured in `netlify.toml`:

1. Set `url` in `src/site.config.ts` to the production address and push the repository to GitHub (or GitLab/Bitbucket).
2. In Netlify, choose **Add new project → Import an existing project** and select the repository. The build command (`npm run build`), output folder (`dist`), and Node version are read from `netlify.toml`.
3. Deploy. Netlify then rebuilds on every push to the main branch and creates preview deploys for pull requests.
4. Add a custom domain under **Domain management** and make sure it matches `url` in the config.

Other hosts (Cloudflare Pages, Vercel, GitHub Pages, any web server) work with the same build command and `dist/` folder. The contact form is the exception: it needs a server adapter for your host (see [docs/integrations.md](docs/integrations.md#contact-form)).

### Environment variables and secrets

The default site uses no environment variables. The optional contact form reads its delivery service and spam-protection keys from environment variables listed in `.env.example`:

- Locally: copy `.env.example` to `.env` and fill in values. `.env` is ignored by Git. Never commit real keys.
- In production: set the same variables in the host's dashboard (Netlify: **Project configuration → Environment variables**).
- Variables are declared and validated in `astro.config.ts` (`env.schema`). Server secrets are read at runtime and never included in the browser bundle; only names starting with `PUBLIC_` are exposed to the browser.

## Checks and CI

`npm run verify` runs the same checks as CI's main job (`.github/workflows/ci.yml`): Prettier, ESLint, `astro check`, unit tests, a production build, and Playwright tests at desktop and mobile sizes. The browser tests visit every page in the sitemap and check the title, description, canonical URL, social image, image alt attributes, and axe accessibility rules (WCAG 2.1 AA, light and dark themes), plus keyboard use of the skip link and mobile menu, the gallery viewer, and the 404 page. New pages are covered automatically. A second CI job runs `npm run starter -- verify`, which checks every starter the same way.

Dependabot (`.github/dependabot.yml`) opens weekly grouped update PRs. `@playwright/test` is pinned to match the Docker image tag in the `test:e2e:docker` script; update both together.

## Optional integrations

See [docs/integrations.md](docs/integrations.md) for the contact form, a CMS for client editing, analytics, custom fonts, multiple languages, and adding React components.

## For AI agents and maintainers

- [AGENTS.md](AGENTS.md) contains project conventions and verification commands for coding agents (Claude Code reads it through `CLAUDE.md`).
- [md/](md/README.md) holds the development context: project brief, architecture, development workflow, status, decisions, and implementation plans.

When you start a new website from this template, replace the template's own context: follow the checklist in [md/README.md](md/README.md#starting-a-project-from-this-template) to rewrite `md/PROJECT.md` and `md/STATUS.md` for the new site, review the other files, and replace this README's intro with a description of the new site.
