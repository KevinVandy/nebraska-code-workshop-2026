import { createFileRoute } from "@tanstack/react-router"

import { sessionFromCookieHeader } from "@/lib/auth"

/* ============================================================================
 * EXERCISE 2 of 4 — The chat server route
 * ============================================================================
 *
 * This is a TanStack Start server route. It receives the conversation from the
 * browser, runs the model with your tools attached, and streams the result
 * back as Server-Sent Events.
 *
 * GIVEN below: the session check (fake auth, real enforcement), the env-var
 * guard, and `apiJson` for talking to json-server. Your job is the tools and
 * the chat() call.
 *
 * Docs: https://tanstack.com/ai → "Streaming" and "Server tools"
 * ==========================================================================*/

// The API the tools talk to (json-server). Server-side, so read process.env.
const API_URL = process.env.VITE_API_URL ?? "http://localhost:3300"
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o"

/** GIVEN: fetch helper for the Ghost Airlines API. */
async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok)
    throw new Error(`Ghost Airlines API error ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

/* TODO 2a — Write the system prompt.
 *
 * Make it a FUNCTION, not a module-level const, so "today's date" is computed
 * per request (a dev server left running overnight would otherwise tell the
 * model yesterday's date and skew date-filtered searches).
 *
 *   const systemPrompt = () => `You are Casper, ...`
 *
 * Cover: who Casper is (concierge for a budget airline flying to small,
 * storied towns), always call searchFlights rather than inventing flights,
 * never claim a booking succeeded without a bookingRef, keep replies short,
 * today's date. And re-state the flightStatus vs bookingStatus distinction —
 * the tool descriptions alone are not enough.
 */

/* TODO 2b — Implement the server tools with `.server(...)`.
 *
 *   const searchFlights = searchFlightsToolDef.server(async (input) => { ... })
 *
 * Endpoints (json-server):
 *   searchFlights    GET /flights?status=scheduled&originCode=&destinationCode=
 *                    &price_lte=&stops=&departTime_gte=&departTime_lte=
 *                    → sort by price, return the 5 cheapest + totalMatching
 *   getFlightStatus  GET /flights?flightNumber=  or  ?id=
 *                    ⚠️ deliberately does NOT filter by status — unlike
 *                    searchFlights it must find today's cancelled/delayed
 *                    departures. Be forgiving about "ga-1288" / "1288".
 *   getMyTrips       GET /trips?userId=&status=upcoming&_expand=flight
 *   bookFlight       GET /flights/:id then POST /trips
 *                    ⚠️ Guard it: refuse if flight.status !== "scheduled" or
 *                    seatsLeft < 1. The model can get ids for cancelled
 *                    flights from getFlightStatus and will happily book one.
 *   cancelTrip       GET /trips?id=&userId=  (verify ownership FIRST — the
 *                    model supplies the id, never trust it) then PATCH
 *                    /trips/:id { status: "cancelled" }
 *
 * Tools that act on behalf of the user need to know WHO the user is. Type a
 * per-request context and read it via the second arg:
 *
 *   interface CasperContext { userId: number }
 *   const getMyTrips = getMyTripsToolDef.server<CasperContext>(
 *     async (_input, ctx) => { ...ctx.context.userId... }
 *   )
 */

/* TODO 2c — Build the response in the POST handler below.
 *
 *   1. `mergeAgentTools(serverTools, params.tools)` — merges your server tools
 *      with the client tools the browser advertised (applySearchFilters).
 *   2. `chat({ adapter: openaiText(MODEL), tools, context, systemPrompts,
 *              agentLoopStrategy: maxIterations(10), messages, threadId,
 *              runId, abortController })`
 *   3. `return toServerSentEventsResponse(stream, { abortController })`
 *
 * Parse the body with `chatParamsFromRequestBody(await request.json())` and
 * return 400 if it throws.
 */

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        /* GIVEN — FAKE AUTH, but genuinely enforced: the browser sends the
         * session cookie automatically, and we refuse to run the model
         * without one. (A real app would verify a signature here rather than
         * trusting the cookie's contents — see src/lib/auth.ts.) */
        const session = sessionFromCookieHeader(request.headers.get("cookie"))
        if (!session) {
          return Response.json(
            { error: "You must be signed in to chat with Casper." },
            { status: 401 }
          )
        }

        if (!process.env.OPENAI_API_KEY) {
          return Response.json(
            {
              error:
                "OPENAI_API_KEY is not set. Add it to apps/checkpoint-pre-ai/.env to enable Casper.",
            },
            { status: 500 }
          )
        }

        /* GIVEN — when the browser disconnects mid-stream (tab closed, the
         * drawer's Stop button), the request's signal fires; forwarding it
         * into this controller makes chat() stop calling OpenAI instead of
         * streaming into the void. Pass it to chat() and to the SSE helper. */
        const abortController = new AbortController()
        request.signal.addEventListener("abort", () => abortController.abort())

        // TODO 2c — replace this with the real chat stream (see above).
        void apiJson
        void MODEL
        return Response.json(
          { error: "Casper isn't wired up yet — see the TODOs in this file." },
          { status: 501 }
        )
      },
    },
  },
})
