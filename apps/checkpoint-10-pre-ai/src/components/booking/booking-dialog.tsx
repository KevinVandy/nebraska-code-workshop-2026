import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import type { Flight, Trip } from "@workspace/types"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useAuth } from "../auth-context"
import { API_URL } from "@/lib/api"

/**
 * What the user asked to book. Either an exact flight (from the dashboard
 * table or Casper) or a route/deal from the marketing pages, where we look up
 * the cheapest matching flight first.
 */
export type BookingTarget =
  | { kind: "flight"; flight: Flight }
  | { kind: "route"; origin?: string; destination?: string; label: string }

/** Cheapest upcoming bookable flight on a route (used for deal targets). */
function cheapestFlightQuery(origin?: string, destination?: string) {
  return queryOptions({
    queryKey: ["flights", "cheapest", origin, destination],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "scheduled",
        _sort: "price",
        _limit: "1",
      })
      if (origin) params.set("originCode", origin)
      if (destination) params.set("destinationCode", destination)
      const res = await fetch(`${API_URL}/flights?${params.toString()}`)
      if (!res.ok) throw new Error("Couldn't look up flights for that route.")
      const flights = (await res.json()) as Flight[]
      return flights[0] ?? null
    },
    enabled: origin != null || destination != null,
  })
}

async function bookFlight(input: {
  userId: number
  flight: Flight
  passengers: number
}) {
  const bookingRef = Math.random().toString(36).slice(2, 8).toUpperCase()
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      flightId: input.flight.id,
      bookingRef,
      status: "upcoming",
      bookingStatus: "confirmed",
      seat: `${Math.ceil(Math.random() * 30)}A`,
      cabin: input.flight.cabin,
      passengers: input.passengers,
      bookedAt: new Date().toISOString(),
    }),
  })
  if (!res.ok)
    throw new Error("Couldn't complete the booking. Please try again.")
  const trip = (await res.json()) as Trip
  return { ...trip, bookingRef }
}

interface BookingContextValue {
  openBooking: (target: BookingTarget) => void
}

const BookingContext = React.createContext<BookingContextValue | null>(null)

export function useBooking() {
  const ctx = React.useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be used within BookingProvider")
  return ctx
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = React.useState<BookingTarget | null>(null)
  // Bumped on every open; used as the dialog's `key` so each booking attempt
  // remounts with fresh state (no effect-based reset needed).
  const [openCount, setOpenCount] = React.useState(0)

  const openBooking = React.useCallback((next: BookingTarget) => {
    setTarget(next)
    setOpenCount((count) => count + 1)
  }, [])
  const value = React.useMemo(() => ({ openBooking }), [openBooking])

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingDialog
        key={openCount}
        target={target}
        onClose={() => setTarget(null)}
      />
    </BookingContext.Provider>
  )
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function BookingDialog({
  target,
  onClose,
}: {
  target: BookingTarget | null
  onClose: () => void
}) {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [confirmed, setConfirmed] = React.useState<{
    bookingRef: string
  } | null>(null)

  // For a route/deal we have to resolve the actual flight first.
  const routeTarget = target?.kind === "route" ? target : undefined
  const cheapest = useQuery(
    cheapestFlightQuery(routeTarget?.origin, routeTarget?.destination)
  )

  const flight: Flight | null =
    target?.kind === "flight" ? target.flight : (cheapest.data ?? null)

  const book = useMutation({
    mutationFn: () => {
      if (!session || !flight) throw new Error("Not ready to book.")
      return bookFlight({ userId: session.userId, flight, passengers: 1 })
    },
    onSuccess: (trip) => {
      setConfirmed({ bookingRef: trip.bookingRef })
      queryClient.invalidateQueries({ queryKey: ["trips"] })
      queryClient.invalidateQueries({ queryKey: ["flights"] })
    },
  })

  const open = target !== null
  const resolving = target?.kind === "route" && cheapest.isPending

  return (
    <Dialog open={open} onOpenChange={(next: boolean) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        {confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle>You&apos;re booked ✈️</DialogTitle>
              <DialogDescription>
                Confirmation{" "}
                <span className="font-mono font-semibold text-foreground">
                  {confirmed.bookingRef}
                </span>
                . It&apos;s now in your upcoming trips.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm your booking</DialogTitle>
              <DialogDescription>
                {resolving
                  ? `Finding the best fare${routeTarget ? ` for ${routeTarget.label}` : ""}…`
                  : flight
                    ? "Review the details before we book this flight."
                    : "No bookable flight was found for that route."}
              </DialogDescription>
            </DialogHeader>

            {flight ? (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{flight.flightNumber}</span>
                  <span className="text-xl font-bold text-brand">
                    ${flight.price}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {flight.originCode} {formatTime(flight.departTime)} →{" "}
                  {flight.destinationCode} {formatTime(flight.arriveTime)}
                </p>
                <p className="text-muted-foreground">
                  {formatDate(flight.departTime)} ·{" "}
                  {flight.stops === 0
                    ? "Nonstop"
                    : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}{" "}
                  · 1 passenger
                </p>
              </div>
            ) : null}

            {book.isError ? (
              <p className="text-sm text-destructive">{book.error.message}</p>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {session ? (
                <Button
                  onClick={() => book.mutate()}
                  disabled={!flight || book.isPending || resolving}
                >
                  {book.isPending ? "Booking…" : "Confirm booking"}
                </Button>
              ) : (
                // Booking requires an account — send them to sign up.
                <Link
                  to="/signup"
                  className={buttonVariants()}
                  onClick={onClose}
                >
                  Sign up to book
                </Link>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
