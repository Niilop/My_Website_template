# Development workflow

## Environment and setup

Node 22.18+ (24 in `.nvmrc` and CI) with npm. The maintainer's environment is Linux/WSL2. Nothing else is required to develop or build: no accounts, keys, databases, or services.

```bash
npm install
npm run dev        # http://localhost:4321
```

Astro 7 starts `astro dev`/`astro preview` in the background when it detects an AI agent. Manage it with `astro dev status|logs|stop`. The Playwright config passes `--ignore-lock` to keep its preview server in the foreground.

## Implementing a change

1. Check the working tree and read the relevant context and code. Confirm what already exists.
2. For substantial work, define the outcome, scope, and acceptance checks in a [plan](plans/TEMPLATE.md).
3. Use the existing structure: config in `site.config.ts`, tokens in `tokens.css`, content schemas in `content.config.ts`, pages composed from `src/components/`. Add props to existing components before creating near-duplicates.
4. New content fields: update the schema, the example Markdown, the pages that render them, and the README example if user-facing.
5. New environment variables: declare in `astro.config.ts` `env.schema`, document in `.env.example` and `docs/integrations.md`.
6. Run relevant checks; update context documents and the README when workflows change.

## Validation

| Command                            | Checks                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run format:check`             | Prettier (with the Astro plugin)                                                                     |
| `npm run lint`                     | ESLint: JS, TypeScript, Astro recommended rules                                                      |
| `npm run check`                    | `astro check`: types in `.astro`/`.ts`/`.tsx`, content schemas                                       |
| `npm run test:unit`                | `node --test tests/unit/`: contact validation, spam checks, delivery (fake fetch)                    |
| `npm run test:e2e`                 | Builds, serves `dist/` with `astro preview`, runs Playwright on desktop and mobile Chromium          |
| `npm run verify`                   | All of the above, in CI order                                                                        |
| `npm run starter -- verify [name]` | Applies each starter in a temporary copy and runs check, lint, unit, and e2e there (CI's second job) |

Run `npm run starter -- verify` after changing shared components, config fields, tokens, schemas, or tests, since starters reuse them. A failed run keeps the temporary copy and prints its path for inspection.

The e2e suite reads the sitemap to find pages, so new pages are covered automatically. Per page: status 200, one `h1`, title, description, absolute canonical and `og:image`, no `img` without `alt`, no script errors, and axe WCAG 2.1 A/AA with no violations in light and dark themes. Also: 404 page and status, robots.txt, gallery viewer (first page with a gallery, including axe with the viewer open), skip link, mobile menu keyboard behavior, `aria-current`, and the React filter.

Unit tests import `.ts` files directly using Node's type stripping, so files in `src/lib/contact/` must use erasable TypeScript only (no enums or namespaces) and relative imports with `.ts` extensions.

Chromium needs system libraries. If `npm run test:e2e` fails with an error like `libnspr4.so: cannot open shared object file`, the host lacks them. Either install them (`npx playwright install-deps chromium`, uses sudo; ask first) or run `npm run test:e2e:docker`, which uses `mcr.microsoft.com/playwright` at the pinned `@playwright/test` version. Report missing libraries as an environment limit, not a site failure.

CI (`.github/workflows/ci.yml`) runs the same commands on pushes to `main` and on pull requests, and uploads the Playwright report on failure. Dependabot opens weekly grouped updates; `@playwright/test` minor/patch updates are ignored so it stays in step with the Docker tag; update both manually.

## Common issues

- Build error about front matter: the message names the file and field; compare with `src/content.config.ts`.
- Image not found: paths in front matter are relative to the Markdown file (`../../assets/images/...`).
- Wrong canonical or social URLs: `url` in `site.config.ts` must be the production origin.
- Accessibility test fails on contrast after a color change: adjust the token in both light and dark sections of `tokens.css`.
- `Process from config.webServer exited early`: another preview server holds the port or lock; run `npx astro preview stop`.

## Finishing or handing off

Record changed behavior, check results, unresolved issues, and the next step in the active plan. Keep [STATUS.md](STATUS.md) short and link to that plan or PR. Do not record credentials or full command output.
