import { Link, createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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

/* EXERCISE 2 of 3 — row selection. Do status.tsx first.
 *
 * TODO 2a — feature set: same as status.tsx plus rowSelectionFeature.
 * TODO 2b — add a checkbox display column (header checkbox needs `indeterminate`).
 * TODO 2c — reach the cancel mutation from cells via typed table meta, not closures.
 * TODO 2d — selection state + getRowId, then a "Cancel selected (n)" bulk action.
 */

function OverviewPage() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const user = useQuery(currentUserQuery(session?.userId))
  const upcoming = useQuery(upcomingTripsQuery(session?.userId))
  const allTrips = useQuery(allTripsQuery(session?.userId))
  const deals = useQuery(dealsQuery)

  const cancel = useMutation({
    mutationFn: cancelTrip,
    onSuccess: () => {
      // Refetch everything trip-derived: the upcoming-trips table and the
      // trips-over-time chart (which skips cancelled trips when aggregating).
      queryClient.invalidateQueries({ queryKey: ["trips"] })
    },
  })

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
          {/* TODO 2 — replace this hand-written markup with a TanStack Table
           * that supports sorting, row selection, and a bulk-cancel action. */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Flight</TableHead>
                <TableHead className="whitespace-nowrap">Route</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Price</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.isPending ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading trips…
                  </TableCell>
                </TableRow>
              ) : upcoming.isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-destructive"
                  >
                    Couldn&apos;t load trips. Is the API running on :3300?
                  </TableCell>
                </TableRow>
              ) : (
                upcoming.data.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {trip.flight.flightNumber}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {trip.flight.originCode} → {trip.flight.destinationCode}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {trip.flight.departTime.slice(0, 10)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge
                        status={
                          trip.bookingStatus === "confirmed"
                            ? "Confirmed"
                            : "Pending"
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      ${trip.flight.price}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => cancel.mutate(trip.id)}
                        disabled={
                          cancel.isPending && cancel.variables === trip.id
                        }
                      >
                        Cancel
                      </Button>
                    </TableCell>
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
