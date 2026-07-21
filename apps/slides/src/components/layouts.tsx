import { libraries, DEV_OBSESSED_GREEN } from "./libraries"
import type { LibraryId } from "./libraries"
import type { ReactNode } from "react"

/** Pulls a slide out of the deck's default padding to run edge-to-edge. */
function FullBleed({
  children,
  className = "",
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={style}
      className={`full-bleed relative -mx-[8vw] -my-[6vh] flex min-h-full flex-col justify-center px-[8vw] py-[6vh] ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * Warm ambient glow anchored to the corners — subtle, projector-safe.
 * `color` tints it to a library's brand accent.
 */
function Glow({ color }: { color?: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute -top-1/3 -left-1/4 size-[70vw] rounded-full blur-[120px]"
        style={{ backgroundColor: color ?? "#ea580c", opacity: 0.2 }}
      />
      <div
        className="absolute -right-1/4 -bottom-1/3 size-[50vw] rounded-full blur-[120px]"
        style={{ backgroundColor: color ?? "#f59e0b", opacity: 0.1 }}
      />
    </div>
  )
}

/**
 * Continuously color-cycling text, ported from the tanstack.com homepage
 * hero. Styling lives in styles.css (`.gradient-text`).
 */
export function GradientText({ children }: { children: ReactNode }) {
  return <span className="gradient-text">{children}</span>
}

/** DevObsessed, always in the brand green. */
export function DevObsessed({ link = true }: { link?: boolean }) {
  const style = { color: DEV_OBSESSED_GREEN }
  return link ? (
    <a
      href="https://www.devobsessed.com/"
      style={style}
      className="font-semibold decoration-current"
    >
      DevObsessed
    </a>
  ) : (
    <span style={style} className="font-semibold">
      DevObsessed
    </span>
  )
}

/** Every library, in brand colors, scrolling horizontally forever. */
export const LIBRARY_ORDER: Array<LibraryId> = [
  "query",
  "router",
  "start",
  "table",
  "virtual",
  "form",
  "store",
  "pacer",
  "hotkeys",
  "db",
  "ai",
  "intent",
]

function LibraryMarquee() {
  // The track holds two identical copies and slides exactly -50%, so the
  // second copy lands where the first began — a seamless loop.
  const copies = [0, 1]
  return (
    <div className="marquee-mask -mx-[8vw] mt-32 overflow-hidden opacity-50">
      <div className="marquee-track flex w-max items-center gap-10">
        {copies.map((copy) =>
          LIBRARY_ORDER.map((id) => {
            const { name, color } = libraries[id]
            return (
              <span
                key={`${copy}-${id}`}
                className="marquee-item font-extrabold tracking-tight whitespace-nowrap uppercase"
                style={{ color }}
              >
                {name}
              </span>
            )
          })
        )}
      </div>
    </div>
  )
}

/**
 * Opening slide — title, photo, and speaker credit. Deliberately sparse:
 * the deck's own agenda slides carry the detail.
 */
export function TitleSlide({
  kicker,
  title,
  tagline,
  speaker,
  speakerTitle,
  photo = "/profile.jpg",
  marquee = true,
}: {
  kicker?: ReactNode
  title: ReactNode
  tagline?: ReactNode
  speaker: string
  speakerTitle?: ReactNode
  photo?: string
  /** Scrolling library strip under the tagline. */
  marquee?: boolean
}) {
  return (
    <FullBleed className="bg-zinc-950">
      <Glow />

      <div className="relative flex flex-1 flex-col justify-center">
        {kicker && (
          <div className="slide-kicker mb-6 font-semibold tracking-[0.2em] text-orange-400 uppercase">
            {kicker}
          </div>
        )}

        <h1 className="text-balance">{title}</h1>

        <div className="mt-2 h-1.5 w-28 rounded-full bg-orange-500" />

        {tagline && (
          <p className="slide-tagline mt-6 font-semibold text-zinc-200">
            {tagline}
          </p>
        )}

        {marquee && <LibraryMarquee />}
      </div>

      <div className="relative flex items-center gap-6 border-t border-zinc-800 pt-6">
        <img
          src={photo}
          alt={speaker}
          className="size-24 shrink-0 rounded-full border-2 border-zinc-700 object-cover"
        />
        <div className="leading-tight">
          <div className="slide-speaker-name font-bold text-zinc-100">
            {speaker}
          </div>
          {speakerTitle && (
            <div className="slide-speaker-title mt-1 text-zinc-500">
              {speakerTitle}
            </div>
          )}
        </div>
      </div>
    </FullBleed>
  )
}

/**
 * Section divider for a TanStack library — themed with that library's
 * brand accent, styled after the badge on tanstack.com/libraries.
 */
export function LibraryTitleSlide({
  library,
  tagline,
  children,
}: {
  library: LibraryId
  /** Overrides the official tagline from tanstack.com. */
  tagline?: ReactNode
  children?: ReactNode
}) {
  const { name, color, tagline: officialTagline } = libraries[library]

  return (
    <FullBleed className="bg-zinc-950">
      <Glow color={color} />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span
            className="library-badge rounded-lg px-4 py-1.5 font-black tracking-wider text-zinc-950 uppercase"
            style={{
              backgroundColor: color,
              viewTransitionName: "library-badge",
            }}
          >
            TanStack
          </span>
          <h1
            className="!mb-0 uppercase"
            style={{ color, viewTransitionName: "library-name" }}
          >
            {name}
          </h1>
        </div>

        <p className="mt-8 max-w-5xl font-semibold italic" style={{ color }}>
          {tagline ?? officialTagline}
        </p>

        {children && <div className="mt-8 text-zinc-300">{children}</div>}
      </div>
    </FullBleed>
  )
}

/**
 * Capabilities overview for a library — brand-colored heading, then the MDX
 * children split into two columns: the bullet list left, the code block right.
 */
export function LibraryOverviewSlide({
  library,
  children,
}: {
  library: LibraryId
  children: ReactNode
}) {
  const { name, color } = libraries[library]

  return (
    <FullBleed className="bg-zinc-950">
      <Glow color={color} />

      <div className="relative flex min-h-0 flex-col">
        <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span
            className="library-badge rounded-lg px-3 py-1 font-black tracking-wider text-zinc-950 uppercase"
            style={{
              backgroundColor: color,
              viewTransitionName: "library-badge",
            }}
          >
            TanStack
          </span>
          <h2
            className="!mb-0 !border-b-0 !pb-0 uppercase after:!hidden"
            style={{ color, viewTransitionName: "library-name" }}
          >
            {name}
          </h2>
        </div>

        <div className="library-overview-body">{children}</div>
      </div>
    </FullBleed>
  )
}

/** Divider between major segments — one big statement, centered. */
export function SectionSlide({
  kicker,
  children,
}: {
  kicker?: ReactNode
  children: ReactNode
}) {
  return (
    <FullBleed className="items-center bg-zinc-950 text-center">
      <Glow />
      <div className="relative">
        {kicker && (
          <div className="slide-kicker mb-4 font-semibold tracking-[0.2em] text-orange-400 uppercase">
            {kicker}
          </div>
        )}
        {children}
      </div>
    </FullBleed>
  )
}

/** Two-column body for pairing a list with a visual or callout. */
export function Columns({ children }: { children: ReactNode }) {
  return (
    <div className="slide-columns grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
      {children}
    </div>
  )
}

/** Bordered callout for asides, caveats, or a punchline. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-lg border border-l-4 border-zinc-800 border-l-orange-500 bg-zinc-900/60 px-6 py-4 text-zinc-400">
      {children}
    </div>
  )
}

/**
 * Full-slide listing of every TanStack library, each name in its brand
 * color, stacked vertically — "The TanStack".
 */
export function TheStack() {
  const order: Array<LibraryId> = [
    "query",
    "router",
    "start",
    "table",
    "virtual",
    "form",
    "store",
    "pacer",
    "hotkeys",
    "db",
    "ai",
    "intent",
  ]
  return (
    <FullBleed className="bg-zinc-950">
      <Glow />
      <div className="relative flex h-full w-full items-center gap-[6vw]">
        {/* Left: heading */}
        <div className="shrink-0">
          <div className="slide-kicker mb-4 font-semibold tracking-[0.2em] text-orange-400 uppercase">
            The
          </div>
          <h1 className="leading-none">TanStack</h1>
        </div>

        {/* Right: library name stack */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {order.map((id) => {
            const { name, color } = libraries[id]
            return (
              <div key={id} className="flex items-baseline gap-3 leading-tight">
                <span
                  className="library-badge shrink-0 rounded-md px-2 py-0.5 font-black tracking-widest text-zinc-950 uppercase"
                  style={{ backgroundColor: color }}
                >
                  TanStack
                </span>
                <span
                  className="min-w-0 truncate text-[2.4vw] font-extrabold tracking-tight uppercase"
                  style={{ color }}
                >
                  {name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </FullBleed>
  )
}

/** Small uppercase label — use above a heading on a content slide. */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="slide-kicker mb-4 font-semibold tracking-[0.2em] text-orange-400 uppercase">
      {children}
    </div>
  )
}
