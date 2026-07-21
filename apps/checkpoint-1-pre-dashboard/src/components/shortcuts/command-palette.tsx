import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plane, Search, User } from "lucide-react"

import type { Flight } from "@workspace/types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { useCasper } from "../casper/casper-context"
import { API_URL } from "@/lib/api"

/** Free-text flight lookup for the palette's "Flights" section. */
async function searchFlights(q: string) {
  const res = await fetch(
    `${API_URL}/flights?status=scheduled&q=${encodeURIComponent(q)}&_limit=5`
  )
  if (!res.ok) throw new Error("Flight search failed.")
  return (await res.json()) as Flight[]
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
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { setOpen: setCasperOpen } = useCasper()
  const [text, setText] = React.useState("")
  const [query, setQuery] = React.useState("")

  // Reset whenever it opens so you always start fresh.
  React.useEffect(() => {
    if (open) {
      setText("")
      setQuery("")
    }
  }, [open])

  /* Search-as-you-type, by hand. The `ignore` guard is doing real work here:
   * without it a slow response for "sal" can land after a fast one for
   * "salem" and overwrite the newer results. */
  const [flights, setFlights] = React.useState<Flight[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  React.useEffect(() => {
    if (!query.trim()) {
      setFlights([])
      return
    }
    let ignore = false
    setIsSearching(true)
    searchFlights(query)
      .then((data) => {
        if (!ignore) setFlights(data)
      })
      .catch(() => {
        if (!ignore) setFlights([])
      })
      .finally(() => {
        if (!ignore) setIsSearching(false)
      })
    return () => {
      ignore = true
    }
  }, [query])

  const close = () => onOpenChange(false)

  const commands: Command[] = [
    // TODO 4 — add "Go to …" commands for the three dashboard tabs.
    {
      id: "profile",
      label: "Go to Profile",
      icon: <User className="size-4" />,
      run: () => navigate({ to: "/profile" }),
    },
    {
      id: "casper",
      label: "Ask Casper",
      icon: <Search className="size-4" />,
      run: () => setCasperOpen(true),
    },
  ]

  const filtered = text
    ? commands.filter((c) => c.label.toLowerCase().includes(text.toLowerCase()))
    : commands

  const matchedFlights = query.trim() ? flights : []

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
              setQuery(e.target.value)
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
                    // TODO 4 — navigate to the Book tab filtered to this flight number.
                  }}
                />
              ))}
            </Section>
          ) : null}

          {filtered.length === 0 && matchedFlights.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {isSearching ? "Searching…" : "No matches."}
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
