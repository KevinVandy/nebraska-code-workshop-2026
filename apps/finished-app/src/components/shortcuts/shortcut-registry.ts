/**
 * Single source of truth for the app's hotkeys.
 *
 * `Mod` is platform-adaptive in TanStack Hotkeys: ⌘ on macOS, Ctrl elsewhere —
 * so the cheat-sheet and the registrations can't drift apart.
 */
export interface ShortcutDef {
  /** TanStack Hotkeys registration string. */
  hotkey: string
  /** How it reads in the cheat-sheet. */
  label: string
  /** Optional override for how the key combo is displayed (e.g. "?"). */
  display?: string
  group: "Navigation" | "Actions"
}

export const SHORTCUTS: ShortcutDef[] = [
  { hotkey: "Mod+K", label: "Open command palette", group: "Actions" },
  { hotkey: "Mod+J", label: "Toggle Casper (AI assistant)", group: "Actions" },
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
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
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
