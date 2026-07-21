import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import appCss from "@workspace/ui/globals.css?url"

import { AppProviders } from "@/components/providers"
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <AppProviders initialSession={session}>{children}</AppProviders>
        <Scripts />
      </body>
    </html>
  )
}
