# cron-cleaner

Detect noisy cron jobs and generate non-destructive cleanup guidance.

## Features

- Reads cron jobs from a JSON file (`--input`) or built-in mock data (`--mock`)
- Flags noisy jobs using these rules:
  - `consecutiveErrors > 0`
  - `lastStatus == "error"`
  - legacy trading scan name match (`paper trade`, `market scan`, `wallet tracker`, case-insensitive)
- Produces three output lists:
  - `SAFE_TO_DISABLE`
  - `REVIEW`
  - `CLEAN`
- Outputs suggested actions in advisory mode (no destructive actions)
- Supports text or JSON output (`--format text|json`)

## Usage

From repo root:

```bash
node tools/cron-cleaner/cron-cleaner.js --mock
```

```bash
node tools/cron-cleaner/cron-cleaner.js --input tools/cron-cleaner/sample-jobs.json
```

```bash
node tools/cron-cleaner/cron-cleaner.js --input tools/cron-cleaner/sample-jobs.json --format json
```

## Input format

`--input` should point to a JSON array of job objects, for example:

```json
[
  {
    "name": "Nightly Backfill",
    "schedule": "0 2 * * *",
    "consecutiveErrors": 1,
    "lastStatus": "ok"
  }
]
```
