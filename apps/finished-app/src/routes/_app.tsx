import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"

import { useAuth } from "@/components/auth-context"
import { SiteHeader } from "@/components/site-header"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

function AppLayout() {
  const { session, ready } = useAuth()
  const navigate = useNavigate()

  /* FAKE AUTH: the session lives in a client-readable cookie, so the guard runs
   * in the browser once the cookie has been read. A real app would check the
   * session on the server in `beforeLoad` and redirect before rendering. The
   * genuinely enforced check is on the server route (see routes/api.chat.ts). */
  React.useEffect(() => {
    if (ready && !session) {
      navigate({
        to: "/login",
        search: { redirect: "/dashboard" },
        replace: true,
      })
    }
  }, [ready, session, navigate])

  if (!ready || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
