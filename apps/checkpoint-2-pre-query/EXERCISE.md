# Checkpoint 2: TanStack Query

Every fetch in this app is careful, hand-rolled `useState` + `useEffect` —
duplicate requests, manual race guards, a polling interval, a refetch counter.
Replace it all with TanStack Query.

**Answer key:** `apps/checkpoint-3-pre-query-prefetching`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:2        # this app on :5552
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercises

1. Convert the Flight Status page — effects, interval, and refetch counter —
   to `useQuery` (`routes/_app/dashboard/status.tsx`).
2. Wrap the fetch functions in `queryOptions` in `lib/api.ts`.
3. Convert the rest: `site-header.tsx`, `profile.tsx`, `dashboard/index.tsx`
   (including the cancel mutation), `dashboard/book.tsx`,
   `booking-dialog.tsx`, `deal-card.tsx`, and `flight-search-form.tsx`.
4. Set up the `QueryClientProvider` (`providers.tsx`), the Query devtools
   plugin (`devtools.tsx`), and clear the cache on sign-out
   (`auth-context.tsx`).

You don't need to convert every component to move on — do the status board,
the overview, and one more. The answer key has the rest.
