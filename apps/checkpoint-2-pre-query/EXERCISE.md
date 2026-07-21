# Checkpoint: TanStack Query

Every fetch in this app is hand-rolled `useState` + `useEffect`. It works.
Replace it with TanStack Query and watch a few hundred lines disappear.

**Answer key:** `apps/checkpoint-3-pre-query-prefetching` — but try it yourself
first.

## Setup

```bash
pnpm dev:server                          # json-server on :3300 (repo root)
pnpm --filter checkpoint-2-pre-query dev   # this app on :5552
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## Find the problems before you fix them

The code here isn't sloppy — it even has `ignore` flags to guard against race
conditions. It's what careful manual fetching looks like. Go looking anyway:

1. **Open the Network tab and load the dashboard.** Count the requests for
   `/users/1`. There are three: the site header, the dashboard overview, and
   (if you visit it) the profile page each fetch the same record
   independently. Nothing is shared.

2. **Count `/airports` requests** as you move between Flight Status, Book a
   Flight, and the home page. Same story — and airports never change.

3. **Load the home page** and watch four deal cards each fire their own fare
   lookup, then open a deal and watch the dialog fetch the same thing again.

4. **Cancel a trip on the Overview tab.** It works, because the component
   bumps a counter that re-runs its own effects. Now ask: how would the site
   header know? It wouldn't.

5. **Open `src/routes/_app/dashboard/status.tsx`** and read `StatusPage`. About
   60 lines of state, effects, an interval, and a refetch counter — to show
   one table that polls.

## The exercise

The TODOs live at the top of `status.tsx`, and they walk through the whole
app. Suggested order:

| # | Where | What |
|---|-------|------|
| 1 | `dashboard/status.tsx` | Two `useQuery` calls; delete the effects, the interval, and the refetch counter |
| 2 | `lib/api.ts` | Wrap the fetch functions in `queryOptions`, give airports `staleTime: Infinity` |
| 3 | everywhere else | The other seven components |
| 4 | `providers.tsx`, `devtools.tsx`, `auth-context.tsx` | Provider, devtools panel, cache clear on sign-out |

You don't have to convert all eight components to move on — do the status
board, the overview (including the cancel mutation), and one more. The next
checkpoint has the rest done.

## What you should notice

- **Query keys are the whole idea.** Two components asking for
  `["user", 1]` get one request and one shared result. That's the fix for
  problems 1–3 above, and you get it just by naming things consistently.
- **`invalidateQueries` is how you say "this data moved."** Compare it to the
  counter-bumping in the current cancel flow: invalidation reaches *every*
  observer of that key, not just the component that did the mutation.
- **The `ignore` flags all go away.** Query cancels superseded requests for
  you — the race in the command palette's search stops being your problem.
- **`refetchInterval: 10_000`** replaces the entire polling effect.
- **You stop deriving `isPending` from `data === null && error === null`.**

## Not in this checkpoint

This is still a client-only SPA (Start comes later), the dashboard tables are
hand-written HTML, the Contact page has no form, searches fire per keystroke,
there are no keyboard shortcuts, and Casper's panel is empty.
