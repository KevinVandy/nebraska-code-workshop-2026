import { Link, Outlet, createFileRoute } from "@tanstack/react-router"

const tabs = [
  { to: "/dashboard", label: "Overview", exact: true },
  { to: "/dashboard/book", label: "Book a Flight", exact: false },
  { to: "/dashboard/status", label: "Flight Status", exact: false },
] as const

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="container mx-auto px-4">
      <nav className="flex gap-6 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.exact }}
            className="-mb-px border-b-2 border-transparent py-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "border-primary text-foreground font-medium" }}
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
