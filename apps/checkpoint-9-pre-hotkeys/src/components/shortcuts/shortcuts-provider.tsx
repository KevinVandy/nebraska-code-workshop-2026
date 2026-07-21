import * as React from "react"

import { CommandPalette } from "./command-palette"
import { ShortcutsDialog } from "./shortcuts-dialog"

/* ============================================================================
 * EXERCISE — TanStack Hotkeys
 * ============================================================================
 *
 * Ghost Airlines has a command palette and a keyboard-shortcuts cheat-sheet,
 * but right now the only way to reach either is by clicking. Your job is to
 * make the app keyboard-driven.
 *
 * GIVEN: this provider's state, its context, and both dialogs (already
 * rendered below). The palette is reachable from the header's Search button,
 * so you can see what you're wiring up before it has a shortcut.
 *
 * Docs: https://tanstack.com/hotkeys
 * ==========================================================================*/

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

  /* TODO 1 — Register seven global hotkeys with `useHotkey`.
   *
   *   import { useHotkey } from "@tanstack/react-hotkeys"
   *
   *   useHotkey("Mod+K", (e) => {
   *     e.preventDefault()          // stop the browser's own ⌘K
   *     setPaletteOpen((open) => !open)
   *   }, { enabled })
   *
   * `Mod` is platform-adaptive: ⌘ on macOS, Ctrl everywhere else. Write it
   * once; TanStack Hotkeys resolves it per platform.
   *
   *   Mod+K   toggle the command palette       → setPaletteOpen
   *   Mod+J   toggle Casper                    → toggleCasper (TODO 2)
   *   Mod+/   toggle the shortcuts cheat-sheet → setCheatSheetOpen
   *   Mod+1   go to /dashboard                 → navigate (TODO 2)
   *   Mod+2   go to /dashboard/book
   *   Mod+3   go to /dashboard/status
   *   Mod+P   go to /profile
   *
   * Every destination is behind auth, so gate them all:
   *
   *   const enabled = Boolean(session)          // from useAuth()
   *
   * and pass `{ enabled }` as the third argument. Sign out and confirm
   * nothing fires.
   *
   * ⚠️ Why Mod+/ rather than "?" — the obvious cheat-sheet shortcut is Shift+/
   * (i.e. "?"), but TanStack Hotkeys deliberately won't typecheck
   * Shift+punctuation: which character Shift+/ produces depends on keyboard
   * layout. Try writing `useHotkey("Shift+/", ...)` and read the type error —
   * it's a nice example of a library preventing an i18n bug. Mod+/ is the
   * Slack convention, and it's what the cheat-sheet already advertises.
   */

  /* TODO 2 — Wire up what those hotkeys need:
   *
   *   const { session } = useAuth()                  // ../auth-context
   *   const { toggle: toggleCasper } = useCasper()   // ../casper/casper-context
   *   const navigate = useNavigate()                 // @tanstack/react-router
   *
   * (Casper's panel is an empty shell until the AI checkpoint, but toggling it
   * is still a real, visible effect.)
   */

  /* TODO 3 — Add the Hotkeys devtools panel.
   *
   * In src/components/devtools.tsx, import `hotkeysDevtoolsPlugin` from
   * "@tanstack/react-hotkeys-devtools" and add `hotkeysDevtoolsPlugin()` to
   * the plugins array. It lists every registered hotkey and flags conflicts,
   * which is exactly what you want when a shortcut silently doesn't fire.
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
