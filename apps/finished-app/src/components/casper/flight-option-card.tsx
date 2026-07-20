import { Button } from "@workspace/ui/components/button"

import type { FlightSummary } from "@/lib/ai-tools"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })
}

// Generative UI: rendered when Casper's searchFlights tool call returns.
export function FlightOptionCard({
  flight,
  onBook,
  disabled,
}: {
  flight: FlightSummary
  onBook: (flight: FlightSummary) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium whitespace-nowrap">
          {flight.flightNumber}
          <span className="ml-2 text-muted-foreground">
            {flight.originCode} {formatTime(flight.departTime)} →{" "}
            {flight.destinationCode} {formatTime(flight.arriveTime)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(flight.departTime)} ·{" "}
          {flight.stops === 0
            ? "Nonstop"
            : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}{" "}
          · {flight.seatsLeft} seats left
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-semibold text-brand">${flight.price}</span>
        <Button size="sm" onClick={() => onBook(flight)} disabled={disabled}>
          Book
        </Button>
      </div>
    </div>
  )
}
