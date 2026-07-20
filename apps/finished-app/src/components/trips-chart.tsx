import { tripsOverTime } from "@/lib/placeholder"

export type ChartPoint = { month: string; value: number }

// Simple bar chart (plain divs) matching the mockup. A later phase can swap this
// for a shadcn/Recharts chart. Defaults to placeholder data when none is passed.
export function TripsChart({ data = tripsOverTime }: { data?: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="flex h-56 items-end justify-between gap-2">
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{d.value}</span>
          <div
            className="w-full rounded-t bg-chart-1"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  )
}
