import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { RefreshCw } from "lucide-react"

import type {
  Airport,
  Flight,
  FlightStatus as FlightStatusType,
} from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { StatusBadge } from "@/components/status-badge"
import { fetchAirports, fetchFlightStatusBoard } from "@/lib/api"

/* ============================================================================
 * EXERCISE 1 of 3 — TanStack Table
 * ============================================================================
 *
 * Start here: this is the simplest of the app's three tables. It's currently
 * hand-written markup — hardcoded <TableHead>s and a .map() of <TableRow>s.
 * That works, but it can't sort, and every column's rendering logic is tangled
 * into the JSX.
 *
 * TODO 1a — Declare this table's feature set.
 *
 * v9 is opt-in: a table only gets the features you register, which keeps the
 * bundle small. This one needs client-side sorting and column sizing:
 *
 *   const features = tableFeatures({
 *     columnSizingFeature,
 *     rowSortingFeature,
 *     sortedRowModel: createSortedRowModel(),
 *     sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic,
 *                datetime: sortFn_datetime, text: sortFn_text },
 *   })
 *
 * TODO 1b — Define the columns with a column helper.
 *
 *   const columnHelper = createColumnHelper<typeof features, StatusRow>()
 *   const columns = columnHelper.columns([
 *     columnHelper.accessor("flightNumber", { header: "Flight", size: 120 }),
 *     ...
 *   ])
 *
 * Move the per-cell formatting out of the JSX below and into `cell` renderers
 * — e.g. the StatusBadge, and formatTime for the scheduled column. Note the
 * columns array is defined at MODULE level here, outside the component: these
 * definitions don't depend on anything that changes per render.
 *
 * TODO 1c — Create the table and render it.
 *
 *   const table = useTable({ features, data: rows, columns,
 *                            getRowId: (row) => String(row.id) }, (s) => s)
 *
 * Then swap the hardcoded markup for `table.getHeaderGroups()` and
 * `table.getRowModel().rows`, rendering each header/cell through
 * `<table.FlexRender header={header} />` / `<table.FlexRender cell={cell} />`.
 *
 * TODO 1d — Make the headers sortable.
 *
 * Wrap each header in a button wired to `header.column.getToggleSortingHandler()`,
 * disabled when `!header.column.getCanSort()`. Add a fixed-width sort arrow so
 * the header text doesn't shift when it appears:
 *
 *   function SortIndicator({ sorted }: { sorted: false | string }) {
 *     return (
 *       <span aria-hidden className="w-3 shrink-0 text-xs leading-none">
 *         {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : ""}
 *       </span>
 *     )
 *   }
 *
 * TODO 1e — Register the table with devtools.
 *
 *   useTanStackTableDevtools(table)
 *
 * and add `tableDevtoolsPlugin()` to src/components/devtools.tsx. You'll want
 * it for the next two tables.
 *
 * Docs: https://tanstack.com/table
 * ==========================================================================*/

/* ============================================================================
 * EXERCISE — TanStack Query
 * ============================================================================
 *
 * Every fetch in this app is hand-rolled useState + useEffect. It works. It's
 * also where most of the code went, and it quietly does several things wrong.
 *
 * Start with this file — scroll down to StatusPage and read what it takes to
 * show one polling table.
 *
 * TODO 1 — Replace the fetching here with two `useQuery` calls.
 *
 *   const flights = useQuery(flightStatusQuery)
 *   const airports = useQuery(airportsQuery)
 *
 * You'll define those options in src/lib/api.ts with `queryOptions({ queryKey,
 * queryFn })` — the plain fetch functions there become the queryFns.
 *
 * Things that stop being your problem:
 *   - loading and error state       → isPending / isError
 *   - the `ignore` race guard       → Query cancels stale requests for you
 *   - the manual refetch counter    → flights.refetch()
 *   - the setInterval poll          → refetchInterval: 10_000
 *   - "when did this last update?"  → flights.dataUpdatedAt
 *
 * TODO 2 — Give airports a long staleTime.
 *
 * `staleTime: Infinity` on airportsQuery. They don't change during a workshop.
 * Then notice something: THREE components fetch airports (here, the Book tab,
 * and the home page's search form). Right now that's three requests. With a
 * shared cache key it's one — and Query dedupes even simultaneous callers.
 *
 * TODO 3 — Do the same across the rest of the app.
 *
 *   src/components/site-header.tsx          the signed-in user
 *   src/routes/_app/profile.tsx             user + save mutation
 *   src/routes/_app/dashboard/index.tsx     4 fetches + the cancel mutation
 *   src/routes/_app/dashboard/book.tsx      airports, flights page, price history
 *   src/components/booking/booking-dialog.tsx   cheapest flight + book mutation
 *   src/components/deal-card.tsx            per-card fare lookup
 *   src/components/shortcuts/command-palette.tsx  live search
 *   src/components/flight-search-form.tsx   airports
 *
 * For the mutations, use `useMutation` and invalidate on success:
 *
 *   const cancel = useMutation({
 *     mutationFn: cancelTrip,
 *     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trips"] }),
 *   })
 *
 * Look at how the current code refreshes after a cancel — it re-runs a fetch
 * by bumping a counter, and anything ELSE showing trips stays stale.
 * Invalidation fixes every observer of that key at once.
 *
 * TODO 4 — Wire up the provider and devtools.
 *
 *   src/components/providers.tsx  — wrap the tree in <QueryClientProvider>
 *                                   with a client made in useState (already
 *                                   scaffolded, see the TODO there)
 *   src/components/devtools.tsx   — add the Query panel
 *   src/components/auth-context.tsx — clear the cache on sign-out
 *
 * Docs: https://tanstack.com/query
 * ==========================================================================*/

