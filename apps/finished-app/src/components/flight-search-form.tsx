import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"

import { airportOptions } from "@/lib/placeholder"

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

// Presentational search widget. Wiring (URL search params + Query) comes later.
export function FlightSearchForm() {
  return (
    <form className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor="from">From</Label>
        <select id="from" className={fieldClass} defaultValue="BOS">
          {airportOptions.map((a) => (
            <option key={a.code} value={a.code}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="to">To</Label>
        <select id="to" className={fieldClass} defaultValue="SLM">
          {airportOptions.map((a) => (
            <option key={a.code} value={a.code}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="date">Date</Label>
        <input id="date" type="date" className={fieldClass} />
      </div>
      <Button type="submit" size="lg" className="h-9">
        Search flights
      </Button>
    </form>
  )
}
