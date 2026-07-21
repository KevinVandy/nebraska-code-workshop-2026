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
