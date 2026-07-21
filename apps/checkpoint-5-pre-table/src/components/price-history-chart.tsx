import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { PriceHistoryPoint } from "@workspace/types"

import { ChartTooltip } from "./chart-tooltip"

function formatDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  })
}

/** 30-day price trend for one route, from the seeded /priceHistory resource. */
export function PriceHistoryChart({ data }: { data: PriceHistoryPoint[] }) {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={formatDay}
            minTickGap={48}
            dy={4}
          />
          <YAxis
            width={44}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(v: number) => `$${v}`}
            domain={["dataMin - 10", "dataMax + 10"]}
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            content={
              <ChartTooltip
                formatValue={(v) => `$${v} one-way`}
                formatLabel={(l) => formatDay(String(l))}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
