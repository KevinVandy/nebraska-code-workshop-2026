import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { LogOut } from "lucide-react"

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
  const navigate = useNavigate()
  // The signed-in user — also fetched by the overview and profile pages.
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
          {/* Dashboard sits alongside the marketing links, but only once signed in. */}
          {session ? (
            <Link to="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
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
