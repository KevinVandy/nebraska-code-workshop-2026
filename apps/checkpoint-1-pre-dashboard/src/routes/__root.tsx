import { Outlet, createRootRoute } from "@tanstack/react-router"

import { AppProviders } from "@/components/providers"
import { readSession } from "@/lib/auth"

export const Route = createRootRoute({
  // Read the session cookie on every navigation and expose it to every route
  // via router context. Child routes guard on `context.session`.
  beforeLoad: () => ({ session: readSession() }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">
        The requested page could not be found.
      </p>
    </main>
  ),
  component: RootComponent,
})

function RootComponent() {
  // Seed React auth state from router context.
  const { session } = Route.useRouteContext()

  return (
    <AppProviders initialSession={session}>
      <Outlet />
    </AppProviders>
  )
}
