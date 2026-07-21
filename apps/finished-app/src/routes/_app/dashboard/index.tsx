import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper, useTable } from "@tanstack/react-table"
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
  allTripsQuery,
  cancelTrip,
  currentUserQuery,
  dealsQuery,
  upcomingTripsQuery,
} from "@/lib/api"
import { SortIndicator, dataTableFeatures } from "@/lib/table"

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

const columnHelper = createColumnHelper<
  typeof dataTableFeatures,
  TripWithFlight
>()

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
      // Invalidate so the table + chart refetch with the cancelled trip removed.
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })

  // Keep the column definitions static: cells read the latest mutation through
  // this ref on each render instead of the columns depending on it.
  const cancelRef = React.useRef(cancel)
  cancelRef.current = cancel

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
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => cancelRef.current.mutate(row.original.id)}
              disabled={
                cancelRef.current.isPending &&
                cancelRef.current.variables === row.original.id
              }
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
      features: dataTableFeatures,
      data: upcoming.data ?? [],
      columns,
      state: { rowSelection },
      onRowSelectionChange: setRowSelection,
      getRowId: (row) => String(row.id),
    },
    (state) => state
  )

  // Register this table with the unified TanStack Devtools panel.
  useTanStackTableDevtools(table)

  // Aggregate trips-per-month for the chart.
  const chartData: ChartPoint[] = MONTHS.map((month) => ({ month, value: 0 }))
  for (const trip of allTrips.data ?? []) {
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
      sub: `${user.data?.tier ?? ""} member`,
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
        <CardHeader>
          <CardTitle>Upcoming trips</CardTitle>
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
