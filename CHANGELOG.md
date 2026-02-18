# Changelog

All notable changes to this project will be documented in this file.

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
