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
  return (
    <>
      <AuthProvider initialSession={initialSession}>
        <BookingProvider>{children}</BookingProvider>
      </AuthProvider>
      <Devtools />
    </>
  )
}
