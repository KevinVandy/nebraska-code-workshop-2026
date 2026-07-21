// Shared Recharts tooltip styled with the app's card tokens. Text stays in
// ink colors — the mark's color carries identity, not the text.
export function ChartTooltip({
  active,
  payload,
  label,
  formatValue = (v) => String(v),
  formatLabel = (l) => String(l),
}: {
  active?: boolean
  payload?: Array<{ value?: number | string }>
  label?: string | number
  formatValue?: (value: number | string) => string
  formatLabel?: (label: string | number) => string
}) {
  if (!active || !payload?.length || payload[0].value == null) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">
        {label != null ? formatLabel(label) : null}
      </p>
      <p className="font-semibold text-popover-foreground">
        {formatValue(payload[0].value)}
      </p>
    </div>
  )
}
