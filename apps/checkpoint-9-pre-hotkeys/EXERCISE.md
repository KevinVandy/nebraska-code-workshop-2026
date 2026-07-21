# Checkpoint: TanStack Hotkeys

This checkpoint introduces a **command palette** and a **keyboard-shortcuts
cheat-sheet** — both fully built, but reachable only by clicking. Your job is to
wire up TanStack Hotkeys so the app is keyboard-driven.

**Answer key:** `apps/checkpoint-10-pre-ai` — but try it yourself first.

## Setup

```bash
pnpm dev:server                              # json-server on :3300 (repo root)
pnpm --filter checkpoint-9-pre-hotkeys dev     # this app on :5559
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## New in this checkpoint

The `src/components/shortcuts/` folder is scaffolding you didn't build — read
it, don't rewrite it:

- **`command-palette.tsx`** — the ⌘K palette. Its flight search is already
  debounced with `useDebouncer` + `.cancel()`, the object-form hook the Pacer
  checkpoint pointed you at. Open it from the header's **Search** button.
- **`shortcuts-dialog.tsx`** — the cheat-sheet modal.
- **`shortcut-registry.ts`** — the *display* data the cheat-sheet renders.
- **`shortcuts-provider.tsx`** — holds the palette/cheat-sheet state and hosts
  both dialogs. This is where your TODOs live.
- The header's **Search** button already shows a `⌘K` hint — a label for a
  shortcut that doesn't exist yet. Wiring it is TODO 1.

## The exercise

All the TODOs are in `src/components/shortcuts/shortcuts-provider.tsx`:

| # | What you'll build |
|---|-------------------|
| 1 | Six `useHotkey` registrations, auth-gated with `{ enabled }` |
| 2 | The hooks they depend on (`useAuth`, `useNavigate`) |
| 3 | The Hotkeys devtools plugin (one line in `devtools.tsx`) |

| Shortcut | Action |
|---|---|
| `Mod+K` | Toggle the command palette |
| `Mod+/` | Toggle the keyboard-shortcuts cheat-sheet |
| `Mod+1` `Mod+2` `Mod+3` | Overview / Book a Flight / Flight Status |
| `Mod+P` | Profile |

`Mod` is ⌘ on macOS and Ctrl everywhere else — you write it once.

The registry is *display only*: the `useHotkey` calls you write are the real
registrations, so if you add a shortcut, add a row to `shortcut-registry.ts`
too.

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

Casper isn't built yet — the AI assistant, its header button, and its `Mod+J`
shortcut all arrive in the next checkpoint.
