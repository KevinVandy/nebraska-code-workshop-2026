import type {
  Airport,
  Flight,
  Trip,
  TripWithFlight,
  User,
} from "@workspace/types"

/* Plain async functions that talk to the Ghost Airlines API (json-server).
 *
 * They're only the fetching half of the job — every component that calls one
 * also has to hand-roll loading state, error state, cancellation, and
 * refetching. Look at src/routes/_app/dashboard/status.tsx to see how much
 * that is for ONE endpoint.
 *
 * Making that disappear is this checkpoint's exercise. */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300"

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

/** Static reference data — the airports we fly to. */
export function fetchAirports() {
  return fetchJson<Airport[]>("/airports")
}

/** The signed-in user. */
export function fetchUser(userId: number) {
  return fetchJson<User>(`/users/${userId}`)
}

/** Upcoming trips with their flight embedded, sorted by departure. */
export async function fetchUpcomingTrips(userId: number) {
  const trips = await fetchJson<TripWithFlight[]>(
    `/trips?userId=${userId}&status=upcoming&_expand=flight`
  )
  return trips.sort((a, b) =>
    a.flight.departTime.localeCompare(b.flight.departTime)
  )
}

/** All of a user's trips — aggregated into the "Trips over time" chart. */
export function fetchAllTrips(userId: number) {
  return fetchJson<Trip[]>(`/trips?userId=${userId}`)
}

/** Cheapest scheduled flight on each of the 4 cheapest distinct routes. */
export async function fetchDeals() {
  const flights = await fetchJson<Flight[]>(
    "/flights?status=scheduled&_sort=price&_order=asc&_limit=40"
  )
  const seen = new Set<string>()
  const deals: Flight[] = []
  for (const f of flights) {
    const route = `${f.originCode}-${f.destinationCode}`
    if (seen.has(route)) continue
    seen.add(route)
    deals.push(f)
    if (deals.length === 4) break
  }
  return deals
}

/** Today's live departures board. */
export function fetchFlightStatusBoard() {
  return fetchJson<Flight[]>(
    "/flights?status_ne=scheduled&_sort=departTime&_order=asc&_limit=12"
  )
}

// --- Server-sorted, paginated flights (Book a Flight table) ---

export const FLIGHTS_PAGE_SIZE = 50

export interface FlightsPage {
  data: Flight[]
  meta: { totalRowCount: number }
}

// A single "column sort", matching what a sortable table would produce.
export type SortSpec = { id: string; desc: boolean }

// Filters mirrored in the Book route's URL search params.
export interface FlightFilters {
  from?: string
  to?: string
  date?: string
  q?: string
}

export async function fetchFlightsPage(
  page: number,
  sorting: SortSpec[],
  filters: FlightFilters
): Promise<FlightsPage> {
  // .at(0) is typed `SortSpec | undefined`, matching the runtime reality of
  // an unsorted table (plain [0] indexing would claim it's always defined).
  const sort = sorting.at(0)
  const params = new URLSearchParams({
    status: "scheduled",
    _page: String(page + 1), // json-server pages are 1-indexed
    _limit: String(FLIGHTS_PAGE_SIZE),
    _sort: sort?.id ?? "departTime",
    _order: sort?.desc ? "desc" : "asc",
  })
  if (filters.from) params.set("originCode", filters.from)
  if (filters.to) params.set("destinationCode", filters.to)
  if (filters.q) params.set("q", filters.q)
  if (filters.date) {
    params.set("departTime_gte", `${filters.date}T00:00:00.000Z`)
    params.set("departTime_lte", `${filters.date}T23:59:59.999Z`)
  }
  const res = await fetch(`${API_URL}/flights?${params.toString()}`)
  if (!res.ok) throw new Error(`API ${res.status} for /flights`)
  const data = (await res.json()) as Flight[]
  const totalRowCount = Number(res.headers.get("X-Total-Count") ?? data.length)
  return { data, meta: { totalRowCount } }
}
