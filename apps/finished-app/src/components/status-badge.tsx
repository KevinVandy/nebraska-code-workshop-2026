import { cn } from "@workspace/ui/lib/utils"

const styles: Record<string, string> = {
  // positive
  "On Time":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  // warning
  Delayed:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  // negative
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  )
}
