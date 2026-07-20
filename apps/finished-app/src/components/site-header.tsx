import { Link } from "@tanstack/react-router"

import { buttonVariants } from "@workspace/ui/components/button"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Log in
          </Link>
          <Link to="/signup" className={buttonVariants({ size: "sm" })}>
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}
