import { createFileRoute } from "@tanstack/react-router"
import {
  chat,
  chatParamsFromRequestBody,
  maxIterations,
  mergeAgentTools,
  toServerSentEventsResponse,
} from "@tanstack/ai"
import { openaiText } from "@tanstack/ai-openai"

import type { Flight, TripWithFlight } from "@workspace/types"

import {
  applySearchFiltersToolDef,
  bookFlightToolDef,
  cancelTripToolDef,
  getFlightStatusToolDef,
  getMyTripsToolDef,
  searchFlightsToolDef,
} from "@/lib/ai-tools"
import { sessionFromCookieHeader } from "@/lib/auth"

// The API the tools talk to (json-server). Server-side, so read process.env.
const API_URL = process.env.VITE_API_URL ?? "http://localhost:3300"
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o"

// A function (not a module-level constant) so "today's date" is computed per
// request — a dev server left running overnight would otherwise tell the
// model yesterday's date and skew date-filtered searches.
const systemPrompt =
  () => `You are Casper, the friendly concierge for Ghost Airlines — a budget airline flying to small, storied towns (Salem, Sleepy Hollow, Transylvania, Roswell, Amityville, Loch Ness, Savannah, New Orleans, Tombstone, Point Pleasant).

TWO DIFFERENT KINDS OF "STATUS" — never confuse these:
- flightStatus (on-time | delayed | cancelled | scheduled) describes the AIRCRAFT. Get it from getFlightStatus, or from the flightStatus field on getMyTrips.
- bookingStatus (confirmed | pending) describes the RESERVATION. It says nothing about whether the plane is flying.
A booking can be "confirmed" on a flight that is "cancelled". If the user asks whether a flight is on time, delayed, or cancelled, you MUST call getFlightStatus — never answer from bookingStatus. If the user says the app shows a different status than you reported, believe them and call getFlightStatus to check; do not tell them to contact customer service.

WORKFLOW RULES:
- To answer questions about flights, ALWAYS call searchFlights first. Never invent flights.
- searchFlights only returns bookable (scheduled) flights, so it will NOT surface today's delayed or cancelled departures. Use getFlightStatus for those.
- The user may ask about a flight by number (e.g. "GA-1288") that they saw on the departures board. Pass that number straight to getFlightStatus.
- When the user asks to book, call bookFlight with the flight id from searchFlights. The user will be asked to approve it — never claim a booking succeeded unless the tool returned a bookingRef.
- The searchFlights results are displayed to the user as rich cards, so do NOT repeat the flight list in text. Add at most one short sentence after the tool call.
- To answer questions about the user's trips, call getMyTrips.
- To cancel a trip, call cancelTrip with the tripId from getMyTrips (requires approval).
- If the user wants to browse or compare options themselves, call applySearchFilters to fill in the Book a Flight tab for them.
- Keep replies short, warm, and concrete. Prices are one-way USD.
- Today's date is ${new Date().toISOString().slice(0, 10)}.`

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok)
    throw new Error(`Ghost Airlines API error ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

function routeLabel(f: Flight) {
  return `${f.originCode} → ${f.destinationCode}`
}

// --- Server implementations -------------------------------------------------

const searchFlights = searchFlightsToolDef.server(async (input) => {
  const params = new URLSearchParams({ status: "scheduled" })
  if (input.origin) params.set("originCode", input.origin.toUpperCase())
  if (input.destination)
    params.set("destinationCode", input.destination.toUpperCase())
  if (input.maxPrice != null) params.set("price_lte", String(input.maxPrice))
  if (input.nonstopOnly) params.set("stops", "0")
  if (input.date) {
    params.set("departTime_gte", `${input.date}T00:00:00.000Z`)
    params.set("departTime_lte", `${input.date}T23:59:59.999Z`)
  }

  const all = await apiJson<Flight[]>(`/flights?${params.toString()}`)
  const sorted = [...all].sort((a, b) => a.price - b.price)
  return {
    flights: sorted.slice(0, 5).map((f) => ({
      id: f.id,
      flightNumber: f.flightNumber,
      originCode: f.originCode,
      destinationCode: f.destinationCode,
      departTime: f.departTime,
      arriveTime: f.arriveTime,
      durationMinutes: f.durationMinutes,
      stops: f.stops,
      price: f.price,
      seatsLeft: f.seatsLeft,
      status: f.status,
    })),
    totalMatching: all.length,
  }
})

/**
 * Operational status lookup. Deliberately does NOT filter by status — unlike
 * searchFlights (which only returns bookable `scheduled` flights), this has to
 * be able to find today's delayed and cancelled departures.
 */
const getFlightStatus = getFlightStatusToolDef.server(async (input) => {
  const params = new URLSearchParams()
  if (input.flightId != null) params.set("id", String(input.flightId))
  if (input.flightNumber) {
    // Users say "GA-1288"; be forgiving about case and a missing dash.
    const raw = input.flightNumber.trim().toUpperCase().replace(/\s+/g, "")
    params.set(
      "flightNumber",
      raw.startsWith("GA-") ? raw : `GA-${raw.replace(/^GA/, "")}`
    )
  }
  if ([...params].length === 0) {
    throw new Error("Provide either a flightNumber or a flightId.")
  }

  const matches = await apiJson<Flight[]>(`/flights?${params.toString()}`)
  return {
    flights: matches.map((f) => ({
      id: f.id,
      flightNumber: f.flightNumber,
      originCode: f.originCode,
      destinationCode: f.destinationCode,
      departTime: f.departTime,
      arriveTime: f.arriveTime,
      status: f.status,
      gate: f.gate,
      terminal: f.terminal,
    })),
  }
})

/** Per-request runtime context: which (fake-)authenticated user Casper acts as. */
interface CasperContext {
  userId: number
}

const getMyTrips = getMyTripsToolDef.server<CasperContext>(
  async (_input, ctx) => {
    const trips = await apiJson<TripWithFlight[]>(
      `/trips?userId=${ctx.context.userId}&status=upcoming&_expand=flight`
    )
    return {
      trips: trips
        .sort((a, b) => a.flight.departTime.localeCompare(b.flight.departTime))
        .map((t) => ({
          tripId: t.id,
          bookingRef: t.bookingRef,
          flightNumber: t.flight.flightNumber,
          route: routeLabel(t.flight),
          departTime: t.flight.departTime,
          bookingStatus: t.bookingStatus, // the reservation
          flightStatus: t.flight.status, // the aircraft
          price: t.flight.price,
        })),
    }
  }
)

const bookFlight = bookFlightToolDef.server<CasperContext>(
  async (input, ctx) => {
    const flight = await apiJson<Flight>(`/flights/${input.flightId}`)
    // The model can obtain ids for cancelled flights via getFlightStatus —
    // never book one. A thrown error becomes the tool's failure result, which
    // the model relays to the user.
    if (flight.status !== "scheduled") {
      throw new Error(
        `${flight.flightNumber} is ${flight.status} and can't be booked.`
      )
    }
    if (flight.seatsLeft < 1) {
      throw new Error(`${flight.flightNumber} is sold out.`)
    }
    const bookingRef = Math.random().toString(36).slice(2, 8).toUpperCase()
    const trip = await apiJson<{ id: number }>(`/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: ctx.context.userId,
        flightId: flight.id,
        bookingRef,
        status: "upcoming",
        bookingStatus: "confirmed",
        seat: `${Math.ceil(Math.random() * 30)}A`,
        cabin: flight.cabin,
        passengers: input.passengers,
        bookedAt: new Date().toISOString(),
      }),
    })
    return {
      tripId: trip.id,
      bookingRef,
      flightNumber: flight.flightNumber,
      route: routeLabel(flight),
      departTime: flight.departTime,
      price: flight.price,
    }
  }
)

const cancelTrip = cancelTripToolDef.server<CasperContext>(
  async (input, ctx) => {
    // Only let the caller cancel their own trips — the model supplies the id, so
    // never trust it blindly.
    const trips = await apiJson<Array<{ id: number }>>(
      `/trips?id=${input.tripId}&userId=${ctx.context.userId}`
    )
    if (trips.length === 0)
      throw new Error("That trip doesn't belong to the signed-in traveller.")

    await apiJson(`/trips/${input.tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    })
    return { tripId: input.tripId, cancelled: true }
  }
)

