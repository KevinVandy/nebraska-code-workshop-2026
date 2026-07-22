# Checkpoint 8: TanStack Pacer

The Book tab's search box fires a request on every keystroke: five
characters, five navigations, five requests against a 1-second API. Fix it
with TanStack Pacer.

**Answer key:** `apps/checkpoint-9-pre-hotkeys`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:8        # this app on :5558
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then
type into the Book tab's search box with the Network tab open.

## The exercises

1. Debounce the search box in `src/routes/_app/dashboard/book.tsx` with
   `useDebouncedCallback`. Typing stays instant in local state; only the URL
   write (and therefore the refetch) waits.
2. Add the Pacer devtools plugin in `src/routes/__root.tsx`.

Pacer's other debounce hook, `useDebouncer`, returns an object with
`.cancel()`. You'll meet it in the next checkpoint's command palette.
