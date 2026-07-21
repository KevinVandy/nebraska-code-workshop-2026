# Checkpoint: Infinite Query + TanStack Virtual

The **Book a Flight** table works — 420 flights, 50 at a time, Previous/Next
buttons. Replace that with an infinite, virtualized scroll.

**Answer key:** `apps/checkpoint-7-pre-form` — but try it yourself first.

## Setup

```bash
pnpm dev:server                             # json-server on :3300 (repo root)
pnpm --filter checkpoint-6-pre-virtual dev    # this app on :5545
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then go
to **Dashboard → Book a Flight**.

## The exercise

One TODO, two steps, in `src/routes/_app/dashboard/book.tsx`. **Get step 1
working before you start step 2** — they're much easier to debug separately.

### Step 1 — `useInfiniteQuery`

Turn `flightsPageQuery` (in `src/lib/api.ts`) into `flightsInfiniteQuery` using
`infiniteQueryOptions`, swap `useQuery` for `useInfiniteQuery`, flatten
`data.pages` for the table, and load the next page from scroll position
instead of buttons.

Three things to get right:

- **`getNextPageParam` returning `undefined`** is how you say "no more pages" —
  that's what makes `hasNextPage` false and stops the fetching.
- **Call your scroll check on mount too.** If the first page doesn't fill the
  viewport, no scroll event ever fires and the table dead-ends at 50 rows.
- **Update the hover prefetch** in `src/routes/_app/dashboard.tsx` —
  `ensureQueryData` becomes `ensureInfiniteQueryData`. The key has to match
  exactly, or you'll silently prefetch nothing and never notice.

### Step 2 — `useVirtualizer`

Scroll far enough after step 1 and you'll have hundreds of `<tr>`s in the DOM.
Render only the visible ones.

The part that surprises people: **a real `<table>` can't be absolutely
positioned**, so the markup switches to CSS grid/flex — `<table className="grid">`,
`<tr className="flex">`, a `<tbody>` with an explicit
`height: rowVirtualizer.getTotalSize()`, and rows placed with
`transform: translateY(virtualRow.start)`.

Also reset scroll to the top when sorting changes, or you're left halfway down
a list that just reordered.

## Things to try

- **Inspect the DOM** before and after step 2. Scroll to row 300: before, the
  DOM holds 300+ rows; after, about 20.
- **Skip `measureElement`** and give one row taller content — estimated heights
  drift and rows start to overlap.
- **Sort by price while scrolled down**, before you add `scrollToIndex(0)`.
- **Watch the Network tab** while scrolling — pages should arrive one at a
  time, not all at once.

## Not in this checkpoint

- The Contact page has no form yet (TanStack Form is the next checkpoint).
- The Book search and command palette fire a request per keystroke — Pacer
  fixes that later.
- No keyboard shortcuts; the palette opens from the header's **Search** button.
- Casper's panel opens but is empty.
