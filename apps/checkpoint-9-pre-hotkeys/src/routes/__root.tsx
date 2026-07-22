import { useState } from "react"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools"
import { pacerDevtoolsPlugin } from "@tanstack/react-pacer-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import appCss from "@workspace/ui/globals.css?url"

import { AuthProvider } from "@/components/auth-context"
import { BookingProvider } from "@/components/booking/booking-dialog"
import { ShortcutsProvider } from "@/components/shortcuts/shortcuts-provider"
import { readSession } from "@/lib/auth"

export const Route = createRootRoute({
  // Read the session cookie on every navigation — on the server for the
  // initial document request, in the browser after that — and expose it to
  // every route via router context. Child routes guard on `context.session`.
  beforeLoad: () => ({ session: readSession() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ghost Airlines" },
      {
        name: "description",
        content:
          "Low fares to the places everyone's talking about. Ghost Airlines flies you to the country's most talked-about small towns.",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted-foreground">
        The requested page could not be found.
      </p>
    </main>
  ),
  shellComponent: RootDocument,
})

// Applies the persisted theme before hydration to avoid a flash of the wrong theme.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`

function RootDocument({ children }: { children: React.ReactNode }) {
  // Seed React auth state from router context so the server render and the
  // first client render agree (no signed-out flash, no hydration mismatch).
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider initialSession={session}>
            <BookingProvider>
              <ShortcutsProvider>{children}</ShortcutsProvider>
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
              tableDevtoolsPlugin(),
              formDevtoolsPlugin(),
              pacerDevtoolsPlugin(),
              // TODO 3 — add hotkeysDevtoolsPlugin() here (see shortcuts-provider.tsx).
            ]}
          />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
