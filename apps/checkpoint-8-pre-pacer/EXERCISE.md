# Checkpoint: TanStack Pacer

The Book tab's search box fires a request on **every keystroke**. Fix it with
TanStack Pacer.

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
| 2 | `src/components/devtools.tsx` | Add the Pacer devtools plugin (one line) |

The shape: **keep the cheap thing instant, debounce the expensive thing.**
Local state updates on every keystroke so the input never feels laggy; only the
part that triggers a network request gets debounced.

**Exercise 1, step by step:**

1. Local state so typing stays instant:
   `const [searchText, setSearchText] = useState(filters.q ?? "")`
2. Debounce only the expensive part:
   `const commitSearch = useDebouncedCallback((v) => setFilter("q", v), { wait: 400 })`
3. The input's `onChange` calls **both** — `setSearchText` (instant) and
   `commitSearch` (debounced).
4. Now the second half: `?q=` can also change from *outside* the input (the
   back button, a shared link). Sync `searchText` from `filters.q` in an effect — but
   **skip the sync while the input is focused**, or it clobbers keystrokes that
   landed during the 400ms gap. Try it without the guard first and type fast.

## There's a second hook you'll meet next

`useDebouncedCallback` returns a debounced *function* — "call this later," which
is all the Book search needs. Pacer also has **`useDebouncer`**, which returns
the debouncer *object*: `.maybeExecute(value)` to schedule, plus `.cancel()` to
drop anything already pending.

You'll see `useDebouncer` in the next checkpoint's command palette, which uses
`.cancel()` to kill a keystroke that was debounced just before the palette
closed — without it, that stale timer fires after reopening and shows phantom
results under an empty input. No need to build it here; just know the two hooks
exist and why the object form earns its keep.

## Not in this checkpoint

The command palette and Casper aren't built yet — they arrive with the Hotkeys
and AI checkpoints.
