import type { ReactNode } from "react"

/**
 * Server/Browser swim-lane diagram. Each numbered step sits in its actor's
 * column and carries `slide-reveal`, so steps fade in one per Right-press
 * just like bullets.
 */
export function DataFlowDiagram({
  steps,
  callout,
}: {
  steps: Array<{ actor: "server" | "browser"; text: ReactNode; tag?: string }>
  callout?: ReactNode
}) {
  return (
    <div className="data-flow">
      <div className="grid grid-cols-2 gap-x-12">
        <div className="data-flow-lane-label">Server</div>
        <div className="data-flow-lane-label">Browser</div>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-x-12 gap-y-2.5">
        <div
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-px bg-zinc-800"
        />
        {steps.map((step, i) => (
          <div
            key={i}
            className={`slide-reveal data-flow-step ${
              step.actor === "server" ? "col-start-1" : "col-start-2"
            }`}
            style={{ gridRow: i + 1 }}
          >
            <span className="data-flow-num">{i + 1}</span>
            <div>
              {step.tag && <div className="data-flow-tag">{step.tag}</div>}
              {step.text}
            </div>
          </div>
        ))}
      </div>

      {callout && (
        <div className="slide-reveal data-flow-callout">{callout}</div>
      )}
    </div>
  )
}

/**
 * Three-stage hydration explainer: painted HTML -> JS downloads and React
 * re-renders -> interactive. Each stage reveals like a bullet.
 */
export function HydrationVisual() {
  const stages: Array<{
    title: string
    body: string
    state: "dry" | "wet" | "live"
  }> = [
    {
      title: "1. Server HTML arrives",
      body: "The page paints fast and looks ready — but nothing responds to clicks yet.",
      state: "dry",
    },
    {
      title: "2. JavaScript hydrates",
      body: "The bundle downloads and React re-renders the same UI, attaching event handlers.",
      state: "wet",
    },
    {
      title: "3. Interactive",
      body: "Buttons work. The page is actually ready.",
      state: "live",
    },
  ]

  return (
    <div className="hydration-visual">
      {stages.map((stage, i) => (
        <div key={stage.state} className="contents">
          {i > 0 && (
            <div aria-hidden className="hydration-arrow slide-reveal">
              →
            </div>
          )}
          <div className={`slide-reveal hydration-stage is-${stage.state}`}>
            <div className="hydration-demo">
              <span className="hydration-line" />
              <span className="hydration-line short" />
              <button className="hydration-button" tabIndex={-1}>
                {stage.state === "dry" ? "Click me…?" : "Click me!"}
              </button>
            </div>
            <div className="hydration-stage-title">{stage.title}</div>
            <div className="hydration-stage-body">{stage.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

type PhaseKind = "html" | "js" | "fetch" | "render" | "hydrate"

const PHASES: Record<PhaseKind, { label: string; color: string }> = {
  html: { label: "HTML", color: "var(--color-zinc-500)" },
  fetch: { label: "Fetch data", color: "var(--color-orange-500)" },
  render: { label: "Render", color: "var(--color-violet-500)" },
  js: { label: "Download JS", color: "var(--color-sky-500)" },
  hydrate: { label: "Hydrate", color: "var(--color-emerald-500)" },
}

/**
 * Per-strategy timeline where each bar is split into a Server lane (top)
 * and a Browser lane (bottom) — each phase sits in the lane where the work
 * actually happens, so "who is doing the waiting" is visible at a glance.
 * Segment widths are illustrative, not measured. ▲ marks first meaningful
 * paint; ● marks interactive.
 */
export function RenderTimeline() {
  const rows: Array<{
    name: string
    /** Chip shown before the bar for work that happened outside the request. */
    pre?: string
    segs: Array<{
      kind: PhaseKind
      lane: "server" | "browser"
      w: number
      note?: string
    }>
    paintAfter: number
  }> = [
    {
      name: "CSR",
      segs: [
        { kind: "html", lane: "server", w: 0.8, note: "shell" },
        { kind: "js", lane: "browser", w: 4 },
        { kind: "fetch", lane: "browser", w: 3 },
        { kind: "render", lane: "browser", w: 1 },
      ],
      paintAfter: 4,
    },
    {
      name: "SSG",
      pre: "⚙ pages already built at deploy time",
      segs: [
        { kind: "html", lane: "server", w: 1, note: "from CDN" },
        { kind: "js", lane: "browser", w: 4 },
        { kind: "hydrate", lane: "browser", w: 1.5 },
      ],
      paintAfter: 1,
    },
    {
      name: "SSR",
      segs: [
        { kind: "fetch", lane: "server", w: 2.5 },
        { kind: "render", lane: "server", w: 1 },
        { kind: "html", lane: "server", w: 1 },
        { kind: "js", lane: "browser", w: 4 },
        { kind: "hydrate", lane: "browser", w: 1.5 },
      ],
      paintAfter: 3,
    },
    {
      name: "RSC + Streaming",
      segs: [
        { kind: "render", lane: "server", w: 1.5, note: "streams" },
        { kind: "html", lane: "server", w: 1.5 },
        { kind: "js", lane: "browser", w: 2, note: "less/no JS" },
        { kind: "hydrate", lane: "browser", w: 1 },
      ],
      paintAfter: 2,
    },
  ]

  return (
    <div className="render-timeline">
      {rows.map((row) => (
        <div key={row.name} className="slide-reveal render-timeline-row">
          <div className="render-timeline-name">
            {row.name}
            {row.pre && <div className="render-timeline-pre">{row.pre}</div>}
          </div>

          <div className="render-timeline-lanes">
            <span className="render-timeline-lane-label">Server</span>
            <span className="render-timeline-lane-label">Browser</span>
          </div>

          <div className="render-timeline-bar">
            <div aria-hidden className="render-timeline-lane-divider" />
            {row.segs.map((seg, i) => (
              <div
                key={i}
                className={`render-timeline-seg is-${seg.lane}`}
                style={{ flexGrow: seg.w, background: PHASES[seg.kind].color }}
              >
                <span className="render-timeline-note">
                  {PHASES[seg.kind].label}
                  {seg.note && ` (${seg.note})`}
                </span>
                {i + 1 === row.paintAfter && (
                  <span className="render-timeline-paint" title="First paint">
                    ▲
                  </span>
                )}
              </div>
            ))}
            <span className="render-timeline-done" title="Interactive">
              ●
            </span>
          </div>
        </div>
      ))}

      <div className="render-timeline-legend">
        {Object.values(PHASES).map((phase) => (
          <span key={phase.label} className="render-timeline-legend-item">
            <span
              className="render-timeline-swatch"
              style={{ background: phase.color }}
            />
            {phase.label}
          </span>
        ))}
        <span className="render-timeline-legend-item">▲ first paint</span>
        <span className="render-timeline-legend-item">● interactive</span>
      </div>
    </div>
  )
}
