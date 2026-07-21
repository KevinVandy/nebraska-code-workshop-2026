import { Card } from "@workspace/ui/components/card"

export function StatTile({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="gap-1 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
    </Card>
  )
}
