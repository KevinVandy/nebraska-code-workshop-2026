# CLAUDE.md

This repository is the TanStack workshop monorepo for workshop material, examples, exercises, and shared packages across the TanStack libraries.

## Skills

Use the repo-local Turborepo skill for monorepo setup, task pipelines, caching, filters, CI, workspace package structure, and package boundaries:

```txt
.claude/skills/turborepo/SKILL.md
```

The canonical skill content lives at:

```txt
.agents/skills/turborepo
```

The Claude skill path is a copied sync target. When `.agents/skills` changes, run:

```bash
scripts/sync-agent-skills.sh
```

## Turborepo Defaults

- Prefer package tasks over root tasks.
- Root `package.json` scripts should delegate to `turbo run <task>`.
- Use `turbo run` in committed scripts and CI.
- Keep task logic in workspace packages whenever possible.
- Use `"workspace:*"` for internal workspace dependencies.
- Configure task `outputs` when a task writes files.
