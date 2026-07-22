# Checkpoint 3: Prefetching with TanStack Query

The dashboard works, but every tab switch stalls for a second while its
queries load. Make it feel instant by fetching before the click.

**Answer key:** `apps/checkpoint-4-pre-start`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:3        # this app on :5553
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then go
to the Dashboard.

## The exercise

Prefetch each dashboard tab's queries when its `Link` is hovered or focused,
in `src/routes/_app/dashboard.tsx`. The queries you need already exist in
`src/lib/api.ts`.

Hover a tab for a beat, then click: instant. Click one cold: a second of
loading. That's the whole feature.
