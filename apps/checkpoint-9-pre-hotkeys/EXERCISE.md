# Checkpoint 9: TanStack Hotkeys

This checkpoint introduces a command palette and a keyboard-shortcuts
cheat-sheet — both fully built, but reachable only by clicking. Wire up
TanStack Hotkeys so the app is keyboard-driven.

**Answer key:** `apps/checkpoint-10-pre-ai`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:9        # this app on :5559
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## New in this checkpoint

- `src/components/shortcuts/` is new scaffolding: the command palette (already
  debounced with `useDebouncer` + `.cancel()`), the cheat-sheet dialog, the
  display-only shortcut registry, and the provider that hosts them.
- The header's Search button opens the palette and already shows a `⌘K` hint —
  which does nothing yet. That's yours.

## The exercises

All in `src/components/shortcuts/shortcuts-provider.tsx`:

1. Register the six global hotkeys from the cheat-sheet with `useHotkey`,
   active only while signed in.
2. Wire up the hooks they need (`useAuth`, `useNavigate`).
3. Add the Hotkeys devtools plugin in `src/components/devtools.tsx`.
