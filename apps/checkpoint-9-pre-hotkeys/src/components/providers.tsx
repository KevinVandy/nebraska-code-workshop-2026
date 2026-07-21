import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import type { Session } from "@/lib/auth"

import { AuthProvider } from "./auth-context"
import { BookingProvider } from "./booking/booking-dialog"
import { Devtools } from "./devtools"
import { ShortcutsProvider } from "./shortcuts/shortcuts-provider"

/**
 * App-wide providers — auth, the booking dialog, and the keyboard-shortcut
 * layer (command palette + cheat sheet), available on every page.
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
        <BookingProvider>
          <ShortcutsProvider>{children}</ShortcutsProvider>
        </BookingProvider>
      </AuthProvider>
      <Devtools />
    </QueryClientProvider>
  )
}
