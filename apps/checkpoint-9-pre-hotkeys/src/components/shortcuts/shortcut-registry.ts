/**
 * DISPLAY data for the cheat-sheet dialog. The actual registrations are the
 * seven inline `useHotkey` calls in shortcuts-provider.tsx — those ARE the
 * TanStack Hotkeys lesson, so they stay written out one by one. If you add a
 * hotkey there, add its row here too.
 *
 * `Mod` is platform-adaptive in TanStack Hotkeys: ⌘ on macOS, Ctrl elsewhere.
 */
export interface ShortcutDef {
  /** TanStack Hotkeys registration string. */
  hotkey: string
  /** How it reads in the cheat-sheet. */
  label: string
  group: "Navigation" | "Actions"
}

export const SHORTCUTS: ShortcutDef[] = [
  { hotkey: "Mod+K", label: "Open command palette", group: "Actions" },
  // Note: TanStack Hotkeys deliberately disallows Shift+punctuation (layout
  // dependent — Shift+/ is "?" only on some keyboards), so the cheat-sheet uses
  // the Slack-style Mod+/ instead of "?".
  { hotkey: "Mod+/", label: "Show keyboard shortcuts", group: "Actions" },
  { hotkey: "Mod+1", label: "Go to Overview", group: "Navigation" },
  { hotkey: "Mod+2", label: "Go to Book a Flight", group: "Navigation" },
  { hotkey: "Mod+3", label: "Go to Flight Status", group: "Navigation" },
  { hotkey: "Mod+P", label: "Go to Profile", group: "Navigation" },
]

/** Render a hotkey string for display, e.g. "Mod+K" → "⌘ K" / "Ctrl K". */
export function formatHotkey(hotkey: string): string {
  // navigator.platform is deprecated but remains the pragmatic Mac sniff for
  // choosing display glyphs (the hotkeys themselves don't rely on it).
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform)
  return hotkey
    .split("+")
    .map((part) => {
      if (part === "Mod") return isMac ? "⌘" : "Ctrl"
      if (part === "Shift") return isMac ? "⇧" : "Shift"
      if (part === "Alt") return isMac ? "⌥" : "Alt"
      return part
    })
    .join(" ")
}
