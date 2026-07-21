import { Ghost, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { useAuth } from "../auth-context"
import { useCasper } from "./casper-context"

/**
 * Casper, the Ghost Airlines assistant.
 *
 * The panel and its open/close wiring exist; the assistant itself gets built
 * in a later checkpoint (TanStack AI). For now it's an empty shell — which is
 * all this checkpoint needs, since you'll be adding a keyboard shortcut that
 * toggles it.
 */
export function CasperDrawer() {
  const { open, setOpen } = useCasper()
  const { session } = useAuth()

  // Casper is signed-in only.
  if (!open || !session) return null

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-2xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ghost className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Casper</p>
            <p className="text-xs text-muted-foreground">
              Your travel assistant
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center px-8 text-center">
        <p className="text-sm text-muted-foreground">
          Casper arrives in the TanStack AI checkpoint. For now this panel is
          just something for your new keyboard shortcut to toggle.
        </p>
      </div>
    </aside>
  )
}
