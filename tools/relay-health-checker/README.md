# relay-health-checker

`relay-health-checker` is a lightweight CLI that evaluates OpenClaw Browser Relay readiness using saved JSON payloads.

## What it does

- Loads `browser.status` and `browser.tabs` JSON exports (or mock data).
- Checks whether the target profile appears in status data.
- Detects X/Twitter tabs and relay-connection signals.
- Prints a readable health report with recommendations.
- Exits with machine-friendly status codes.

## Inputs / Options

```text
--profile, -p <name>  Browser profile name (default: chrome)
--status <path>       Path to browser.status JSON
--tabs <path>         Path to browser.tabs JSON
--mock                Use built-in mock payloads
--help, -h            Show help
```

## Example commands

From repository root:

```bash
node tools/relay-health-checker/relay-health-checker.js --mock
```

```bash
node tools/relay-health-checker/relay-health-checker.js --profile chrome --status tools/relay-health-checker/sample-status.json --tabs tools/relay-health-checker/sample-tabs.json
```

```bash
node tools/relay-health-checker/relay-health-checker.js --help
```

## Output interpretation

Overall states:

- `HEALTHY` — all checks passed.
- `DEGRADED` — some checks failed; relay may work inconsistently.
- `UNHEALTHY` — multiple critical checks failed.

Exit codes:

- `0` = HEALTHY
- `1` = DEGRADED
- `2` = UNHEALTHY
- `3` = runtime/script error

## Limitations

- Relies on exported JSON snapshots, not live OpenClaw tool calls.
- Connection detection is heuristic (string matching for relay/attached signals).
- Focused on X/Twitter tab checks for relay workflows.
- Does not remediate issues automatically.
