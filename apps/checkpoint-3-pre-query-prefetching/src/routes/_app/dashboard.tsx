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

/* EXERCISE — Prefetching (full walkthrough in EXERCISE.md)
 *
 * TODO 1 — prefetch each tab's queries on hover/focus with queryClient.ensureQueryData.
 * TODO 2 — compare ensureQueryData vs prefetchQuery with the Network tab open.
 * TODO 3 — break a query key on purpose and watch the prefetch silently no-op.
 */

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
