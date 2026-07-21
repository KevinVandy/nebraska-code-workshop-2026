import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { ChartTooltip } from "./chart-tooltip"

export type ChartPoint = { month: string; value: number }

export function TripsChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            dy={4}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            content={
              <ChartTooltip
                formatValue={(v) => `${v} trip${v === 1 ? "" : "s"}`}
              />
            }
          />
          {/* --brand rather than the pale primary yellow: it keeps ≥3:1
           * contrast against the card surface in BOTH light and dark mode. */}
          <Bar
            dataKey="value"
            fill="var(--brand)"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
