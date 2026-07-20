import { useEffect, useState } from "react"
import { MDXProvider } from "@mdx-js/react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { slides } from "./slides"
import {
  Columns,
  DevObsessed,
  GradientText,
  Kicker,
  LibraryTitleSlide,
  Note,
  SectionSlide,
  TheStack,
  TitleSlide,
} from "./components/layouts"

// Available in every .mdx slide without an import
const mdxComponents = {
  Columns,
  DevObsessed,
  GradientText,
  Kicker,
  LibraryTitleSlide,
  Note,
  SectionSlide,
  TheStack,
  TitleSlide,
}

function slideFromHash(): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10)
  if (Number.isNaN(n)) return 0
  return Math.min(Math.max(n - 1, 0), slides.length - 1)
}

export function App() {
  const [index, setIndex] = useState(slideFromHash)

  const goTo = (i: number) =>
    setIndex(Math.min(Math.max(i, 0), slides.length - 1))
  const next = () => goTo(index + 1)
  const prev = () => goTo(index - 1)

  // Keep the URL hash in sync so refresh/deep-links land on the same slide
  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`)
  }, [index])

  useEffect(() => {
    const onHashChange = () => setIndex(slideFromHash())
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  useHotkey("ArrowRight", next)
  useHotkey("ArrowLeft", prev)
  useHotkey("Space", next)
  useHotkey("Home", () => goTo(0))
  useHotkey("End", () => goTo(slides.length - 1))
  useHotkey("F", () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  })

  const Slide = slides[index]

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main className="slide flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-[8vw] py-[6vh]">
        <MDXProvider components={mdxComponents}>
          <Slide />
        </MDXProvider>
      </main>

      <footer className="flex items-center gap-4 px-6 pb-4 text-sm text-zinc-500">
        <span className="font-medium text-orange-400">TanStack Workshop</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${((index + 1) / slides.length) * 100}%` }}
          />
        </div>
        <span className="tabular-nums">
          {index + 1} / {slides.length}
        </span>
      </footer>
    </div>
  )
}
