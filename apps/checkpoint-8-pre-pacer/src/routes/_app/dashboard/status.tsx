import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  columnSizingFeature,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools"
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
import { cn } from "@workspace/ui/lib/utils"

import { StatusBadge } from "@/components/status-badge"
import { airportsQuery, flightStatusQuery } from "@/lib/api"

/* This table's TanStack Table v9 feature set: client-side sorting + sizing.
 * Declared per-route so each table registers only what it uses. */
const features = tableFeatures({
  columnSizingFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

// Fixed-width arrow so sorting never reflows or wraps the header label.
function SortIndicator({ sorted }: { sorted: false | string }) {
  return (
    <span aria-hidden className="w-3 shrink-0 text-xs leading-none">
      {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : ""}
    </span>
  )
}

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
// inside a column definition) so the columns stay static and the table reacts
// to the async airports query purely through `data`.
type StatusRow = Flight & { destinationLabel: string }

const columnHelper = createColumnHelper<typeof features, StatusRow>()

const columns = columnHelper.columns([
  columnHelper.accessor("flightNumber", {
    header: "Flight",
    size: 120,
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("destinationLabel", {
    header: "Destination",
    size: 240,
  }),
  columnHelper.accessor("gate", { header: "Gate", size: 100 }),
  columnHelper.accessor("departTime", {
    id: "scheduled",
    header: "Scheduled",
    size: 140,
    cell: (info) => formatTime(info.getValue()),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    size: 140,
    cell: (info) => <StatusBadge status={statusLabels[info.getValue()]} />,
  }),
])

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

  const table = useTable(
    {
      features,
      data: rows,
      columns,
      getRowId: (row) => String(row.id),
    },
    (state) => state
  )

  // Register this table with the unified TanStack Devtools panel.
  useTanStackTableDevtools(table)

  const updated = flights.dataUpdatedAt
    ? new Date(flights.dataUpdatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

  const columnCount = table.getAllColumns().length

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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap"
                      style={{ width: header.getSize() }}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex items-center gap-1 whitespace-nowrap",
                          canSort &&
                            "cursor-pointer select-none hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!canSort}
                      >
                        <table.FlexRender header={header} />
                        <SortIndicator sorted={header.column.getIsSorted()} />
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {flights.isPending ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading flights…
                </TableCell>
              </TableRow>
            ) : flights.isError ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="py-8 text-center text-destructive"
                >
                  Couldn&apos;t load the status board. Is the API running on
                  :3300?
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
