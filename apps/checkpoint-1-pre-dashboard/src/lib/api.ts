import type { Airport, Flight, User } from "@workspace/types"

/* Plain async functions that talk to the Ghost Airlines API (json-server).
 *
 * Only a few endpoints so far — the app doesn't have a dashboard yet. Note that
 * every caller also hand-rolls its own loading state, error state, and
 * cancellation; replacing all of that with TanStack Query is checkpoint 2. */

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

/** The signed-in user. */
export function fetchUser(userId: number) {
  return fetchJson<User>(`/users/${userId}`)
}