const serverTools = [
  searchFlights,
  getFlightStatus,
  getMyTrips,
  bookFlight,
  cancelTrip,
  applySearchFiltersToolDef, // no server execute → runs on the client
]

// --- Route -------------------------------------------------------------------

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        /* FAKE AUTH, but genuinely enforced: the browser sends the session
         * cookie automatically, and we refuse to run the model without one.
         * (A real app would verify a signature here rather than trusting the
         * cookie's contents — see src/lib/auth.ts.) */
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
                "OPENAI_API_KEY is not set. Add it to apps/finished-app/.env to enable Casper.",
            },
            { status: 500 }
          )
        }

        /* When the browser disconnects mid-stream (tab closed, Casper's Stop
         * button), the request's signal fires; forwarding it into this
         * controller makes chat() stop calling OpenAI instead of streaming
         * into the void. The SSE helper also aborts it if the client goes
         * away mid-write. */
        const abortController = new AbortController()
        request.signal.addEventListener("abort", () => abortController.abort())

        let params
        try {
          params = await chatParamsFromRequestBody(await request.json())
        } catch (error) {
          return new Response(
            error instanceof Error ? error.message : "Bad request",
            {
              status: 400,
            }
          )
        }

        try {
          const mergedTools = mergeAgentTools(serverTools, params.tools)
          const stream = chat({
            // OPENAI_MODEL is a free-form env override, so it's cast into the
            // adapter's model union — an invalid name fails at the OpenAI API.
            adapter: openaiText(MODEL as "gpt-4o"),
            tools: Object.values(mergedTools),
            // Tools act as the signed-in traveller, not a hardcoded demo id.
            context: { userId: session.userId } satisfies CasperContext,
            systemPrompts: [
              `${systemPrompt()}\n\nYou are helping ${session.name} (${session.email}).`,
            ],
            agentLoopStrategy: maxIterations(10),
            messages: params.messages,
            threadId: params.threadId,
            runId: params.runId,
            abortController,
          })
          return toServerSentEventsResponse(stream, { abortController })
        } catch (error) {
          // Errors during streaming surface inside the SSE stream itself;
          // this catch only sees synchronous setup failures.
          console.error("[/api/chat] error:", error)
          return Response.json(
            { error: error instanceof Error ? error.message : "Chat failed" },
            { status: 500 }
          )
        }
      },
    },
  },
})
