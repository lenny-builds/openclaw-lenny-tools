# Relay Health Checker (V1)

Small Node CLI to assess OpenClaw Browser Relay readiness using saved JSON outputs.

> Why this exists: plain Node scripts cannot directly call OpenClaw tools by default.
> This checker consumes exported `browser.status` and `browser.tabs` JSON (or mock data) for now.

## Files

- `relay-health-checker.js` — main CLI script
- `sample-status.json` — sample status payload
- `sample-tabs.json` — sample tabs payload

## Usage

### 1) Run with mock data

```bash
node relay-health-checker.js --mock
```

### 2) Run with saved JSON files

```bash
node relay-health-checker.js --profile chrome --status ./sample-status.json --tabs ./sample-tabs.json
```

### 3) Help

```bash
node relay-health-checker.js --help
```

## Expected checks

- `browser.status` present
- profile appears in status payload
- `browser.tabs` present
- at least one X/Twitter tab found
- at least one X/Twitter tab looks relay-connected

## Exit codes

- `0` = HEALTHY
- `1` = DEGRADED
- `2` = UNHEALTHY
- `3` = script/runtime error

## Suggested integration flow (current)

1. Save JSON from OpenClaw tool calls:
   - `browser.status` output -> `status.json`
   - `browser.tabs` output -> `tabs.json`
2. Run this checker against those files.
3. Follow recommended fixes in output.

## TODO

- Direct OpenClaw API/tool integration once runtime bridge is available to plain Node CLIs.
