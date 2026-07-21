import { Link, Outlet, createFileRoute } from "@tanstack/react-router"

const tabs = [
  { to: "/dashboard", label: "Overview", exact: true },
  { to: "/dashboard/book", label: "Book a Flight", exact: false },
  { to: "/dashboard/status", label: "Flight Status", exact: false },
] as const

// Active styling comes from the router's data-status attribute rather than
// `activeProps`, so the active colours reliably override the base ones instead
// of relying on Tailwind's CSS source order.
const tabClass =
  "-mb-px border-b-2 border-transparent py-4 text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:font-medium data-[status=active]:text-foreground"

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardLayout,
})

/* ============================================================================
 * EXERCISE — Prefetching with TanStack Query
 * ============================================================================
 *
 * Click between the three dashboard tabs. Every one shows a loading state for
 * a full second, every time — the API has a deliberate 1s delay, and nothing
 * is fetched until the route renders and its `useQuery` runs.
 *
 * But you know which tab someone is about to click a few hundred milliseconds
 * before they click it: their pointer is already sitting on it. Fetch then.
 *
 * TODO 1 — Prefetch each tab's data on hover.
 *
 *   const queryClient = useQueryClient()
 *
 *   const prefetchTab: Record<(typeof tabs)[number]["to"], () => void> = {
 *     "/dashboard": () => {
 *       void queryClient.ensureQueryData(currentUserQuery(session.userId))
 *       ...
 *     },
 *     ...
 *   }
 *
 * and wire it to the Links:
 *
 *   onMouseEnter={prefetchTab[tab.to]}
 *   onFocus={prefetchTab[tab.to]}      // keyboard users get it too
 *
 * Which queries each tab needs:
 *   /dashboard         currentUserQuery, upcomingTripsQuery, allTripsQuery, dealsQuery
 *   /dashboard/book    airportsQuery, flightsPageQuery(0, [], {})
 *   /dashboard/status  airportsQuery, flightStatusQuery
 *
 * They're all exported from src/lib/api.ts already, because the route and the
 * prefetch have to build the SAME query key — otherwise the route won't find
 * what you prefetched. That's the main reason those options live in a shared
 * file instead of inline in each route.
 *
 * `session` comes from `Route.useRouteContext()` — the _app guard already
 * narrowed it to non-null.
 *
 * TODO 2 — `ensureQueryData` vs `prefetchQuery`: choose deliberately.
 *
 * `ensureQueryData` respects `staleTime` — if the data is cached and still
 * fresh, it does nothing. `prefetchQuery` always refetches. Sweep your mouse
 * back and forth across the tab bar with the Network tab open and you'll see
 * exactly why that matters.
 *
 * TODO 3 — Notice what you DON'T have to do.
 *
 * There's no "prefetched data" state to hold, and no handoff to the route. The
 * prefetch writes into the same cache the route reads from, under the same
 * key, so the route simply finds it there. Break the key on purpose (prefetch
 * `flightsPageQuery(1, [], {})` instead of page 0) and watch the prefetch
 * quietly accomplish nothing.
 *
 * Docs: https://tanstack.com/query → "Prefetching & Router Integration"
 * ==========================================================================*/

function DashboardLayout() {
  return (
    <div className="container mx-auto px-4">
      <nav className="flex gap-6 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className={tabClass}
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
