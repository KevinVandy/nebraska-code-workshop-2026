import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  columnSizingFeature,
  createColumnHelper,
  createSortedRowModel,
  metaHelper,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools"
import type { RowSelectionState } from "@tanstack/react-table"
import type { TripWithFlight } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { useAuth } from "@/components/auth-context"
import { StatTile } from "@/components/stat-tile"
import { StatusBadge } from "@/components/status-badge"
import { TripsChart } from "@/components/trips-chart"
import type { ChartPoint } from "@/components/trips-chart"
import {
  API_URL,
  allTripsQuery,
  currentUserQuery,
  dealsQuery,
  upcomingTripsQuery,
} from "@/lib/api"

export const Route = createFileRoute("/_app/dashboard/")({
  component: OverviewPage,
})

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// Cancel a booked trip (PATCH). The mutation invalidates ["trips"] on success.
async function cancelTrip(tripId: number) {
  const res = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  })
  if (!res.ok) throw new Error(`Failed to cancel trip ${tripId}`)
}

/* This table's TanStack Table v9 feature set. Declared per-route so each
 * table only registers what it actually uses — this one is the only table in
 * the app with row selection. `tableMeta` is a type-only slot: it types
 * `options.meta`, which is how cells reach the cancel mutation without the
 * column definitions depending on it. */
const features = tableFeatures({
  columnSizingFeature,
  rowSortingFeature,
  rowSelectionFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
  tableMeta: metaHelper<{
    cancelTrip: (tripId: number) => void
    cancellingId?: number
  }>(),
})

// Fixed-width arrow so sorting never reflows or wraps the header label.
function SortIndicator({ sorted }: { sorted: false | string }) {
  return (
    <span aria-hidden className="w-3 shrink-0 text-xs leading-none">
      {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : ""}
    </span>
  )
}

const columnHelper = createColumnHelper<typeof features, TripWithFlight>()

