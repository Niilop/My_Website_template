# Development context

This folder is shared context for maintainers and coding agents. It describes the current site and provides a place to plan work and hand it off. It is useful without any particular AI tool; agents that do not automatically read the root `AGENTS.md` should be directed there at the start of a session.

| File                               | What belongs here                                                                  | Update when                         |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| [PROJECT.md](PROJECT.md)           | Site purpose, audience, scope, content ownership, constraints, open questions      | The intended site changes           |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Implemented structure, content model, build and request flow, integrations, limits | The structure changes               |
| [DEVELOPMENT.md](DEVELOPMENT.md)   | Workflow, commands, validation, troubleshooting                                    | The way work is done changes        |
| [STATUS.md](STATUS.md)             | Current work, active plan links, blockers, next step                               | Substantial work finishes or pauses |
| [DECISIONS.md](DECISIONS.md)       | Significant choices, reasons, consequences                                         | A consequential decision is made    |
| [plans/](plans/README.md)          | Scoped implementation plans with acceptance checks and results                     | A substantial task needs tracking   |

The root [README](../README.md) is the user-facing guide (setup, branding, content, pages, deployment) and [docs/integrations.md](../docs/integrations.md) covers optional integrations. Link to them instead of duplicating. Source code and configuration establish implemented behavior; these documents explain intent and should be corrected when they disagree.

## Starting a project from this template

1. If a starter fits, apply it first (`npm run starter -- apply <name>`; see the root README). Then replace `PROJECT.md` with the new site's purpose, audience, pages, content owner (you or the client), and boundaries. Mark unanswered questions explicitly rather than guessing.
2. Decide the per-project options and record them in `DECISIONS.md`: hosting, contact form (off, own endpoint, or hosted service), CMS (none or which), analytics, languages.
3. Review `ARCHITECTURE.md` against what you keep; remove described sections you delete (blog, services, React filter).
4. Review `DEVELOPMENT.md` and root `AGENTS.md` for the actual environment and deployment.
5. Replace `STATUS.md` with the starting state and next step. Delete the template's plans (`plans/001-…`, `plans/002-…`) or keep them as references.
6. Create the first plan from `plans/TEMPLATE.md` when there is agreed work, and link it from `STATUS.md`.

## Keeping context useful

Update the affected documents in the same change as the implementation. A typo fix does not require updates across this folder. For a handoff, write only enough for the next developer to identify the current state, remaining work, and evidence. Mark assumptions, proposals, and blocked work clearly. Git retains previous versions; `STATUS.md` should remain a current snapshot.
