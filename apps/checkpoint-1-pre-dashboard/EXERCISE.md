# Checkpoint 1: TanStack Router

Ghost Airlines has a marketing site, working auth, and a profile page. What it
doesn't have is a dashboard. You're going to add one — as **blank pages** —
and use it to see how the router's type safety works.

**Answer key:** `apps/checkpoint-2-pre-query` — though that one has the pages
fully built out. Here you're only creating the route structure.

## Setup

```bash
pnpm dev:server                                # json-server on :3300
pnpm --filter checkpoint-1-pre-dashboard dev   # this app on :5551
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`). You'll
land on the home page, because there's nowhere else to go yet.

## The exercise

### 1. Create the dashboard layout route

New file: `src/routes/_app/dashboard.tsx`

It sits under `_app`, which already has the auth guard, so anything you nest
inside is protected automatically — you don't write that twice.

```tsx
export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardLayout,
})
```

The layout renders a tab bar plus an `<Outlet />` for the child pages. Style
the active tab with `data-[status=active]:` variants — the router sets
`data-status="active"` on the matching `<Link>`. (Ask why not `activeProps`:
with `activeProps` the base and active classes are both applied and Tailwind's
source order decides who wins, which is a coin flip.)

### 2. Create three blank child pages

- `src/routes/_app/dashboard/index.tsx` — Overview
- `src/routes/_app/dashboard/book.tsx` — Book a Flight
- `src/routes/_app/dashboard/status.tsx` — Flight Status

A heading and a sentence each is plenty. Filling them in is what the rest of
the workshop is for.

Notice the file names: `dashboard.tsx` is the *layout*, and `dashboard/index.tsx`
is what renders at `/dashboard` itself. Both exist, and they nest.

### 3. Give one route typed search params

On the Book route, add:

```tsx
const bookSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute("/_app/dashboard/book")({
  validateSearch: bookSearchSchema,
  component: BookPage,
})
```

Then read them with `Route.useSearch()` and render them on the page, so you can
see the values change. Visit `/dashboard/book?from=SLM&to=NOL` and watch them
appear — typed, parsed, and shareable.

### 4. Reconnect the app

Search the codebase for `TODO 4`. Every place that *wants* to link to the
dashboard is currently pointed somewhere else, because until step 1 the route
literally does not exist in the type system:

| File | What to restore |
|------|-----------------|
| `components/site-header.tsx` | The Dashboard nav link |
| `components/footer.tsx` | "Manage booking" → `/dashboard` |
| `components/flight-search-form.tsx` | Hero search → Book, with search params |
| `routes/_marketing/login.tsx`, `signup.tsx` | Redirect signed-in users to `/dashboard` |

### 5. Store the hero search in the URL

The home page's search form keeps `from` / `to` / `date` in three `useState`
calls — which means a half-filled search is gone on reload and impossible to
share. Search the codebase for `TODO 5` and move that state into the URL.

Same pattern as step 3, marketing side:

1. Give the index route (`routes/_marketing/index.tsx`) a `validateSearch`
   schema with optional `from`, `to`, and `date` strings.
2. In `components/flight-search-form.tsx`, delete the `useState` calls. Read
   with `useSearch({ from: "/_marketing/" })`; write with a small helper that
   merges one field into the URL:

   ```tsx
   const setField = (key: "from" | "to" | "date", value: string) => {
     navigate({
       to: ".",
       search: (prev) => ({ ...prev, [key]: value || undefined }),
       replace: true,
     })
   }
   ```

   The functional `search` updater merges instead of clobbering the other
   fields; `|| undefined` removes a cleared field from the URL entirely; and
   `replace: true` keeps each keystroke from becoming a history entry.
3. The submit handler now forwards `search.from` / `search.to` / `search.date`
   straight into the Book tab's search params — URL state flowing into URL
   state.

## The point of all this

**Try to break it, and watch TypeScript stop you:**

- Before step 1, type `<Link to="/dashboard">` anywhere. It's a type error —
  not a broken link at runtime, an error in your editor, immediately.
- Type `<Link to="/dash` and trigger autocomplete. Every real route in the app
  is offered. Add a route file and the list grows on its own.
- After step 3, try `navigate({ to: "/dashboard/book", search: { foo: 1 } })`.
  Rejected: `foo` isn't in the schema. Try `from: 123`. Rejected: wrong type.
- Rename `book.tsx` to `flights.tsx` and watch every reference to
  `/dashboard/book` light up red at once.
- After step 5, fill in the hero search, **copy the URL, and paste it into a
  new tab** — the form is already filled out. Reload — still filled out.
  `useState` can't do either. That's the case for URL state: if it should
  survive a refresh or travel in a link, it belongs in the URL.

That's the difference between a router that knows your routes and one that
takes strings on faith. Nothing here is runtime validation — it's all gone by
the time the code ships.

## Not in this checkpoint

Everything is fetched with hand-rolled `useState` + `useEffect` (TanStack Query
is checkpoint 2), it's a client-only SPA, and the Contact page has no form. The
command palette and Casper aren't built yet — they're scaffolded later, in the
Hotkeys and AI checkpoints.
