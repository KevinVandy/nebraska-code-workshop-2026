import * as React from "react"

import { CommandPalette } from "./command-palette"

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
 * Hosts the command palette. For now it opens from the header's Search
 * button; a later checkpoint (TanStack Hotkeys) adds keyboard shortcuts.
 */
export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const value = React.useMemo(
    () => ({ openPalette: () => setPaletteOpen(true) }),
    []
  )

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </ShortcutsContext.Provider>
  )
}
