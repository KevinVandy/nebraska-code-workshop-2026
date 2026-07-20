# AGENTS.md

This repository is the TanStack workshop monorepo. It is intended to host workshop material, examples, exercises, and shared packages for the TanStack libraries.

## Agent Skills

Use the repo-local Turborepo skill when creating or modifying monorepo structure, tasks, workspace packages, caching, filters, CI, or development workflows:

```txt
.agents/skills/turborepo/SKILL.md
```

Claude and Codex use copied skill directories generated from the canonical source:

```txt
.claude/skills/turborepo
.codex/skills/turborepo
```

When adding or updating a skill, change `.agents/skills/<skill-name>` first, then run:

```bash
scripts/sync-agent-skills.sh
```

Cursor uses the adapter rule at:

```txt
.cursor/rules/turborepo.mdc
```

## Turborepo Defaults

- This repo uses Turborepo for orchestration.
- Prefer package tasks over root tasks.
- Root `package.json` scripts should delegate to `turbo run <task>`.
- Do not write shorthand commands like `turbo build` into committed scripts or CI; use `turbo run build`.
- Keep app and package task logic in the relevant workspace package.
- Use `"workspace:*"` for internal workspace dependencies.
- Add cache `outputs` for tasks that write files.
- Prefer package-level `turbo.json` files for package-specific overrides.
