# Tools Directory

This folder contains production-facing tool packages.

## Conventions

- One tool per subdirectory under `tools/`.
- Each tool includes:
  - executable script(s)
  - local sample input/output fixtures (when useful)
  - a `README.md` with purpose, options, examples, output interpretation, and limitations
- Keep tools non-destructive by default.

## Available Tools

- [`bookmark-intelligence`](./bookmark-intelligence/README.md) — cluster saved links into themes with weekly digest and suggested actions.
- [`cron-cleaner`](./cron-cleaner/README.md) — classify noisy cron jobs and suggest safe cleanup actions.
- [`relay-health-checker`](./relay-health-checker/README.md) — assess Browser Relay readiness using exported status/tab JSON.
- [`session-handoff`](./session-handoff/README.md) — generate concise operator handoff briefs from local JSON notes/tasks/context.
