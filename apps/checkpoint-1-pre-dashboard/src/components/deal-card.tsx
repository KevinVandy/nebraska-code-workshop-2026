import * as React from "react"
import { Link } from "@tanstack/react-router"

import type { Flight } from "@workspace/types"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { useAuth } from "./auth-context"
import { useBooking } from "./booking/booking-dialog"
import { Photo } from "./photo"
import { API_URL } from "@/lib/api"
import { photoUrl } from "@/lib/images"

/** Cheapest bookable fare to this destination. */
async function fetchCheapestTo(code: string) {
  const res = await fetch(
    `${API_URL}/flights?status=scheduled&destinationCode=${code}&_sort=price&_limit=1`
  )
  if (!res.ok) throw new Error("Couldn't load fares.")
  const flights = (await res.json()) as Flight[]
  return flights[0]?.price ?? null
}

export function DealCard({
  route,
  city,
  code,
  price,
}: {
  route: string
  city: string
  /** Destination airport code — used to find a real bookable flight. */
  code: string
  /** Fallback shown while the live fare loads. */
  price: number
}) {
  const { session } = useAuth()
  const { openBooking } = useBooking()
  /* Show the LIVE cheapest fare so the card never disagrees with the price the
   * booking dialog resolves. Every card runs its own effect — four cards on
   * the home page means four requests, repeated on every mount, with nothing
   * shared between them or with the dialog that asks for the same thing. */
  const [livePrice, setLivePrice] = React.useState<number | null>(null)
  React.useEffect(() => {
    let ignore = false
    fetchCheapestTo(code)
      .then((p) => {
        if (!ignore) setLivePrice(p)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [code])

  const displayPrice = livePrice ?? price

  return (
    <Card className="overflow-hidden p-0">
      <Photo
        src={photoUrl(city, 600, 400)}
        alt={`${city} — ${route}`}
        className="h-40 border-b"
      />
      <div className="flex flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{route}</p>
          <p className="text-lg font-semibold">{city}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p>
            <span className="text-2xl font-bold text-brand">
              ${displayPrice}
            </span>{" "}
            <span className="text-sm text-muted-foreground">one-way</span>
          </p>
          {session ? (
            <Button
              size="sm"
              onClick={() =>
                openBooking({ kind: "route", destination: code, label: city })
              }
            >
              Book deal
            </Button>
          ) : (
            // Booking requires an account — nudge signed-out visitors to join.
            <Link
              to="/signup"
              className={buttonVariants({
                size: "sm",
                className: "whitespace-nowrap",
              })}
            >
              Sign up to get this deal
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
