import { toolDefinition } from "@tanstack/ai"
import { z } from "zod"

// Isomorphic tool definitions for Casper, the Ghost Airlines concierge.
//
// Definitions live here (importable from both client and server); the server
// implementations are attached with `.server()` inside the /api/chat route and
// the client implementation of `applySearchFilters` inside the chat drawer.

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

export const searchFlightsToolDef = toolDefinition({
  name: "searchFlights",
  description:
    "Search bookable Ghost Airlines flights. Use airport codes (SLM Salem, SLH Sleepy Hollow, TSY Transylvania, RSW Roswell, AMY Amityville, LNS Loch Ness, SAV Savannah, NOL New Orleans, TMB Tombstone, PPT Point Pleasant). Returns flights sorted by price, cheapest first.",
  inputSchema: z.object({
    origin: z.string().length(3).optional().describe("Origin airport code"),
    destination: z
      .string()
      .length(3)
      .optional()
      .describe("Destination airport code"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("Departure date YYYY-MM-DD"),
    maxPrice: z.number().optional().describe("Maximum price in dollars"),
    nonstopOnly: z.boolean().optional().describe("Only nonstop flights"),
  }),
  outputSchema: z.object({
    flights: z.array(flightSummary),
    totalMatching: z.number(),
  }),
})

export const getFlightStatusToolDef = toolDefinition({
  name: "getFlightStatus",
  description:
    "Look up the live OPERATIONAL status of a flight — on-time, delayed, cancelled, or scheduled — plus its gate and terminal. Call this whenever the user asks whether a flight is on time, delayed, cancelled, or what gate it leaves from. This is completely different from a booking's status: a booking can be 'confirmed' while the flight itself is 'cancelled'. Never answer an operational-status question from booking data.",
  inputSchema: z.object({
    flightNumber: z
      .string()
      .optional()
      .describe('Flight number as shown to the user, e.g. "GA-1288"'),
    flightId: z.number().optional().describe("Numeric flight id, if known"),
  }),
  outputSchema: z.object({
    // An array because flight numbers are not guaranteed unique in the demo data.
    flights: z.array(
      z.object({
        id: z.number(),
        flightNumber: z.string(),
        originCode: z.string(),
        destinationCode: z.string(),
        departTime: z.string(),
        arriveTime: z.string(),
        status: z.string(),
        gate: z.string(),
        terminal: z.string(),
      })
    ),
  }),
})

export const getMyTripsToolDef = toolDefinition({
  name: "getMyTrips",
  description:
    "Get the signed-in user's upcoming booked trips. Each trip carries BOTH a bookingStatus (confirmed/pending — the state of the reservation) and a flightStatus (on-time/delayed/cancelled/scheduled — the state of the aircraft). Do not confuse them.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    trips: z.array(
      z.object({
        tripId: z.number(),
        bookingRef: z.string(),
        flightNumber: z.string(),
        route: z.string(),
        departTime: z.string(),
        // The reservation: confirmed | pending
        bookingStatus: z.string(),
        // The aircraft: on-time | delayed | cancelled | scheduled
        flightStatus: z.string(),
        price: z.number(),
      })
    ),
  }),
})

export const bookFlightToolDef = toolDefinition({
  name: "bookFlight",
  description:
    "Book a flight for the signed-in user. Requires the numeric flight id from searchFlights. This spends the user's money, so it always requires their approval.",
  inputSchema: z.object({
    flightId: z.number().describe("The id of the flight to book"),
    passengers: z
      .number()
      .min(1)
      .max(6)
      .default(1)
      .describe("Number of passengers"),
  }),
  outputSchema: z.object({
    tripId: z.number(),
    bookingRef: z.string(),
    flightNumber: z.string(),
    route: z.string(),
    departTime: z.string(),
    price: z.number(),
  }),
  needsApproval: true,
})

export const cancelTripToolDef = toolDefinition({
  name: "cancelTrip",
  description:
    "Cancel one of the user's upcoming trips. Requires the numeric tripId from getMyTrips. Destructive, so it always requires the user's approval.",
  inputSchema: z.object({
    tripId: z.number().describe("The id of the trip to cancel"),
  }),
  outputSchema: z.object({
    tripId: z.number(),
    cancelled: z.boolean(),
  }),
  needsApproval: true,
})

// Client tool: no server execute — the browser applies typed filters to the
// Book a Flight tab by navigating with TanStack Router search params.
export const applySearchFiltersToolDef = toolDefinition({
  name: "applySearchFilters",
  description:
    "Show flight options in the app's Book a Flight tab by applying typed search filters (origin/destination airport codes and free-text search). Use this when the user wants to browse options themselves rather than book directly.",
  inputSchema: z.object({
    from: z.string().length(3).optional().describe("Origin airport code"),
    to: z.string().length(3).optional().describe("Destination airport code"),
    q: z.string().optional().describe("Free-text search, e.g. a flight number"),
  }),
  outputSchema: z.object({
    applied: z.boolean(),
  }),
})
