import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { RefreshCw } from "lucide-react"

import type { Flight, FlightStatus as FlightStatusType } from "@workspace/types"
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
import { airportsQuery, flightStatusQuery } from "@/lib/api"

/* EXERCISE 1 of 3 — TanStack Table. Start here.
 *
 * TODO 1a — declare this table's feature set with tableFeatures().
 * TODO 1b — define typed columns with createColumnHelper.
 * TODO 1c — create the table with useTable and render it via table.FlexRender.
 * TODO 1d — make the headers sortable, with a fixed-width sort indicator.
 * TODO 1e — register the table with the devtools (hook + plugin).
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
  const flights = useQuery(flightStatusQuery)
  const airports = useQuery(airportsQuery)

  const rows = React.useMemo<StatusRow[]>(() => {
    const cityByCode = new Map(
      (airports.data ?? []).map((a) => [a.code, a.city])
    )
    return (flights.data ?? []).map((f) => ({
      ...f,
      destinationLabel: `${cityByCode.get(f.destinationCode) ?? f.destinationCode} (${f.destinationCode})`,
    }))
  }, [flights.data, airports.data])

  const updated = flights.dataUpdatedAt
    ? new Date(flights.dataUpdatedAt).toLocaleTimeString([], {
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
          onClick={() => flights.refetch()}
          disabled={flights.isFetching}
        >
          <RefreshCw
            className={flights.isFetching ? "animate-spin" : undefined}
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
            {flights.isPending ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading flights…
                </TableCell>
              </TableRow>
            ) : flights.isError ? (
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
