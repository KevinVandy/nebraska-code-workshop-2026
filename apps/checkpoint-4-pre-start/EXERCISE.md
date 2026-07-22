# Checkpoint 4: TanStack Start — rendering modes

The app is now a TanStack Start app — the SPA conversion was done for you.
Every page currently full-SSRs; your job is to pick the right rendering mode
per page. Deliberately the shortest exercise of the day.

**Answer key:** `apps/checkpoint-5-pre-table`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:4        # this app on :5554
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## New in this checkpoint

- `index.html` and `main.tsx` are gone — the server renders the document via
  `shellComponent` in `routes/__root.tsx`, and `src/router.tsx` supplies the
  router to both server and browser.
- `lib/auth.ts` now reads the session cookie isomorphically, so the auth guard
  runs on the server before any JS downloads.
- `providers.tsx` creates one QueryClient per request so server renders never
  share a cache between users.

## The exercises

1. Prerender the two static marketing pages, `/` and `/about`, in
   `vite.config.ts` — and be careful: the two link-crawling options default to
   `true` and will happily bake authed pages into static files.
2. Give the authed, per-user pages the `ssr` mode that skips server-rendered
   markup but keeps the server-side guard —
   `routes/_app/dashboard.tsx` and `routes/_app/profile.tsx`.

Verify with view-source: the home page's hero is in the HTML, the dashboard's
tab bar isn't.

## Bonus — React Server Components (experimental)

`@vitejs/plugin-rsc` is pre-installed. Enable Start's experimental `rsc`
option in `vite.config.ts`, write an async server component that fetches the
three cheapest fares (`src/components/server-deals.tsx`), and hand it to the
home route through its loader. The answer key does **not** include this one —
experiment, then revert.
