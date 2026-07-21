import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { SHORTCUTS, formatHotkey } from "./shortcut-registry"

const GROUPS = ["Navigation", "Actions"] as const

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Powered by TanStack Hotkeys — <code>Mod</code> is ⌘ on macOS and
            Ctrl elsewhere.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          {GROUPS.map((group) => (
            <div key={group} className="space-y-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group}
              </p>
              <ul className="space-y-2">
                {SHORTCUTS.filter((s) => s.group === group).map((shortcut) => (
                  <li
                    key={shortcut.hotkey}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {shortcut.label}
                    </span>
                    <kbd className="rounded border bg-muted px-2 py-0.5 font-mono text-xs whitespace-nowrap">
                      {formatHotkey(shortcut.hotkey)}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
