import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { flushSync } from "react-dom"
import { MDXProvider } from "@mdx-js/react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { slides } from "./slides"
import {
  Columns,
  DevObsessed,
  GradientText,
  Kicker,
  LibraryOverviewSlide,
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
  LibraryOverviewSlide,
  LibraryTitleSlide,
  Note,
  SectionSlide,
  TheStack,
  TitleSlide,
  // Content-slide headings share one transition name, so consecutive
  // slides' titles morph into each other instead of cross-fading.
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} style={{ viewTransitionName: "slide-heading" }} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} className={`slide-reveal ${props.className ?? ""}`} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
}

/**
 * Animate a slide change with the browser View Transition API. Elements
 * sharing a `view-transition-name` (the library badge + name on title and
 * overview slides) morph to their new position; everything else cross-fades.
 * React's own <ViewTransition> is still experimental-only, so we use the
 * native API it wraps.
 */
function withViewTransition(update: () => void) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update()
    return
  }
  document.startViewTransition(() => flushSync(update))
}

function slideFromHash(): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10)
  if (Number.isNaN(n)) return 0
  return Math.min(Math.max(n - 1, 0), slides.length - 1)
}

export function App() {
  const [index, setIndex] = useState(slideFromHash)
  /** How many bullets on the current slide are revealed. */
  const [step, setStep] = useState(0)
  const slideRef = useRef<HTMLElement>(null)
  /** Whether the slide we're about to land on opens blank or fully revealed. */
  const entryRef = useRef<"start" | "end">("start")

  /** Revealable elements are read from the DOM — bullets and standalone images. */
  const bullets = useCallback(
    () =>
      Array.from(
        slideRef.current?.querySelectorAll("li, img.slide-reveal") ?? []
      ),
    []
  )

  const goTo = useCallback(
    (i: number, entry: "start" | "end" = "start") => {
      const clamped = Math.min(Math.max(i, 0), slides.length - 1)
      if (clamped === index) return
      entryRef.current = entry
      withViewTransition(() => setIndex(clamped))
    },
    [index]
  )

  // Right/Space walk the bullets first, then move on to the next slide.
  // Kept free of setState updaters so StrictMode's double-invoke can't
  // fire the slide change twice. useHotkey re-syncs the callback every
  // render, so `step` is never stale here.
  const next = useCallback(() => {
    if (step < bullets().length) setStep(step + 1)
    else goTo(index + 1, "start")
  }, [bullets, goTo, index, step])

  // Left rewinds bullets, then backs into the previous slide fully revealed.
  const prev = useCallback(() => {
    if (step > 0) setStep(step - 1)
    else goTo(index - 1, "end")
  }, [goTo, index, step])

  // On landing, open blank (forward) or fully revealed (backward).
  useLayoutEffect(() => {
    setStep(entryRef.current === "end" ? bullets().length : 0)
    entryRef.current = "start"
  }, [index, bullets])

  // Reflect the current step onto the DOM after every render.
  useLayoutEffect(() => {
    bullets().forEach((li, i) =>
      li.classList.toggle("bullet-hidden", i >= step)
    )
  })

  // Keep the URL hash in sync so refresh/deep-links land on the same slide
  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`)
  }, [index])

  useEffect(() => {
    const onHashChange = () =>
      withViewTransition(() => setIndex(slideFromHash()))
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  useHotkey("ArrowRight", next)
  useHotkey("ArrowLeft", prev)
  useHotkey("Space", next)
  // Up/Down always jump whole slides, regardless of bullet state.
  useHotkey("ArrowDown", () => goTo(index + 1, "start"))
  useHotkey("ArrowUp", () => goTo(index - 1, "start"))
  useHotkey("Home", () => goTo(0))
  useHotkey("End", () => goTo(slides.length - 1))
  useHotkey(".", () => setStep(bullets().length))
  useHotkey(",", () => setStep(0))
  useHotkey("F", () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  })

  const Slide = slides[index]

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
      <main
        ref={slideRef}
        className="slide flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-[8vw] py-[6vh]"
      >
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
