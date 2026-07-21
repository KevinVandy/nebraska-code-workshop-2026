import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { SiteHeader } from "@/components/site-header"

export const Route = createFileRoute("/_app")({
  /* This guard is REAL and runs before anything renders — on the server for
   * direct hits, in the browser for client-side navigations. The only fake
   * part of auth is what the cookie contains (see src/lib/auth.ts): it's
   * unsigned, so a real app would verify a signature or a server-side session
   * here instead of trusting it. The genuinely enforced server check lives in
   * routes/api.chat.ts. */
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      })
    }
    // Re-provide the session, now narrowed: children see `Session`, not
    // `Session | null` — the guard above proves it exists.
    return { session: context.session }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
