import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useHotkey } from "@tanstack/react-hotkeys"

import { useAuth } from "../auth-context"
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
 * Registers the app's global hotkeys with TanStack Hotkeys and hosts the two
 * dialogs they open. Shortcuts are only active while signed in, since every
 * destination is behind auth.
 */
export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [cheatSheetOpen, setCheatSheetOpen] = React.useState(false)
  const { session } = useAuth()
  const navigate = useNavigate()

  const enabled = Boolean(session)

  useHotkey(
    "Mod+K",
    (e) => {
      e.preventDefault()
      setPaletteOpen((open) => !open)
    },
    { enabled }
  )

  // TODO — register Mod+J to toggle Casper with useCasper's `toggle`, gated { enabled }.

  useHotkey(
    "Mod+/",
    (e) => {
      e.preventDefault()
      setCheatSheetOpen((open) => !open)
    },
    { enabled }
  )

  useHotkey(
    "Mod+1",
    (e) => {
      e.preventDefault()
      navigate({ to: "/dashboard" })
    },
    { enabled }
  )

  useHotkey(
    "Mod+2",
    (e) => {
      e.preventDefault()
      navigate({ to: "/dashboard/book" })
    },
    { enabled }
  )

  useHotkey(
    "Mod+3",
    (e) => {
      e.preventDefault()
      navigate({ to: "/dashboard/status" })
    },
    { enabled }
  )

  useHotkey(
    "Mod+P",
    (e) => {
      e.preventDefault()
      navigate({ to: "/profile" })
    },
    { enabled }
  )

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
