import { Link } from "@tanstack/react-router"

import { Logo } from "./logo"

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", to: "/contact" },
      { label: "Manage booking", to: "/dashboard" },
      { label: "Baggage info", to: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", to: "/about" },
      { label: "Privacy policy", to: "/about" },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Low fares to the towns everyone&apos;s talking about.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3 text-sm">
            <p className="font-semibold">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-sm text-muted-foreground">
          © 2026 Ghost Airlines. Not actually haunted.
        </div>
      </div>
    </footer>
  )
}
