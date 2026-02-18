# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-02-18
### Added
- Added `tools/session-handoff` (Tool #4).
- Implemented `session-handoff.js` CLI with `--input`, `--format text|json`, and `--help`.
- Added handoff brief output sections: current status, blockers, next 3 actions, and ready-to-send update text.
- Added tool docs and fixtures:
  - `tools/session-handoff/README.md`
  - `tools/session-handoff/.env.example`
  - `tools/session-handoff/sample-handoff-input.json`
- Added PR validation notes file: `docs/pr/tool4-session-handoff.md`.

### Changed
- Updated root `README.md` tools index and repository structure tree for `session-handoff`.
- Updated `tools/README.md` tool catalog.

## [0.3.0] - 2026-02-18
### Added
- Added `CONTRIBUTING.md` with branch workflow, commit guidance, and PR checklist.
- Added MIT `LICENSE`.
- Added GitHub templates:
  - `.github/ISSUE_TEMPLATE.md`
  - `.github/PULL_REQUEST_TEMPLATE.md`
- Added central documentation guide: `docs/TOOLING_GUIDE.md`.

### Changed
- Rewrote root `README.md` with professional project overview, quick start, tools index, structure tree, roadmap, and safety/usage philosophy.
- Standardized tool documentation format across `tools/*`.
- Updated `tools/README.md` with current tool catalog and conventions.
- Expanded `tools/cron-cleaner/README.md` with options, output interpretation, and limitations.
- Expanded `tools/relay-health-checker/README.md` with options, examples, output interpretation, and limitations.

## [0.2.0] - 2026-02-18
### Added
- Added `tools/cron-cleaner` (Tool #2).
- Implemented `cron-cleaner.js` CLI with `--input`, `--mock`, and `--format text|json` options.
- Added noisy-job detection rules for errors and legacy trading scan naming patterns.
- Added advisory output categories: `SAFE_TO_DISABLE`, `REVIEW`, and `CLEAN` plus suggested actions.
- Added tool documentation (`tools/cron-cleaner/README.md`) and sample dataset (`sample-jobs.json`).

## [0.1.0] - 2026-02-18
### Added
- Initialized `openclaw-lenny-tools` repository structure.
- Added root documentation (`README.md`).
- Added baseline `.gitignore` for Node/common development artifacts.
- Added `tools/README.md` for tool organization conventions.
- Imported existing `tools/relay-health-checker` asset (copied; original left untouched).
