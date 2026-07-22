import * as React from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import type { Airport, Flight } from "@workspace/types"
import { Loader2 } from "lucide-react"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { useAuth } from "@/components/auth-context"
import { useBooking } from "@/components/booking/booking-dialog"
import { DealCard } from "@/components/deal-card"
import { FlightSearchForm } from "@/components/flight-search-form"
import { Photo } from "@/components/photo"
import { photoUrl } from "@/lib/images"
import { fetchAirports, fetchDeals } from "@/lib/api"
import { destinations, valueProps } from "@/lib/placeholder"

// The hero search form's state lives in the URL, so a search is shareable:
// /?from=SLM&to=TSY&date=… lands with the form already filled out.
const homeSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
})

export const Route = createFileRoute("/_marketing/")({
  validateSearch: homeSearchSchema,
  component: HomePage,
})

function HomePage() {
  const { session } = useAuth()
  const { openBooking } = useBooking()

  /* Live featured deals — the cheapest fare on each of four routes, fetched
   * by hand. Note this is ANOTHER copy of the fetch-in-an-effect pattern. */
  // `null` means "still loading" — one more piece of state to hand-roll.
  const [deals, setDeals] = React.useState<Flight[] | null>(null)
  const [airports, setAirports] = React.useState<Airport[]>([])
  React.useEffect(() => {
    let ignore = false
    Promise.all([fetchDeals(), fetchAirports()])
      .then(([dealsData, airportsData]) => {
        if (!ignore) {
          setDeals(dealsData)
          setAirports(airportsData)
        }
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])
  const cityOf = (code: string) =>
    airports.find((a) => a.code === code)?.city ?? code

  return (
    <div className="container mx-auto px-4">
      {/* Hero */}
      <section className="py-16 md:py-24">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-balance md:text-6xl">
          Low fares to the places everyone&apos;s talking about.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Real routes, real prices, zero hidden fees. Ghost Airlines flies you
          to the country&apos;s most talked-about small towns — book in minutes.
        </p>
        <Card className="mt-10 p-6">
          <FlightSearchForm />
        </Card>
      </section>

      {/* Featured deals */}
      <section className="py-8">
        <h2 className="text-2xl font-bold">Featured deals</h2>
        <p className="mt-1 text-muted-foreground">
          Fares this good tend to disappear.
        </p>
        {deals === null ? (
          <div className="mt-6 flex h-40 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((flight) => (
              <DealCard
                key={flight.id}
                route={`${flight.originCode} → ${flight.destinationCode}`}
                city={cityOf(flight.destinationCode)}
                code={flight.destinationCode}
                price={flight.price}
              />
            ))}
          </div>
        )}
      </section>

      {/* Value props */}
      <section className="grid gap-8 py-12 md:grid-cols-3">
        {valueProps.map((prop) => (
          <div key={prop.title} className="space-y-2">
            <div className="size-8 rounded-lg bg-primary/15" />
            <h3 className="font-semibold">{prop.title}</h3>
            <p className="text-sm text-muted-foreground">{prop.body}</p>
          </div>
        ))}
      </section>

      {/* Where we fly */}
      <section className="py-8 pb-20">
        <h2 className="text-2xl font-bold">Where we fly</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {destinations.map((dest) => (
            <Card key={dest.city} className="gap-0 overflow-hidden p-0">
              <Photo
                src={photoUrl(dest.city, 400, 240)}
                alt={`${dest.city}, ${dest.region}`}
                className="h-24 border-b"
              />
              <div className="space-y-1 p-4">
                <p className="font-semibold">{dest.city}</p>
                <p className="text-sm text-muted-foreground">{dest.region}</p>
                <p className="text-sm font-medium text-brand">
                  from ${dest.price}
                </p>
                {session ? (
                  <Button
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() =>
                      openBooking({
                        kind: "route",
                        destination: dest.code,
                        label: dest.city,
                      })
                    }
                  >
                    Book
                  </Button>
                ) : (
                  <Link
                    to="/signup"
                    className={buttonVariants({
                      size: "sm",
                      className: "mt-1 w-full",
                    })}
                  >
                    Sign up to get this deal
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
