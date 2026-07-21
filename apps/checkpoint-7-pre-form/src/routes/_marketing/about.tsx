import { createFileRoute } from "@tanstack/react-router"

import { Photo } from "@/components/photo"
import { portraitUrl } from "@/lib/images"
import { leadership } from "@/lib/placeholder"

export const Route = createFileRoute("/_marketing/about")({
  component: AboutPage,
})

const values = [
  {
    title: "Safety first",
    body: "Every aircraft is inspected daily by our own maintenance crews, not contractors.",
  },
  {
    title: "Fair fares",
    body: "One price, shown up front. Bags and seats are optional add-ons, never surprises.",
  },
  {
    title: "Real service",
    body: "Our support team answers in under two minutes, day or night.",
  },
]

function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Our story</h1>
      <div className="mt-6 space-y-4 text-lg text-muted-foreground">
        <p>
          Ghost Airlines launched in 2023 to serve the small regional airports
          larger carriers had quietly abandoned. Our first three routes
          connected Boston to towns most travelers only knew from folklore —
          Salem, Sleepy Hollow, and Amityville — at fares that didn&apos;t
          require a second mortgage.
        </p>
        <p>
          Today we fly a fleet of single-class A220s to eight destinations
          across the U.S. and Europe, still built around the same idea: honest
          pricing, on-time departures, and a booking experience that
          doesn&apos;t feel haunted.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="space-y-2">
            <h3 className="font-semibold">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">Leadership</h2>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        {leadership.map((person) => (
          <div key={person.name} className="space-y-3">
            <Photo
              src={portraitUrl(person.name)}
              alt={person.name}
              className="size-16 rounded-full"
            />
            <div>
              <p className="font-semibold">{person.name}</p>
              <p className="text-sm text-muted-foreground">{person.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
