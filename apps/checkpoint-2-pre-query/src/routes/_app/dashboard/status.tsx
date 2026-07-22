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

/* EXERCISE — TanStack Query
 *
 * TODO 1 — replace this file's hand-rolled fetching with two useQuery calls.
 * TODO 2 — define shared queryOptions in src/lib/api.ts (airports get a long staleTime).
 * TODO 3 — convert the rest of the app's fetches and mutations (list in EXERCISE.md).
 * TODO 4 — wire up QueryClientProvider, the devtools panel, and cache-clear on sign-out.
 */

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
  /* Fetching, by hand: loading flags, error state, cancellation, a manual
   * refetch counter, and a polling interval — all our problem. TODO 1. */
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
          <RefreshCw className={isFetching ? "animate-spin" : undefined} />
          Refresh
        </Button>
      </div>

      <Card className="p-0">
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
