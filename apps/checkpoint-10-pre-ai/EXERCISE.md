# Checkpoint: TanStack AI

Everything in Ghost Airlines works **except Casper**, the AI concierge. Your
job is to wire him up.

**Answer key:** `apps/finished-app` — but try it yourself first.

## Setup

```bash
cp .env.example .env       # then add your OPENAI_API_KEY
pnpm dev:server            # json-server on :3300 (from the repo root)
pnpm --filter checkpoint-10-pre-ai dev    # this app on :5560
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then
press `⌘J` / `Ctrl+J` to open Casper. Right now the drawer opens but does
nothing — that's what you're fixing.

## The exercises

Work through the `TODO` comments in these four files, in order:

| # | File | What you'll build |
|---|------|-------------------|
| 1 | `src/lib/ai-tools.ts` | Six isomorphic tool definitions with zod schemas |
| 2 | `src/routes/api.chat.ts` | Server route: tool implementations + streaming |
| 3 | `src/components/casper/casper-drawer.tsx` | `useChat`, the client tool, query invalidation |
| 4 | `src/components/casper/casper-drawer.tsx` | Generative UI: render tool calls as components |

Each file marks what's **GIVEN** (scaffolding, styling, helpers) and what's
yours. The presentational components — flight cards, booking confirmations,
trip lists, the approval prompt — are all written for you at the bottom of
`casper-drawer.tsx`.

## Exercise 1 — the tool spec

| Tool | Input | Output | Notes |
|------|-------|--------|-------|
| `searchFlights` | `origin?`, `destination?` (3-letter codes), `date?` (YYYY-MM-DD), `maxPrice?`, `nonstopOnly?` | `{ flights: flightSummary[], totalMatching }` | List the airport codes in the description: SLM Salem, SLH Sleepy Hollow, TSY Transylvania, RSW Roswell, AMY Amityville, LNS Loch Ness, SAV Savannah, NOL New Orleans, TMB Tombstone, PPT Point Pleasant |
| `getFlightStatus` | `flightNumber?` (e.g. "GA-1288"), `flightId?` | `{ flights: Array<{ id, flightNumber, originCode, destinationCode, departTime, arriveTime, status, gate, terminal }> }` | An array — flight numbers aren't unique |
| `getMyTrips` | `{}` | `{ trips: Array<{ tripId, bookingRef, flightNumber, route, departTime, bookingStatus, flightStatus, price }> }` | Returns BOTH statuses — say so in the description |
| `bookFlight` | `flightId`, `passengers` (1–6, default 1) | `{ tripId, bookingRef, flightNumber, route, departTime, price }` | `needsApproval: true` |
| `cancelTrip` | `tripId` | `{ tripId, cancelled }` | `needsApproval: true` |
| `applySearchFilters` | `from?`, `to?`, `q?` | `{ applied }` | Client tool — no server implementation |

⚠️ **The two kinds of "status".** `flightStatus` is the aircraft (on-time /
delayed / cancelled / scheduled); `bookingStatus` is the reservation
(confirmed / pending). A confirmed booking can sit on a cancelled flight. The
model WILL conflate them unless your descriptions spell this out — and it's
worth re-stating in the system prompt too.

## Exercise 2 — endpoints and guards

| Tool | json-server endpoint | Guard |
|------|---------------------|-------|
| `searchFlights` | `GET /flights?status=scheduled&…` (originCode, destinationCode, price_lte, stops, departTime_gte/lte) — sort by price, return 5 cheapest + total | |
| `getFlightStatus` | `GET /flights?flightNumber=` or `?id=` | Deliberately does **not** filter by status — it must find cancelled/delayed departures. Be forgiving about "ga-1288" / "1288" |
| `getMyTrips` | `GET /trips?userId=&status=upcoming&_expand=flight` | |
| `bookFlight` | `GET /flights/:id` then `POST /trips` | Refuse if `status !== "scheduled"` or `seatsLeft < 1` — the model can get cancelled-flight ids from `getFlightStatus` and will happily book one |
| `cancelTrip` | `GET /trips?id=&userId=` then `PATCH /trips/:id` | Verify ownership FIRST — the model supplies the id, never trust it |

Tools that act as the user need to know who that is: type a per-request
context (`interface CasperContext { userId: number }`), pass it to `chat()`
via `context:`, and read it as the second argument of `.server()`.

The response recipe: `chatParamsFromRequestBody` → `mergeAgentTools(serverTools,
params.tools)` → `chat({ adapter: openaiText(MODEL), tools, context,
systemPrompts, agentLoopStrategy: maxIterations(10), messages, threadId, runId,
abortController })` → `toServerSentEventsResponse(stream, { abortController })`.

## Exercise 4 — part-to-component mapping

| Message part | Render |
|--------------|--------|
| `type === "text"` | chat bubble (user right, assistant left) |
| `state === "approval-requested"` | `<ApprovalRequest>` |
| `name === "searchFlights"` + output | `<SearchResults>` |
| `name === "bookFlight"` + output | `<BookingConfirmation>` |
| `name === "getMyTrips"` + output | `<TripsList>` |
| `name === "applySearchFilters"` + output | one-line "✓ Filters applied" |
| no output yet | `WORKING_LABELS[part.name]` fallback |

The given components take plain typed props — you supply `part.output as
SearchResultsOutput` etc. (the server already validated the shape against your
outputSchema; the stream types it as unknown).

## Things to try once it works

- **Ask about a cancelled flight.** Open the Flight Status tab, find a
  cancelled flight (e.g. `GA-1288`), then ask Casper "is GA-1288 on time?" If
  your tool descriptions don't distinguish *flight* status from *booking*
  status, Casper will confidently tell you the wrong thing.
- **Try to book a cancelled flight.** Your `bookFlight` guard should refuse.
- **Deny an approval.** Ask Casper to book something, then hit Deny.
- **"Show me nonstop flights to Roswell in the Book tab"** — that's the client
  tool driving the router.
- Open the devtools panel (bottom of the screen) and watch the **AI** tab as
  messages stream.

## Hints

- The tool definitions are the contract between three files. Get
  `ai-tools.ts` right and the other two mostly fall into place.
- If Casper answers without ever calling a tool, your **descriptions** are too
  vague — the model picks tools by description alone.
- `useChat` narrows tool names to the *client* tools you registered, so
  checking for server tool names needs `messages as UIMessage[]`.
- Server route errors show up in the terminal running `dev`, not the browser.
