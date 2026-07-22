# Checkpoint 1: TanStack Router

Ghost Airlines has a marketing site, working auth, and a profile page, but no
dashboard. Create it, and put some state in the URL along the way.

**Answer key:** `apps/checkpoint-2-pre-query` (it has the pages fully built
out; here you're only creating the structure).

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:1        # this app on :5551
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercises

1. Create the dashboard layout route (a tab bar plus an `<Outlet />`) at
   `src/routes/_app/dashboard.tsx`.
2. Create three blank child pages: `dashboard/index.tsx` (Overview),
   `dashboard/book.tsx`, and `dashboard/status.tsx`.
3. Give the Book route typed search params (`from`, `to`, `date`, `q`) with
   `validateSearch`, and render them on the page.
4. Reconnect everything that wants to link to the dashboard. Search the
   codebase for `TODO 4`.
5. Move the hero search form's state into the URL. Search for `TODO 5`
   (`routes/_marketing/index.tsx` and `components/flight-search-form.tsx`).

When you're done, fill in the hero search and paste the URL into a new tab.
The form should arrive already filled out.