export const Route = createFileRoute("/_app/dashboard/status")({
  component: StatusPage,
})

const statusLabels: Record<FlightStatusType, string> = {
  "on-time": "On Time",
  delayed: "Delayed",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

// The airport city name is joined into the row data (rather than looked up
// while rendering) so the row objects are self-contained.
type StatusRow = Flight & { destinationLabel: string }

function StatusPage() {
  /* ── Fetching, by hand ──────────────────────────────────────────────────
   *
   * Two endpoints, and everything around them is our problem: loading flags,
   * error state, cancellation on unmount, a manual refetch, and an interval
   * to keep the board live. This is ~60 lines that do nothing product-specific.
   *
   * Read it, then read the TODO at the top of the file.
   */
  const [flights, setFlights] = React.useState<Flight[] | null>(null)
  const [flightsError, setFlightsError] = React.useState<Error | null>(null)
  const [isFetching, setIsFetching] = React.useState(true)
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null)

  const [airports, setAirports] = React.useState<Airport[] | null>(null)

  // A counter we bump to force a refetch (the Refresh button, and the poll).
  const [refetchCount, setRefetchCount] = React.useState(0)

  React.useEffect(() => {
    // `ignore` prevents a slow response from overwriting a newer one after
    // the component has moved on — the classic useEffect race condition.
    let ignore = false
    setIsFetching(true)
    fetchFlightStatusBoard()
      .then((data) => {
        if (ignore) return
        setFlights(data)
        setFlightsError(null)
        setUpdatedAt(Date.now())
      })
      .catch((err: unknown) => {
        if (ignore) return
        setFlightsError(err instanceof Error ? err : new Error("Failed"))
      })
      .finally(() => {
        if (!ignore) setIsFetching(false)
      })
    return () => {
      ignore = true
    }
  }, [refetchCount])

  // Airports rarely change, but we have nowhere to cache them — so this runs
  // again every time you visit the tab, and again in every other component
  // that needs airports.
  React.useEffect(() => {
    let ignore = false
    fetchAirports()
      .then((data) => {
        if (!ignore) setAirports(data)
      })
      .catch(() => {
        if (!ignore) setAirports([])
      })
    return () => {
      ignore = true
    }
  }, [])

  // Poll every 10s so the board feels live.
  React.useEffect(() => {
    const id = setInterval(() => setRefetchCount((n) => n + 1), 10_000)
    return () => clearInterval(id)
  }, [])

  const isPending = flights === null && flightsError === null

  const rows = React.useMemo<StatusRow[]>(() => {
    const cityByCode = new Map((airports ?? []).map((a) => [a.code, a.city]))
    return (flights ?? []).map((f) => ({
      ...f,
      destinationLabel: `${cityByCode.get(f.destinationCode) ?? f.destinationCode} (${f.destinationCode})`,
    }))
  }, [flights, airports])

  const updated = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Departures &amp; arrivals</h2>
          <span className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            Updated {updated}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefetchCount((n) => n + 1)}
          disabled={isFetching}
        >
          <RefreshCw
            className={isFetching ? "animate-spin" : undefined}
          />
          Refresh
        </Button>
      </div>

      <Card className="p-0">
        {/* TODO 1c/1d — replace this hand-written markup with a TanStack Table. */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Flight</TableHead>
              <TableHead className="whitespace-nowrap">Destination</TableHead>
              <TableHead className="whitespace-nowrap">Gate</TableHead>
              <TableHead className="whitespace-nowrap">Scheduled</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading flights…
                </TableCell>
              </TableRow>
            ) : flightsError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-destructive"
                >
                  Couldn&apos;t load the status board. Is the API running on
                  :3300?
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {row.flightNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.destinationLabel}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.gate}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatTime(row.departTime)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={statusLabels[row.status]} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
