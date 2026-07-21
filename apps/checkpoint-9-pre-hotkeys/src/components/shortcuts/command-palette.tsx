import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useDebouncer } from "@tanstack/react-pacer"
import { Keyboard, Plane, Search, User } from "lucide-react"

import type { Flight } from "@workspace/types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { API_URL } from "@/lib/api"
import { formatHotkey } from "./shortcut-registry"

/** Free-text flight lookup for the palette's "Flights" section. */
function flightSearchQuery(q: string) {
  return queryOptions({
    queryKey: ["flights", "search", q],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/flights?status=scheduled&q=${encodeURIComponent(q)}&_limit=5`
      )
      if (!res.ok) throw new Error("Flight search failed.")
      return res.json() as Promise<Flight[]>
    },
    enabled: q.trim().length > 0,
  })
}

interface Command {
  id: string
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onShowShortcuts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowShortcuts: () => void
}) {
  const navigate = useNavigate()
  const [text, setText] = React.useState("")
  const [query, setQuery] = React.useState("")

  // Pacer again: typing stays instant, the flight lookup is debounced. The
  // debouncer object (vs a plain debounced callback) exposes cancel(), which
  // we need below.
  const queryDebouncer = useDebouncer((value: string) => setQuery(value), {
    wait: 300,
  })

  // Reset whenever it opens so you always start fresh. Cancelling matters:
  // without it, a keystroke debounced just before Escape would fire AFTER
  // reopening and show phantom results under an empty input.
  React.useEffect(() => {
    if (open) {
      queryDebouncer.cancel()
      setText("")
      setQuery("")
    }
  }, [open, queryDebouncer])

  const flights = useQuery(flightSearchQuery(query))

  const close = () => onOpenChange(false)

  const commands: Command[] = [
    {
      id: "overview",
      label: "Go to Overview",
      hint: formatHotkey("Mod+1"),
      icon: <Plane className="size-4" />,
      run: () => navigate({ to: "/dashboard" }),
    },
    {
      id: "book",
      label: "Go to Book a Flight",
      hint: formatHotkey("Mod+2"),
      icon: <Plane className="size-4" />,
      run: () => navigate({ to: "/dashboard/book" }),
    },
    {
      id: "status",
      label: "Go to Flight Status",
      hint: formatHotkey("Mod+3"),
      icon: <Plane className="size-4" />,
      run: () => navigate({ to: "/dashboard/status" }),
    },
    {
      id: "profile",
      label: "Go to Profile",
      hint: formatHotkey("Mod+P"),
      icon: <User className="size-4" />,
      run: () => navigate({ to: "/profile" }),
    },
    {
      id: "shortcuts",
      label: "Show keyboard shortcuts",
      hint: formatHotkey("Mod+/"),
      icon: <Keyboard className="size-4" />,
      run: onShowShortcuts,
    },
  ]

  const filtered = text
    ? commands.filter((c) => c.label.toLowerCase().includes(text.toLowerCase()))
    : commands

  const matchedFlights = query.trim() ? (flights.data ?? []) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-24 max-w-lg translate-y-0 gap-0 p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              queryDebouncer.maybeExecute(e.target.value)
            }}
            placeholder="Search commands or flights…"
            className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <Section title="Commands">
              {filtered.map((command) => (
                <Row
                  key={command.id}
                  icon={command.icon}
                  label={command.label}
                  hint={command.hint}
                  onSelect={() => {
                    close()
                    command.run()
                  }}
                />
              ))}
            </Section>
          ) : null}

          {matchedFlights.length > 0 ? (
            <Section title="Flights">
              {matchedFlights.map((flight) => (
                <Row
                  key={flight.id}
                  icon={<Plane className="size-4" />}
                  label={`${flight.flightNumber} · ${flight.originCode} → ${flight.destinationCode}`}
                  hint={`$${flight.price}`}
                  onSelect={() => {
                    close()
                    navigate({
                      to: "/dashboard/book",
                      search: { q: flight.flightNumber },
                    })
                  }}
                />
              ))}
            </Section>
          ) : null}

          {filtered.length === 0 && matchedFlights.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {flights.isFetching ? "Searching…" : "No matches."}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      {children}
    </div>
  )
}

function Row({
  icon,
  label,
  hint,
  onSelect,
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm",
        "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {hint ? (
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-muted-foreground">
          {hint}
        </kbd>
      ) : null}
    </button>
  )
}
