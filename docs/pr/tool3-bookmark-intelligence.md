# Tool #3 PR: bookmark-intelligence (MVP)

## Summary
Adds `tools/bookmark-intelligence/` to analyze local bookmark JSON exports and generate concise insight output:
- keyword-based topic clusters
- repeated theme detection
- weekly digest bullets
- practical next actions

This tool is local-only and non-destructive.

## Validation
Run from repo root:

```bash
node tools/bookmark-intelligence/bookmark-intelligence.js --help
node tools/bookmark-intelligence/bookmark-intelligence.js --input tools/bookmark-intelligence/sample-input.json --format text --top 8
node tools/bookmark-intelligence/bookmark-intelligence.js --input tools/bookmark-intelligence/sample-input.json --format json --top 5
```

Expected:
- `--help` exits 0 and shows documented flags
- sample runs produce structured analysis output without modifying inputs

## Risk notes
- Low operational risk: read-only local processing
- Heuristic output quality depends on bookmark title/notes/tag quality
- No network calls, credentials, or external side effects
