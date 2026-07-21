# Checkpoint: Prefetching with TanStack Query

The dashboard works, but every tab switch stalls for a second. Make it feel
instant by fetching before the click.

**Answer key:** `apps/checkpoint-4-pre-start` — but try it yourself first.

## Setup

```bash
pnpm dev:server                                    # json-server on :3300
pnpm --filter checkpoint-3-pre-query-prefetching dev # this app on :5553
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then go
to the Dashboard.

## Feel the problem first

Open the Network tab and click between **Overview**, **Book a Flight**, and
**Flight Status**. Each switch shows a loading state for a full second, every
single time. The API's 1s delay is deliberate — it's what a slow connection
feels like, made reproducible.

Nothing is wrong with the code. The data just isn't requested until the route
renders and its `useQuery` runs.

## The exercise

All the TODOs are in `src/routes/_app/dashboard.tsx`. You'll add hover
prefetching to the three tabs, using queries that already exist in
`src/lib/api.ts`.

The whole change is a handful of lines, which is the point: because the route
and the prefetch build the **same query key**, the prefetch writes into the
cache the route is about to read. No state to thread, no handoff.

## Things to try

- **Hover a tab for a beat, then click.** It renders instantly. Click one
  cold and you're back to a second of waiting.
- **Sweep your mouse across the tab bar repeatedly** with the Network tab
  open. `ensureQueryData` respects `staleTime`, so you should see very few
  requests. Swap it for `prefetchQuery` and watch the requests pile up.
- **Deliberately break a key** — prefetch `flightsPageQuery(1, [], {})`
  instead of page 0. Everything still works, and the prefetch achieves
  nothing. Silent no-ops like this are the most common prefetching bug, and
  the reason those query options live in one shared file.
- **Tab to a link with the keyboard** instead of hovering. That's what
  `onFocus` is for.

## Not in this checkpoint

This is still a client-only SPA — TanStack Start comes next. The dashboard
tables are hand-written HTML, the Contact page has no form, searches fire per
keystroke, there are no keyboard shortcuts, and Casper's panel is empty.
