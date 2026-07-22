import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import type {
  Airport,
  Flight,
  Trip,
  TripWithFlight,
  User,
} from "@workspace/types"

/* Only genuinely SHARED queries live in this file — every one of them is used
 * by at least two call sites that must agree on the query key (a page and the
 * dashboard tab-bar's hover prefetch, or a page and the site header). Fetches
 * with a single consumer are defined inline in the file that uses them. */

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300"

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

// Static reference data — rarely changes, so keep it fresh forever.
export const airportsQuery = queryOptions({
  queryKey: ["airports"],
  queryFn: () => fetchJson<Airport[]>("/airports"),
  staleTime: Infinity,
})

/** The signed-in user. Disabled until we know who that is. */
export function currentUserQuery(userId: number | undefined) {
  return queryOptions({
    queryKey: ["user", userId],
    queryFn: () => fetchJson<User>(`/users/${userId}`),
    enabled: userId != null,
  })
}

// Upcoming trips with their flight embedded, sorted by departure.
export function upcomingTripsQuery(userId: number | undefined) {
  return queryOptions({
    queryKey: ["trips", "upcoming", userId],
    queryFn: async () => {
      const trips = await fetchJson<TripWithFlight[]>(
        `/trips?userId=${userId}&status=upcoming&_expand=flight`
      )
      return trips.sort((a, b) =>
        a.flight.departTime.localeCompare(b.flight.departTime)
      )
    },
    enabled: userId != null,
  })
}

// All of the user's trips — used to aggregate the "Trips over time" chart.
export function allTripsQuery(userId: number | undefined) {
  return queryOptions({
    queryKey: ["trips", "all", userId],
    queryFn: () => fetchJson<Trip[]>(`/trips?userId=${userId}`),
    enabled: userId != null,
  })
}

/** Cheapest scheduled flight on each of the 4 cheapest distinct routes. */
export const dealsQuery = queryOptions({
  queryKey: ["flights", "deals"],
  queryFn: async () => {
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
  },
  staleTime: 5 * 60_000,
})

// Today's live departures board — polled on an interval to feel real-time.
export const flightStatusQuery = queryOptions({
  queryKey: ["flights", "status-board"],
  queryFn: () =>
    fetchJson<Flight[]>(
      "/flights?status_ne=scheduled&_sort=departTime&_order=asc&_limit=12"
    ),
  refetchInterval: 10_000,
})

// --- Server-sorted, paginated flights (Book a Flight table) ---

export const FLIGHTS_PAGE_SIZE = 50

export interface FlightsPage {
  data: Flight[]
  meta: { totalRowCount: number }
}

// A single "column sort" as produced by TanStack Table's SortingState.
export type SortSpec = { id: string; desc: boolean }

// Filters mirrored in the Book route's URL search params.
export interface FlightFilters {
  from?: string
  to?: string
  date?: string
  q?: string
}

async function fetchFlightsPage(
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

/**
 * Shared options for one page of the Book tab's table. Living here (rather
 * than inline in the route) means the dashboard tab bar can prefetch the exact
 * same query on hover — the key is built from the same values, so it always
 * matches.
 */
export function flightsPageQuery(
  page: number,
  sorting: SortSpec[],
  filters: FlightFilters
) {
  return queryOptions({
    queryKey: ["flights", "page", page, sorting, filters],
    queryFn: () => fetchFlightsPage(page, sorting, filters),
    // Keep the previous page on screen while the next one loads, so the table
    // doesn't collapse to a spinner on every page change.
    placeholderData: keepPreviousData,
  })
}
