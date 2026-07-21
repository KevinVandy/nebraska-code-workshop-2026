import * as React from "react"
import { useNavigate } from "@tanstack/react-router"

import type { Airport } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"

import { fetchAirports } from "@/lib/api"

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

/**
 * The home-page hero search. Options come from the real airports API, and
 * submitting deep-links into the dashboard's Book tab via typed search params
 * — if you're signed out, the _app guard bounces you through login and back.
 */
export function FlightSearchForm() {
  const navigate = useNavigate()
  // Yet another airports fetch — the third in this app, none of them shared.
  const [airports, setAirports] = React.useState<Airport[]>([])
  React.useEffect(() => {
    let ignore = false
    fetchAirports()
      .then((data) => {
        if (!ignore) setAirports(data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])
  const [from, setFrom] = React.useState("SLM")
  const [to, setTo] = React.useState("")
  const [date, setDate] = React.useState("")

  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        navigate({
          to: "/dashboard/book",
          search: {
            from: from || undefined,
            to: to || undefined,
            date: date || undefined,
          },
        })
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="from">From</Label>
        <select
          id="from"
          className={fieldClass}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="">Anywhere</option>
          {airports.map((a) => (
            <option key={a.code} value={a.code}>
              {a.city} ({a.code})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="to">To</Label>
        <select
          id="to"
          className={fieldClass}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          <option value="">Anywhere</option>
          {airports.map((a) => (
            <option key={a.code} value={a.code}>
              {a.city} ({a.code})
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date</Label>
        <input
          id="date"
          type="date"
          className={fieldClass}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="h-9">
        Search flights
      </Button>
    </form>
  )
}
