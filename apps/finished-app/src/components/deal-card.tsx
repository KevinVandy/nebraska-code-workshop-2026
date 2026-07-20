import { Link } from "@tanstack/react-router"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { useAuth } from "./auth-context"
import { useBooking } from "./booking/booking-dialog"
import { Photo } from "./photo"
import { photoUrl } from "@/lib/images"

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
  price: number
}) {
  const { session } = useAuth()
  const { openBooking } = useBooking()

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
            <span className="text-2xl font-bold text-brand">${price}</span>{" "}
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
