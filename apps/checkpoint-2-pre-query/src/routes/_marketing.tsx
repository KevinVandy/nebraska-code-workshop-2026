import { Outlet, createFileRoute } from "@tanstack/react-router"

import { Footer } from "@/components/footer"
import { SiteHeader } from "@/components/site-header"

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
})

function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
