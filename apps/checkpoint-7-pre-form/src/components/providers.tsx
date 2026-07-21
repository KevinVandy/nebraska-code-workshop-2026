import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import type { Session } from "@/lib/auth"

import { AuthProvider } from "./auth-context"
import { BookingProvider } from "./booking/booking-dialog"
import { Devtools } from "./devtools"

/**
 * App-wide providers — auth session and the booking dialog, available on
 * every page.
 */
export function AppProviders({
  initialSession,
  children,
}: {
  initialSession: Session | null
  children: React.ReactNode
}) {
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
      <AuthProvider initialSession={initialSession}>
        <BookingProvider>{children}</BookingProvider>
      </AuthProvider>
      <Devtools />
    </QueryClientProvider>
  )
}
