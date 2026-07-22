import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import { AuthProvider } from "@/components/auth-context"
import { BookingProvider } from "@/components/booking/booking-dialog"
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

  // A fresh client per render tree: once on the client, per-request on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={session}>
        <BookingProvider>
          <Outlet />
        </BookingProvider>
      </AuthProvider>
      {/* One devtools shell for every TanStack library in the app. */}
      <TanStackDevtools
        config={{ hideUntilHover: true }}
        plugins={[
          {
            id: "tanstack-query",
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel />,
          },
          {
            id: "tanstack-router",
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          formDevtoolsPlugin(),
        ]}
      />
    </QueryClientProvider>
  )
}
