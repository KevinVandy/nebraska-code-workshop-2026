import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { User } from "@workspace/types"

import {
  clearClientSession,
  getClientSession,
  setClientSession,
  sessionFromUser,
  type Session,
} from "@/lib/auth"

/* FAKE AUTH (see src/lib/auth.ts): this provider just mirrors an unsigned
 * cookie into React state. A real app would validate the session server-side. */

interface AuthContextValue {
  session: Session | null
  /** False until the cookie has been read on the client (avoids SSR mismatch). */
  ready: boolean
  signIn: (user: User) => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [ready, setReady] = React.useState(false)
  const queryClient = useQueryClient()

  // Read the cookie after mount: the server render has no access to it, so
  // starting as "logged out" and syncing here keeps hydration consistent.
  React.useEffect(() => {
    setSession(getClientSession())
    setReady(true)
  }, [])

  const signIn = React.useCallback((user: User) => {
    const next = sessionFromUser(user)
    setClientSession(next)
    setSession(next)
  }, [])

  const signOut = React.useCallback(() => {
    clearClientSession()
    setSession(null)
    // Drop any user-scoped data so the next account doesn't see it.
    queryClient.clear()
  }, [queryClient])

  const value = React.useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
