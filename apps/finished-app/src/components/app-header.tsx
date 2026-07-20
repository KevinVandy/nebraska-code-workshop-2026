import { Link } from "@tanstack/react-router"
import { Ghost, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { portraitUrl } from "@/lib/images"
import { demoUser } from "@/lib/placeholder"

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
] as const

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/dashboard" }}
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary font-medium" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground sm:flex"
          >
            <Search className="size-4" />
            <span>Search</span>
            <kbd className="ml-2 rounded border bg-background px-1.5 text-xs">⌘K</kbd>
          </button>
          <Button variant="outline" size="sm">
            <Ghost className="text-primary" />
            Ask Casper
          </Button>
          <ThemeToggle />
          <Avatar className="size-8">
            <AvatarImage src={portraitUrl(demoUser.name)} alt={demoUser.name} />
            <AvatarFallback>{demoUser.initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
