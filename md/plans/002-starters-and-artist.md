# 002 — Starters and artist portfolio

- Status: complete
- Updated: 2026-09-27
- Branch / PR: main (uncommitted at time of writing)
- Related decisions: D007

## Goal

Offer different versions of the template (artist portfolio now, CV later) from one repository, without duplicating shared components or merging between branches.

## Scope

- Included: starter mechanism (`list`, `apply`, `verify`) and CI job; shared gallery layouts (`natural`, `feature`) and full-screen viewer; artist starter (works, series, exhibitions, pages, styling, placeholder artworks, tests); docs.
- Deferred: CV starter; viewer pinch-zoom and deep links; RSS.
- Constraints: no page-builder framework; each starter results in an ordinary Astro site.

## Acceptance checks

- [x] `npm run starter -- list` shows the artist starter; `apply` refuses with uncommitted changes, and leaves no `starters/` folder.
- [x] The applied artist site passes check, lint, unit, and all browser/accessibility tests (light and dark, desktop and mobile).
- [x] The gallery viewer works by mouse, keyboard, and touch, returns focus, and has no axe violations while open; it works in both the template and the artist starter.
- [x] The template's own checks still pass.

## Validation results

| Check / command                    | Result                                                       | Context                                                                      |
| ---------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `npm run check`, `lint` (template) | Pass                                                         | Local, Node 24.21                                                            |
| `npm run test:e2e` (template)      | 18 pass, 2 skipped (viewport-specific)                       | Host Chromium                                                                |
| `npm run starter -- verify`        | artist: check, lint, unit 12/12, e2e 18 pass, 2 skipped      | Temporary copy                                                               |
| Visual review (screenshots)        | Home, works, work, about, viewer; light/dark; desktop/mobile | Fixed: opaque viewer, logo in dark mode, lead image framing, short last rows |
| CI on GitHub                       | Not run yet                                                  | Runs on first push                                                           |

## Handoff / completion

- Implemented: as scoped above.
- Remaining: CV starter when needed; replace placeholder artworks and texts when used for a real site.
- Next concrete step: define the CV starter's pages and content model in a new plan.
