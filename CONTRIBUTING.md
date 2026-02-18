# Contributing

Thanks for contributing to `openclaw-lenny-tools`.

## Workflow

1. Fork/clone and create a feature branch from `main`:
   - `feat/<short-name>` for features
   - `docs/<short-name>` for documentation
   - `fix/<short-name>` for bug fixes
2. Make focused changes (one concern per PR).
3. Run basic manual verification for touched tool(s).
4. Commit with clear messages.
5. Open a pull request to `main`.

## Commit Style

Use concise, imperative commit messages:

- `Add relay checker JSON edge-case handling`
- `Improve cron-cleaner output docs`
- `Update changelog for v0.3.0`

Recommended prefixes:

- `feat:` new functionality
- `fix:` bug fixes
- `docs:` documentation updates
- `chore:` maintenance and structure work

## Pull Request Checklist

- [ ] Tool behavior remains backward compatible (or change is clearly documented).
- [ ] Tool README(s) updated (what it does, options, examples, outputs, limitations).
- [ ] Root docs updated if new tools/files were added.
- [ ] `CHANGELOG.md` includes a concise entry.
- [ ] No destructive defaults were introduced.
- [ ] Scripts run successfully with sample/mock data.
