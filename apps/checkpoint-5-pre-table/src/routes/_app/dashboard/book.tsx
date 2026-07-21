import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import type { PriceHistoryPoint } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { useBooking } from "@/components/booking/booking-dialog"
import { PriceHistoryChart } from "@/components/price-history-chart"
import {
  API_URL,
  FLIGHTS_PAGE_SIZE,
  airportsQuery,
  flightsPageQuery,
} from "@/lib/api"

// Filters live in the URL, so they're shareable, bookmarkable, and any other
// part of the app can navigate here with typed values.
const bookSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute("/_app/dashboard/book")({
  validateSearch: bookSearchSchema,
  component: BookPage,
})

/** 30 days of seeded daily prices for one route (e.g. SLM→RSW). */
function priceHistoryQuery(from?: string, to?: string) {
  return queryOptions({
    queryKey: ["priceHistory", from, to],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/priceHistory?route=${from}-${to}`)
      if (!res.ok) throw new Error("Couldn't load price history.")
      return res.json() as Promise<PriceHistoryPoint[]>
    },
    enabled: Boolean(from && to),
    staleTime: Infinity, // seeded data — one point per day, never changes mid-session
  })
}

/* EXERCISE 3 of 3 — server-side sorting (details in EXERCISE.md).
 *
 * TODO 3a — feature set: sizing + sorting, NO sortedRowModel (the API sorts).
 * TODO 3b — columns, incl. a Book display column that uses table meta.
 * TODO 3c — create the table with manualSorting: true and sorting in state.
 * TODO 3d — render through table.FlexRender with sortable headers.
 * TODO 3e — register with devtools.
 */

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}
function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
function formatStops(stops: number) {
  return stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`
}

function BookPage() {
  const airports = useQuery(airportsQuery)
  const airportOptions = airports.data ?? []

  const filters = Route.useSearch()
  const navigate = Route.useNavigate()

  // Only fetches once both endpoints of the route are chosen (enabled flag).
  const priceHistory = useQuery(priceHistoryQuery(filters.from, filters.to))

  // Merge one filter into the URL (undefined removes the key).
  const setFilter = (key: "from" | "to" | "date" | "q", value: string) => {
    navigate({
      search: (prev) => ({ ...prev, [key]: value || undefined }),
      replace: true,
    })
  }

  const { openBooking } = useBooking()

  const [page, setPage] = React.useState(0)

  // No sorting yet — the API takes a sort spec, and the table you build in
  // TODO 3 is what will supply it. Until then, the default (departTime asc).
  const { data, isFetching, isLoading } = useQuery(
    flightsPageQuery(page, [], filters)
  )

  const flatData = data?.data ?? []
  const totalRowCount = data?.meta.totalRowCount ?? 0
  const pageCount = Math.max(1, Math.ceil(totalRowCount / FLIGHTS_PAGE_SIZE))

  // Any filter or sort change invalidates the current page number.
  React.useEffect(() => {
    setPage(0)
  }, [filters.from, filters.to, filters.date, filters.q])

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_2fr_auto] md:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="from">From</Label>
            <select
              id="from"
              className={selectClass}
              value={filters.from ?? ""}
              onChange={(e) => setFilter("from", e.target.value)}
            >
              <option value="">Any</option>
              {airportOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="to">To</Label>
            <select
              id="to"
              className={selectClass}
              value={filters.to ?? ""}
              onChange={(e) => setFilter("to", e.target.value)}
            >
              <option value="">Any</option>
              {airportOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              className={selectClass}
              value={filters.date ?? ""}
              onChange={(e) => setFilter("date", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Flight #, city, or airport code"
              value={filters.q ?? ""}
              onChange={(e) => setFilter("q", e.target.value)}
            />
          </div>
          <p className="pb-2 text-sm whitespace-nowrap text-muted-foreground">
            {/* isLoading (not a falsy count) — zero results is a real answer. */}
            {isLoading ? "…" : `${totalRowCount} flights found`}
          </p>
        </div>
      </Card>

      {/* Route picked → show its 30-day price trend from /priceHistory. */}
      {filters.from && filters.to && priceHistory.data?.length ? (
        <Card className="p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">
              Price trend · {filters.from} → {filters.to}
            </h2>
            <p className="text-xs text-muted-foreground">
              30-day low{" "}
              <span className="font-semibold text-brand">
                ${Math.min(...priceHistory.data.map((p) => p.price))}
              </span>
            </p>
          </div>
          <PriceHistoryChart data={priceHistory.data} />
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        {/* TODO 3d — replace this hand-written markup with a TanStack Table. */}
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Flight
              </th>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Route
              </th>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Duration
              </th>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Stops
              </th>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Seats left
              </th>
              <th className="border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground">
                Price
              </th>
              <th className="border-b px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-muted-foreground">
                  Loading flights…
                </td>
              </tr>
            ) : flatData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-muted-foreground">
                  No flights match your filters.
                </td>
              </tr>
            ) : (
              flatData.map((flight) => (
                <tr key={flight.id} className="border-b hover:bg-muted/40">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {flight.flightNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {flight.originCode} {formatTime(flight.departTime)} →{" "}
                    {flight.destinationCode} {formatTime(flight.arriveTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDuration(flight.durationMinutes)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatStops(flight.stops)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {flight.seatsLeft}
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">
                    ${flight.price}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Button
                      size="sm"
                      className="ml-auto"
                      onClick={() => openBooking({ kind: "flight", flight })}
                    >
                      Book
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Classic pagination — becomes infinite scroll in a later checkpoint. */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>
            Page {page + 1} of {pageCount} · {totalRowCount.toLocaleString()}{" "}
            flights
            {isFetching ? " · fetching…" : ""}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page >= pageCount - 1 || isFetching}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
