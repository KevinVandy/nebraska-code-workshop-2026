# Checkpoint 10: TanStack AI

Everything in Ghost Airlines works except Casper, the AI concierge. The
drawer opens and does nothing. Wire him up.

**Answer key:** `apps/finished-app`

## Setup

```bash
cp .env.example .env   # then add your OPENAI_API_KEY
pnpm dev:server        # json-server on :3300 (repo root)
pnpm dev:10            # this app on :5560
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then
open Casper from the header's **Ask Casper** button.

## New in this checkpoint

- `src/components/casper/` is new scaffolding: the drawer shell, its context,
  and all the presentational pieces (flight cards, booking confirmation, trip
  list, the approval prompt). The chat wiring is yours.
- The header button and the palette's "Ask Casper" row already open the
  drawer, and the cheat-sheet lists a `Mod+J` shortcut that isn't registered
  yet.

## The exercises

1. Define the tools in `src/lib/ai-tools.ts`: `searchFlights`,
   `getFlightStatus`, `getMyTrips`, `bookFlight` and `cancelTrip` (both behind
   approval), and the client-side `applySearchFilters`.
2. Implement them against json-server and stream the chat in
   `src/routes/api.chat.ts`.
3. Wire up `useChat` in `src/components/casper/casper-drawer.tsx`. The client
   tool drives the Book tab's search params, and bookings invalidate the right
   queries.
4. Render tool calls as the given components (generative UI), also in
   `casper-drawer.tsx`.
5. Register `Mod+J` to toggle Casper in
   `src/components/shortcuts/shortcuts-provider.tsx`, one last `useHotkey`.

Ask Casper whether a cancelled flight is on time, then ask him to book you
something and deny the approval. If he answers without calling a tool, your
tool descriptions are too vague.
