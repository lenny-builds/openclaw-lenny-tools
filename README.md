# openclaw-lenny-tools

A dedicated local repository for packaging and shipping OpenClaw-compatible tools.

## Purpose

This repo is the canonical home for reusable tool assets (scripts, templates, and diagnostics) that are intended to be versioned, reviewed, and published.

## Install / Use Philosophy

- Keep tools self-contained and documented.
- Prefer simple, local-first workflows (`git clone`, inspect, run).
- Add clear README docs per tool so usage is discoverable without external context.
- Treat this repository as a shipping surface: changes should be intentional and traceable.

## Layout

- `tools/` — individual tools, each in its own folder
- `CHANGELOG.md` — human-readable release/change history

## Tools

- `tools/relay-health-checker` — validates relay status and tab connectivity snapshots.
- `tools/cron-cleaner` — detects noisy cron jobs and suggests safe, non-destructive cleanup actions.

