import { Link } from "@tanstack/react-router"
import { queryOptions, useQuery } from "@tanstack/react-query"

import type { Flight } from "@workspace/types"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { useAuth } from "./auth-context"
import { useBooking } from "./booking/booking-dialog"
import { Photo } from "./photo"
import { API_URL } from "@/lib/api"
import { photoUrl } from "@/lib/images"

/** Cheapest bookable fare to this destination — what the dialog will book. */
function cheapestToQuery(code: string) {
  return queryOptions({
    queryKey: ["flights", "cheapest-to", code],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/flights?status=scheduled&destinationCode=${code}&_sort=price&_limit=1`
      )
      if (!res.ok) throw new Error("Couldn't load fares.")
      const flights = (await res.json()) as Flight[]
      return flights[0]?.price ?? null
    },
    staleTime: 5 * 60_000,
  })
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
  // Show the LIVE cheapest fare so the card never disagrees with the price
  // the booking dialog resolves for the same destination.
  const livePrice = useQuery(cheapestToQuery(code))
  const displayPrice = livePrice.data ?? price

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
