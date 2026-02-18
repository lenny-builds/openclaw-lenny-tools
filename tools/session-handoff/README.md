# session-handoff

`session-handoff` converts local JSON notes/tasks/context into a concise operator handoff brief.

## What it does

- Reads handoff context from a local JSON file.
- Produces:
  - current status
  - blockers
  - next 3 actions
  - ready-to-send update text
- Runs locally and does not modify input files.

## Inputs / Options

```text
--input <path>        Read handoff payload from JSON file (required)
--format <type>       Output format: text|json (default: text)
--help, -h            Show help
```

CLI contract notes:

- Unknown arguments fail fast with a non-zero exit.
- Invalid or missing option values fail fast with a non-zero exit.
- `--help` always exits `0`.

## Expected input schema

A JSON object. Common fields:

- `project` (string)
- `owner` (string)
- `status` (string)
- `progress` (string, optional)
- `context` (string, optional)
- `blockers` (string array, optional)
- `nextActions` (string array, optional)
- `tasks` (string array, optional)
- `timestamp` (ISO datetime string, optional)

## Example commands

From repository root:

```bash
node tools/session-handoff/session-handoff.js --help
```

```bash
node tools/session-handoff/session-handoff.js --input tools/session-handoff/sample-handoff-input.json --format text
```

```bash
node tools/session-handoff/session-handoff.js --input tools/session-handoff/sample-handoff-input.json --format json
```

## Output interpretation

- **Current status** combines provided status/progress/context into one clean summary.
- **Blockers** lists active issues (or explicitly states none).
- **Next 3 actions** ensures exactly three practical follow-ups.
- **Ready-to-send update** is copy-ready status text for chat/email updates.

## Limitations

- Output quality depends on clarity of input notes.
- No external system lookups; this is local summarization only.
