import { z } from "zod"

/* EXERCISE 1 of 4 — Casper's isomorphic tool definitions.
 * The shape lives here so browser AND server can import it; implementations
 * attach later (.server() in api.chat.ts, .client() in casper-drawer.tsx).
 * The finished app is the full reference. */

// GIVEN: the flight shape Casper returns from searches. The drawer's
// FlightOptionCard renders this, so leave it as-is.
const flightSummary = z.object({
  id: z.number(),
  flightNumber: z.string(),
  originCode: z.string(),
  destinationCode: z.string(),
  departTime: z.string(),
  arriveTime: z.string(),
  durationMinutes: z.number(),
  stops: z.number(),
  price: z.number(),
  seatsLeft: z.number(),
  // Operational status of the aircraft — NOT a booking status.
  status: z.string(),
})

export type FlightSummary = z.infer<typeof flightSummary>

// TODO 1a — searchFlightsToolDef: search BOOKABLE flights.
// TODO 1b — getFlightStatusToolDef: live OPERATIONAL status (not booking status!).
// TODO 1c — getMyTripsToolDef: the user's upcoming trips, with BOTH statuses.
// TODO 1d — bookFlightToolDef: spends money → needsApproval: true.
// TODO 1e — cancelTripToolDef: destructive → needsApproval: true.
// TODO 1f — applySearchFiltersToolDef: CLIENT tool (no server implementation).

// Placeholder so the app compiles before you start. Remove once TODO 1 is done.
export const AI_TOOLS_TODO = true