function OverviewPage() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const user = useQuery(currentUserQuery(session?.userId))
  const upcoming = useQuery(upcomingTripsQuery(session?.userId))
  const allTrips = useQuery(allTripsQuery(session?.userId))
  const deals = useQuery(dealsQuery)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const cancel = useMutation({
    mutationFn: cancelTrip,
    onSuccess: () => {
      // Refetch everything trip-derived: the upcoming-trips table and the
      // trips-over-time chart (which skips cancelled trips when aggregating).
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.display({
          id: "select",
          size: 48,
          header: ({ table }) => (
            <input
              type="checkbox"
              aria-label="Select all"
              checked={table.getIsAllRowsSelected()}
              // A checkbox can be checked, unchecked, or half-checked — the
              // last one only exists as a DOM property, hence the ref.
              ref={(el) => {
                if (el) el.indeterminate = table.getIsSomeRowsSelected()
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              aria-label={`Select ${row.original.flight.flightNumber}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          ),
        }),
        columnHelper.accessor((row) => row.flight.flightNumber, {
          id: "flight",
          header: "Flight",
          size: 110,
          cell: (info) => (
            <span className="font-medium">{info.getValue()}</span>
          ),
        }),
        columnHelper.accessor(
          (row) => `${row.flight.originCode} → ${row.flight.destinationCode}`,
          { id: "route", header: "Route", size: 140 }
        ),
        columnHelper.accessor((row) => row.flight.departTime.slice(0, 10), {
          id: "date",
          header: "Date",
          size: 130,
        }),
        columnHelper.accessor("bookingStatus", {
          header: "Status",
          size: 130,
          cell: (info) => (
            <StatusBadge
              status={info.getValue() === "confirmed" ? "Confirmed" : "Pending"}
            />
          ),
        }),
        columnHelper.accessor((row) => row.flight.price, {
          id: "price",
          header: "Price",
          size: 110,
          cell: (info) => (
            <span className="font-medium">${info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "Actions",
          size: 120,
          // Cells reach the mutation through `table.options.meta` (typed by
          // the `tableMeta` slot above), so the column definitions never
          // depend on per-render values and can stay static.
          cell: ({ row, table }) => (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => table.options.meta?.cancelTrip(row.original.id)}
              disabled={table.options.meta?.cancellingId === row.original.id}
            >
              Cancel
            </Button>
          ),
        }),
      ]),
    []
  )

  const table = useTable(
    {
      features,
      data: upcoming.data ?? [],
      columns,
      state: { rowSelection },
      onRowSelectionChange: setRowSelection,
      getRowId: (row) => String(row.id),
      meta: {
        cancelTrip: cancel.mutate,
        cancellingId: cancel.isPending ? cancel.variables : undefined,
      },
    },
    (state) => state
  )

  // Register this table with the unified TanStack Devtools panel.
  useTanStackTableDevtools(table)

  // Aggregate trips-per-month for the chart, skipping cancelled trips so the
  // bars visibly drop when a trip is cancelled from the table below.
  const chartData: ChartPoint[] = MONTHS.map((month) => ({ month, value: 0 }))
  for (const trip of allTrips.data ?? []) {
    if (trip.status === "cancelled") continue
    const monthIndex = new Date(trip.bookedAt).getMonth()
    chartData[monthIndex].value += 1
  }

  const stats = [
    {
      label: "Upcoming Trips",
      value: upcoming.data ? String(upcoming.data.length) : "—",
      sub: upcoming.data
        ? `${upcoming.data.filter((t) => t.bookingStatus === "confirmed").length} confirmed`
        : "",
    },
    {
      label: "Ghost Miles",
      value: user.data ? user.data.milesBalance.toLocaleString() : "—",
      sub: user.data ? `${user.data.tier} member` : "",
    },
    {
      label: "Next Flight",
      value: upcoming.data?.[0]
        ? `${Math.max(
            0,
            Math.ceil(
              (new Date(upcoming.data[0].flight.departTime).getTime() -
                Date.now()) /
                86_400_000
            )
          )} days`
        : "—",
      sub: upcoming.data?.[0]
        ? `${upcoming.data[0].flight.flightNumber} to ${upcoming.data[0].flight.destinationCode}`
        : "",
    },
    {
      label: "Total Spent",
      value: user.data ? `$${user.data.totalSpent.toLocaleString()}` : "—",
      sub: "Across all bookings",
    },
  ]

  const columnCount = table.getAllColumns().length

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trips over time</CardTitle>
          </CardHeader>
          <CardContent>
            <TripsChart data={chartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deals for you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Live: the cheapest scheduled flight on each of 4 routes. Each
             * deal links into Book a Flight with typed search params. */}
            {(deals.data ?? []).map((flight) => (
              <Link
                key={flight.id}
                to="/dashboard/book"
                search={{ from: flight.originCode, to: flight.destinationCode }}
                className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3 text-sm hover:bg-muted"
              >
                <span>
                  {flight.originCode} → {flight.destinationCode}
                </span>
                <span className="font-semibold text-brand">
                  ${flight.price}
                </span>
              </Link>
            ))}
            {deals.isPending
              ? Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-lg bg-muted/40"
                  />
                ))
              : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming trips</CardTitle>
          {/* Row selection's payoff: bulk-cancel everything checked. */}
          {Object.keys(rowSelection).length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                for (const tripId of Object.keys(rowSelection)) {
                  cancel.mutate(Number(tripId))
                }
                setRowSelection({})
              }}
            >
              Cancel selected ({Object.keys(rowSelection).length})
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
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
              {upcoming.isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading trips…
                  </TableCell>
                </TableRow>
              ) : upcoming.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    className="py-8 text-center text-destructive"
                  >
                    Couldn&apos;t load trips. Is the API running on :3300?
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
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
        </CardContent>
      </Card>
    </div>
  )
}
