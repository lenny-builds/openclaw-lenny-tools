# Tooling Guide

This guide provides a central reference for all tools in `openclaw-lenny-tools`.

## Principles

- Local-first execution with plain Node CLI commands.
- Non-destructive defaults where practical.
- Clear and inspectable outputs for operators.
- Lightweight scripts over heavy frameworks.

## Tool Catalog

## 1) cron-cleaner

**Path:** `tools/cron-cleaner/`

**Purpose:**
Classify cron jobs by noise/health indicators and provide cleanup guidance.

**Run:**

```bash
node tools/cron-cleaner/cron-cleaner.js --mock
```

or

```bash
node tools/cron-cleaner/cron-cleaner.js --input tools/cron-cleaner/sample-jobs.json --format text
```

**When to use:**

- Reviewing stale/noisy scheduled jobs.
- Preparing a controlled cron cleanup pass.
- Generating an operator-readable action plan.

## 2) relay-health-checker

**Path:** `tools/relay-health-checker/`

**Purpose:**
Evaluate OpenClaw Browser Relay readiness from saved status/tab payloads.

**Run:**

```bash
node tools/relay-health-checker/relay-health-checker.js --mock
```

or

```bash
node tools/relay-health-checker/relay-health-checker.js --profile chrome --status tools/relay-health-checker/sample-status.json --tabs tools/relay-health-checker/sample-tabs.json
```

**When to use:**

- Troubleshooting relay-connected browser automation.
- Confirming relay setup before running automations.
- Producing consistent health checks in scripts/CI.

## Suggested Operator Workflow

1. Use mock mode to validate script behavior.
2. Run against real exported data.
3. Review categories/recommendations.
4. Apply operational changes manually (staging first when possible).

## Documentation Standard for New Tools

Every new tool under `tools/*` should include:

- `README.md` with:
  - What it does
  - Inputs/options
  - Example commands
  - Output interpretation
  - Limitations
- Optional sample JSON fixtures for reproducible testing.
- Changelog entry describing the addition.
