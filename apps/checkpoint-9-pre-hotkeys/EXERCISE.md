# Checkpoint: TanStack Hotkeys

Ghost Airlines has a command palette and a keyboard-shortcuts cheat-sheet, but
neither has a keyboard shortcut — you can only get to them by clicking. Make
the app keyboard-driven.

**Answer key:** `apps/checkpoint-10-pre-ai` — but try it yourself first.

## Setup

```bash
pnpm dev:server                              # json-server on :3300 (repo root)
pnpm --filter checkpoint-9-pre-hotkeys dev     # this app on :5559
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercise

All the TODOs are in `src/components/shortcuts/shortcuts-provider.tsx`:

| # | What you'll build |
|---|-------------------|
| 1 | Seven `useHotkey` registrations, auth-gated with `{ enabled }` |
| 2 | The hooks they depend on (`useAuth`, `useCasper`, `useNavigate`) |
| 3 | The Hotkeys devtools plugin (one line in `devtools.tsx`) |

| Shortcut | Action |
|---|---|
| `Mod+K` | Toggle the command palette |
| `Mod+J` | Toggle Casper |
| `Mod+/` | Toggle the keyboard-shortcuts cheat-sheet |
| `Mod+1` `Mod+2` `Mod+3` | Overview / Book a Flight / Flight Status |
| `Mod+P` | Profile |

`Mod` is ⌘ on macOS and Ctrl everywhere else — you write it once.

**Given to you:** the command palette and cheat-sheet dialogs (both fully
built), the provider's state and context, and `shortcut-registry.ts` — the
display data the cheat-sheet renders. Note the registry is *display only*: the
`useHotkey` calls you write are the real registrations, so if you add a
shortcut, add a row there too.

## Things to try

- **Sign out and mash the shortcuts.** Nothing should fire — that's `enabled`.
- **Write `useHotkey("Shift+/", ...)`** and read the type error. TanStack
  Hotkeys refuses Shift+punctuation on purpose, because which character that
  produces depends on the keyboard layout. That's why the cheat-sheet uses
  `Mod+/` (the Slack convention) instead of `?`.
- **Forget `e.preventDefault()`** on `Mod+K` and watch the browser's own search
  bar open on top of your palette.
- **Open the devtools panel** after TODO 3 and look at the Hotkeys tab — it
  lists every registration and flags conflicts.

## Not in this checkpoint

Casper's panel opens but is empty — the AI assistant is built in the next
checkpoint. Toggling it with `Mod+J` still works, which is all you need here.
