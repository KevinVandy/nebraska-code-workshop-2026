# Checkpoint 6: Infinite Query + TanStack Virtual

The Book a Flight table pages through 420 flights with Previous/Next buttons.
Replace that with an infinite, virtualized scroll.

**Answer key:** `apps/checkpoint-7-pre-form`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:6        # this app on :5556
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then go
to **Dashboard → Book a Flight**.

## The exercises

Both in `src/routes/_app/dashboard/book.tsx` — get step 1 working before
starting step 2.

1. Switch the flights list to `useInfiniteQuery` (an `infiniteQueryOptions` in
   `lib/api.ts`), loading the next page from scroll position instead of
   buttons — and update the tab-bar hover prefetch in
   `routes/_app/dashboard.tsx` to match.
2. Virtualize the rows with `useVirtualizer` so the DOM only holds what's on
   screen.

Inspect the DOM when you're done: scrolled to row 300, it should contain
about twenty rows.
