# openclaw-lenny-tools

A curated collection of small, practical OpenClaw-compatible CLI tools for diagnostics, housekeeping, and workflow safety.

This repository is designed as a **local-first toolbelt**: easy to clone, easy to run, easy to review.

## Quick Start

```bash
git clone https://github.com/<your-org>/openclaw-lenny-tools.git
cd openclaw-lenny-tools
```

Run a tool directly with Node:

```bash
node tools/cron-cleaner/cron-cleaner.js --mock
```

## Tools Index

| Tool | Purpose | Run Command |
|---|---|---|
| `cron-cleaner` | Detects noisy cron jobs and provides non-destructive cleanup guidance. | `node tools/cron-cleaner/cron-cleaner.js --mock` |
| `relay-health-checker` | Evaluates Browser Relay readiness from saved `browser.status` / `browser.tabs` JSON inputs. | `node tools/relay-health-checker/relay-health-checker.js --mock` |

## Repository Structure

```text
openclaw-lenny-tools/
├── .github/
│   ├── ISSUE_TEMPLATE.md
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── TOOLING_GUIDE.md
├── tools/
│   ├── cron-cleaner/
│   │   ├── cron-cleaner.js
│   │   ├── README.md
│   │   └── sample-jobs.json
│   ├── relay-health-checker/
│   │   ├── relay-health-checker.js
│   │   ├── README.md
│   │   ├── sample-status.json
│   │   └── sample-tabs.json
│   └── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Usage Philosophy

- **Safety first:** tools should default to advisory, non-destructive behavior.
- **Transparency:** outputs should explain why a result was produced.
- **Composability:** tools should be scriptable in local shells and CI.
- **Minimal dependencies:** prefer plain Node scripts unless complexity requires more.

## Safety Notes

- Review suggested actions before applying operational changes.
- Validate commands in staging when possible.
- Treat all automation as assistive; keep a human in the loop for destructive actions.

## Roadmap

- Add direct OpenClaw tool/API integration where runtime support allows.
- Expand tool coverage for monitoring and daily operations checks.
- Introduce lightweight validation tests for tool inputs and outputs.
- Provide examples for CI usage and scheduled checks.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for branch workflow, commit style, and PR checklist.

## License

MIT — see [LICENSE](LICENSE).
