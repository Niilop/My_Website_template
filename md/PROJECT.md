# Project context

## Current purpose

This repository is a reusable Astro + TypeScript website starter for portfolios, business websites, landing pages, and blogs, used for personal and client projects. It does not yet describe a specific website. Replace this file when creating one.

## Users and deliverable

- Current users: developers (and coding agents) starting a website.
- Deliverable: a runnable, deployable static site whose branding, content, and example sections can be changed or removed by following the README.
- Acceptance criterion: someone unfamiliar with the repository can follow the README to change the branding, replace content, add a page, remove an example section, and deploy, without first understanding every component.

## Included scope

- Central configuration (`src/site.config.ts`) and design tokens (`src/styles/tokens.css`).
- Small accessible component library; home, about, services, projects (list + detail), blog, contact, 404 pages.
- Markdown content collections with typed schemas.
- Metadata, social previews, sitemap, robots.txt, optimized images, light/dark themes.
- Formatting, linting, type checking, unit, browser, and accessibility tests in CI; Netlify deployment.
- Optional contact form (off by default) with server validation, spam protection, and configurable delivery.

## Boundaries

Keep the starter small and domain-neutral. CMS, analytics, custom fonts, multiple languages, and other hosts are documented extension points, not implemented features. Avoid a page-builder framework or a large configuration language: pages are composed from ordinary components.

## Constraints

- Runs locally without accounts, API keys, or external services.
- Static output by default; on-demand routes only for opt-in features that need a server.
- Secrets live in environment variables only.
- npm for dependencies; Node 22.18+ (24 recommended).

## Questions to answer for a new website

- Who is the site for, and what should a visitor do (contact, buy, read, apply)?
- Which pages and content types are needed at launch; which template sections are removed?
- Who edits content after launch: the developer (Markdown) or the client (CMS)?
- Is a contact form needed, and where should messages go?
- Where is it hosted, and what domain? Any analytics, privacy, or language requirements?
