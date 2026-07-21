import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Ghost, LogOut, Search } from "lucide-react"

import type { User } from "@workspace/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button, buttonVariants } from "@workspace/ui/components/button"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "./auth-context"
import { useCasper } from "./casper/casper-context"
import { useShortcuts } from "./shortcuts/shortcuts-provider"
import { fetchUser } from "@/lib/api"
import { portraitUrl } from "@/lib/images"

// TanStack Router sets data-status="active" on active links. Styling the active
// state through `data-[status=active]:` variants (instead of `activeProps`)
// avoids conflicting Tailwind utilities — with activeProps the base and active
// colours are both present and CSS source order decides the winner.
const navLinkClass =
  "text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-medium data-[status=active]:text-foreground"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SiteHeader() {
  const { session, signOut } = useAuth()
  const { toggle } = useCasper()
  const { openPalette } = useShortcuts()
  const navigate = useNavigate()
  /* The signed-in user, fetched here — and again in the profile page, and
   * again on the dashboard overview. Three components, three requests for the
   * same record, no cache between them. */
  const [user, setUser] = React.useState<User | null>(null)
  React.useEffect(() => {
    if (session?.userId == null) {
      setUser(null)
      return
    }
    let ignore = false
    fetchUser(session.userId)
      .then((data) => {
        if (!ignore) setUser(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [session?.userId])

  const name = user?.name ?? session?.name ?? ""
  const avatar = user?.avatar || portraitUrl(name || "traveller")

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} className={navLinkClass}>
            Home
          </Link>
          <Link to="/about" className={navLinkClass}>
            About
          </Link>
          <Link to="/contact" className={navLinkClass}>
            Contact
          </Link>
          {/* TODO 4 — Dashboard belongs here, alongside the marketing links,
            * but only once signed in:
            *
            *   {session ? (
            *     <Link to="/dashboard" className={navLinkClass}>Dashboard</Link>
            *   ) : null}
            *
            * Type `to="/dash` and let autocomplete finish it. Until the route
            * file exists, TypeScript rejects the string outright — that's the
            * whole point of this exercise. */}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <button
                type="button"
                onClick={openPalette}
                className="hidden h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
              >
                <Search className="size-4" />
                <span>Search</span>
              </button>
              <Button variant="outline" size="sm" onClick={toggle}>
                <Ghost className="text-brand" />
                Ask Casper
              </Button>
              <ThemeToggle />
              {/* The avatar is the link to the profile page. */}
              <Link to="/profile" aria-label="Your profile" title={name}>
                <Avatar className="size-8 transition-opacity hover:opacity-80">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback>{initialsOf(name) || "GA"}</AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                onClick={() => {
                  signOut()
                  navigate({ to: "/" })
                }}
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link
                to="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link to="/signup" className={buttonVariants({ size: "sm" })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
