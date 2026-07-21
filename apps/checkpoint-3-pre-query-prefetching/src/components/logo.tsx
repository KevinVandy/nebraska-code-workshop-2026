import { Ghost } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Ghost className="size-5" />
      </span>
      <span>Ghost Airlines</span>
    </span>
  )
}
