# Checkpoint: TanStack Pacer

Two search boxes in this app fire a request on **every keystroke**. Fix both
with TanStack Pacer.

**Answer key:** `apps/checkpoint-9-pre-hotkeys` — but try it yourself first.

## Setup

```bash
pnpm dev:server                           # json-server on :3300 (repo root)
pnpm --filter checkpoint-8-pre-pacer dev    # this app on :5558
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## See the problem first

Open **Dashboard → Book a Flight**, open your Network tab, and type `salem`
into the Search box. Five characters, five navigations, five requests — and
because the API has a deliberate 1s delay, the table visibly thrashes as
out-of-order responses land.

That's what you're fixing.

## The exercises

| # | File | What you'll build |
|---|------|-------------------|
| 1 | `src/routes/_app/dashboard/book.tsx` | `useDebouncedCallback` — split instant typing from the debounced URL write |
| 2 | `src/components/shortcuts/command-palette.tsx` | `useDebouncer` — same idea, but you need `.cancel()` |
| 3 | `src/components/devtools.tsx` | Add the Pacer devtools plugin (one line) |

The shape both share: **keep the cheap thing instant, debounce the expensive
thing.** Local state updates on every keystroke so the input never feels laggy;
only the part that triggers a network request gets debounced.

**Exercise 1, step by step:**

1. Local state so typing stays instant:
   `const [searchText, setSearchText] = useState(filters.q ?? "")`
2. Debounce only the expensive part:
   `const commitSearch = useDebouncedCallback((v) => setFilter("q", v), { wait: 400 })`
3. The input's `onChange` calls **both** — `setSearchText` (instant) and
   `commitSearch` (debounced).
4. Now the second half: `?q=` can also change from *outside* the input (back
   button, the palette). Sync `searchText` from `filters.q` in an effect — but
   **skip the sync while the input is focused**, or it clobbers keystrokes that
   landed during the 400ms gap. Try it without the guard first and type fast.

## Two hooks, two jobs

- **`useDebouncedCallback`** returns a debounced *function*. Use it when all
  you need is "call this later."
- **`useDebouncer`** returns the debouncer *object* — `.maybeExecute(value)` to
  schedule, `.cancel()` to drop anything pending. Exercise 2 needs `.cancel()`,
  and there's a real bug if you skip it: type in the palette, hit Escape within
  300ms, reopen — the stale timer fires and shows phantom results under an
  empty input. Reproduce it before you fix it.

## Not in this checkpoint

- No keyboard shortcuts yet — open the palette with the header's **Search**
  button. (TanStack Hotkeys is the next checkpoint.)
- Casper's panel opens but is empty; the AI assistant comes later.
