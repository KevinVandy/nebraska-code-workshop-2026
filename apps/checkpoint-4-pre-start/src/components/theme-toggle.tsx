import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      // ignore storage errors
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
    >
      {dark ? <Moon /> : <Sun />}
    </Button>
  )
}
