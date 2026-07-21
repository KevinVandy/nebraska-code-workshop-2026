
import type { Session } from "@/lib/auth"

import { AuthProvider } from "./auth-context"
import { BookingProvider } from "./booking/booking-dialog"
import { CasperProvider } from "./casper/casper-context"
import { CasperDrawer } from "./casper/casper-drawer"
import { Devtools } from "./devtools"
import { ShortcutsProvider } from "./shortcuts/shortcuts-provider"

/* TODO 4 — Add the QueryClientProvider here.
 *
 *   const [queryClient] = useState(() => new QueryClient({
 *     defaultOptions: {
 *       queries: { staleTime: 30_000, refetchOnWindowFocus: false },
 *     },
 *   }))
 *
 * Create it in a `useState` initializer, not as a module-level constant. It
 * makes no difference in this SPA, but it's what lets the same code run under
 * SSR later without leaking one user's cache into another user's request.
 */

/**
 * App-wide providers. Casper lives here (rather than in the dashboard layout)
 * so the assistant is reachable from any page once you're signed in.
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
        <BookingProvider>
          <CasperProvider>
            {/* Shortcuts live inside Casper's provider so ⌘J can toggle it. */}
            <ShortcutsProvider>
              {children}
              <CasperDrawer />
            </ShortcutsProvider>
          </CasperProvider>
        </BookingProvider>
      </AuthProvider>
      <Devtools />
    </>
  )
}
