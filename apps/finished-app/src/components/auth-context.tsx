import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { User } from "@workspace/types"

import {
  clearClientSession,
  setClientSession,
  sessionFromUser
  
} from "@/lib/auth"
import type {Session} from "@/lib/auth";

/* The session is read isomorphically in the root route's `beforeLoad` (from
 * the request cookie on the server, document.cookie in the browser) and handed
 * to this provider, so the server render and hydration always agree. The FAKE
 * part of auth is the cookie's unsigned contents — see src/lib/auth.ts. */

interface AuthContextValue {
  session: Session | null
  signIn: (user: User) => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null
  children: React.ReactNode
}) {
  const [session, setSession] = React.useState<Session | null>(initialSession)
  const queryClient = useQueryClient()

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
    () => ({ session, signIn, signOut }),
    [session, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
