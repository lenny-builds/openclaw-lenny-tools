# cron-cleaner

`cron-cleaner` analyzes cron job metadata and groups jobs into actionable categories without making any system changes.

## What it does

- Reads a JSON list of cron jobs.
- Flags jobs with noisy/error signals.
- Detects legacy trading-scan naming patterns.
- Produces advisory categories:
  - `SAFE_TO_DISABLE`
  - `REVIEW`
  - `CLEAN`
- Outputs either human-readable text or structured JSON.

## Inputs / Options

```text
--input <path>   Read cron jobs from a JSON file
--mock           Use built-in mock dataset
--format <type>  text|json (default: text)
--help, -h       Show help
```

### Expected input schema

A JSON array of job objects. Relevant fields:

- `name` (string)
- `schedule` (string, cron expression or descriptor)
- `consecutiveErrors` (number)
- `lastStatus` (`"ok"`, `"error"`, etc.)

## Example commands

From repository root:

```bash
node tools/cron-cleaner/cron-cleaner.js --mock
```

```bash
node tools/cron-cleaner/cron-cleaner.js --input tools/cron-cleaner/sample-jobs.json
```

```bash
node tools/cron-cleaner/cron-cleaner.js --input tools/cron-cleaner/sample-jobs.json --format json
```

## Output interpretation

- `SAFE_TO_DISABLE`: jobs matching legacy patterns; likely candidates for decommissioning.
- `REVIEW`: jobs with error indicators that require human investigation.
- `CLEAN`: no current signal indicating cleanup action.

Suggested actions are advisory only and intended to support operator decisions.

## Limitations

- Uses simple heuristics; not a full scheduler health engine.
- Cannot validate whether disabling a job is operationally safe.
- Does not connect to cron services directly; input must be provided as JSON.
- No automatic remediation is performed.
