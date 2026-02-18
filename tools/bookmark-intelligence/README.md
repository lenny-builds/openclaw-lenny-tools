# bookmark-intelligence

`bookmark-intelligence` analyzes saved links/bookmarks and produces keyword-based topic clusters, repeated themes, a weekly digest, and suggested next actions.

## What it does

- Reads bookmarks from a local JSON file.
- Builds simple keyword-based topic clusters.
- Extracts top repeated themes.
- Generates a 5-bullet weekly digest.
- Suggests practical follow-up actions.
- Runs locally and does not modify any input files.

## Inputs / Options

```text
--input <path>        Read bookmarks from a JSON file (required)
--format <type>       Output format: text|json (default: text)
--top <number>        Limit top clusters/themes returned (default: 10)
--help, -h            Show help
```

CLI contract notes:

- Unknown arguments fail fast with a non-zero exit.
- Invalid or missing option values fail fast with a non-zero exit.
- `--help` always exits `0`.

## Expected input schema

A JSON array of bookmark objects. Typical fields:

- `url` (string)
- `title` (string)
- `notes` (string, optional)
- `tags` (string array, optional)
- `savedAt` (ISO datetime string, optional)

## Example commands

From repository root:

```bash
node tools/bookmark-intelligence/bookmark-intelligence.js --help
```

```bash
node tools/bookmark-intelligence/bookmark-intelligence.js --input tools/bookmark-intelligence/sample-input.json --format text --top 8
```

```bash
node tools/bookmark-intelligence/bookmark-intelligence.js --input tools/bookmark-intelligence/sample-input.json --format json --top 5
```

## Output interpretation

- **Topic clusters** group bookmarks by dominant keywords.
- **Top repeated themes** show the most recurrent concepts across saved links.
- **Weekly digest** summarizes collection patterns in exactly 5 bullets.
- **Suggested actions** are advisory prompts to improve curation and execution.

## Limitations

- Uses lightweight heuristics (no semantic embeddings).
- Keyword quality depends on title/notes/tag quality.
- Not a recommendation engine; results are guidance only.
