import * as React from "react"

import { CommandPalette } from "./command-palette"
import { ShortcutsDialog } from "./shortcuts-dialog"

interface ShortcutsContextValue {
  openPalette: () => void
}

const ShortcutsContext = React.createContext<ShortcutsContextValue | null>(null)

export function useShortcuts() {
  const ctx = React.useContext(ShortcutsContext)
  if (!ctx)
    throw new Error("useShortcuts must be used within ShortcutsProvider")
  return ctx
}

/**
 * Registers the app's global hotkeys and hosts the two dialogs they open.
 */
export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [cheatSheetOpen, setCheatSheetOpen] = React.useState(false)

  /* EXERCISE — TanStack Hotkeys (shortcut table + details in EXERCISE.md)
   *
   * TODO 1 — register the seven global hotkeys with useHotkey, gated { enabled }.
   * TODO 2 — wire up what they need: useAuth, useCasper, useNavigate.
   * TODO 3 — add hotkeysDevtoolsPlugin() in devtools.tsx.
   */

  const value = React.useMemo(
    () => ({ openPalette: () => setPaletteOpen(true) }),
    []
  )

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onShowShortcuts={() => setCheatSheetOpen(true)}
      />
      <ShortcutsDialog open={cheatSheetOpen} onOpenChange={setCheatSheetOpen} />
    </ShortcutsContext.Provider>
  )
}
