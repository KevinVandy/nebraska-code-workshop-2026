import { useMemo } from "react"
import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"

import {
  airportsQuery,
  allTripsQuery,
  currentUserQuery,
  dealsQuery,
  flightStatusQuery,
  flightsPageQuery,
  upcomingTripsQuery,
} from "@/lib/api"

// Active styling comes from the router's data-status attribute rather than
// `activeProps`, so the active colours reliably override the base ones instead
// of relying on Tailwind's CSS source order.
const tabClass =
  "-mb-px border-b-2 border-transparent py-4 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-medium data-[status=active]:text-foreground"

export const Route = createFileRoute("/_app/dashboard")({
  // TODO 2 — pick the right ssr mode for an authed, per-user subtree.
  component: DashboardLayout,
})

function DashboardLayout() {
  const queryClient = useQueryClient()
  // Guaranteed non-null: the _app beforeLoad guard re-provides it narrowed.
  const { session } = Route.useRouteContext()

  /* Prefetch on hover: with the API's fake 1s latency, hovering a tab for a
   * moment means clicking it renders instantly. `ensureQueryData` is the
   * polite prefetcher — it respects staleTime, so hovering back and forth
   * doesn't re-hit the API while the data is still fresh. */
  const tabs = useMemo(
    () =>
      [
        {
          to: "/dashboard",
          label: "Overview",
          exact: true,
          prefetch: () => {
            void queryClient.ensureQueryData(currentUserQuery(session.userId))
            void queryClient.ensureQueryData(upcomingTripsQuery(session.userId))
            void queryClient.ensureQueryData(allTripsQuery(session.userId))
            void queryClient.ensureQueryData(dealsQuery)
          },
        },
        {
          to: "/dashboard/book",
          label: "Book a Flight",
          exact: false,
          prefetch: () => {
            void queryClient.ensureQueryData(airportsQuery)
            // First page of the unfiltered, unsorted table — the state the
            // tab opens in, so the key matches what the Book route will ask
            // for.
            void queryClient.ensureQueryData(flightsPageQuery(0, [], {}))
          },
        },
        {
          to: "/dashboard/status",
          label: "Flight Status",
          exact: false,
          prefetch: () => {
            void queryClient.ensureQueryData(airportsQuery)
            void queryClient.ensureQueryData(flightStatusQuery)
          },
        },
      ] as const,
    [queryClient, session.userId]
  )

  return (
    <div className="container mx-auto px-4">
      <nav className="flex gap-6 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className={tabClass}
            onMouseEnter={tab.prefetch}
            onFocus={tab.prefetch}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="py-8">
        <Outlet />
      </div>
    </div>
  )
}
