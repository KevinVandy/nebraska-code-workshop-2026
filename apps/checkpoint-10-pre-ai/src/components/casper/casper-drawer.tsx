import * as React from "react"
import { Ghost, Send, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import type { FlightSummary } from "@/lib/ai-tools"
import { useAuth } from "../auth-context"
import { useCasper } from "./casper-context"
import { FlightOptionCard } from "./flight-option-card"

/* ============================================================================
 * EXERCISE 3 of 4 — The chat drawer
 * EXERCISE 4 of 4 — Generative UI + approvals (further down)
 * ============================================================================
 *
 * GIVEN: the drawer shell (header, empty state, suggestions, input form) and
 * all the presentational pieces at the bottom of this file — FlightOptionCard,
 * SearchResults, BookingConfirmation, TripsList, ApprovalRequest. None of that
 * is the lesson; wiring them to a live model is.
 *
 * Docs: https://tanstack.com/ai → "useChat"
 * ==========================================================================*/

const SUGGESTIONS = [
  "Find me a cheap flight to Salem",
  "What's my next trip?",
  "Show nonstop options to Roswell in the Book tab",
]

// GIVEN: friendly labels while a tool is running. Key = tool name.
// You'll use this in TODO 4 as the fallback for a tool that hasn't returned.
export const WORKING_LABELS: Record<string, string> = {
  searchFlights: "Searching flights…",
  getFlightStatus: "Checking flight status…",
  getMyTrips: "Checking your trips…",
  bookFlight: "Preparing your booking…",
  cancelTrip: "Preparing the cancellation…",
  applySearchFilters: "Applying filters…",
}

export function CasperDrawer() {
  const { open, setOpen } = useCasper()
  const { session } = useAuth()
  const [input, setInput] = React.useState("")
  const messagesRef = React.useRef<HTMLDivElement>(null)

  /* TODO 3a — Register the client tool.
   *
   * `applySearchFilters` runs in the BROWSER (it has no server implementation)
   * because it needs the router. Wire it with `clientTools(...)` and
   * `applySearchFiltersToolDef.client(...)`, memoised on `navigate`:
   *
   *   const navigate = useNavigate()
   *   const tools = React.useMemo(
   *     () => clientTools(
   *       applySearchFiltersToolDef.client((args) => {
   *         navigate({ to: "/dashboard/book", search: { from: ..., to: ..., q: ... } })
   *         return { applied: true }
   *       })
   *     ),
   *     [navigate]
   *   )
   *
   * Uppercase the airport codes — the model isn't reliable about casing.
   */

  /* TODO 3b — Connect to the server route.
   *
   *   const { messages, sendMessage, stop, isLoading, error,
   *           addToolApprovalResponse } = useChat({
   *     connection: fetchServerSentEvents("/api/chat"),
   *     tools,
   *   })
   *
   * Then replace the placeholder `messages`/`isLoading`/`error` below.
   */
  const messages: Array<{ id: string; role: string }> = []
  const isLoading = false as boolean
  const error = undefined as Error | undefined

  /* TODO 3c — Refetch the dashboard after a booking or cancellation.
   *
   * When bookFlight/cancelTrip completes, the dashboard behind the drawer is
   * stale. Watch `messages` in an effect and invalidate ["trips"] + ["flights"]
   * when you see a tool-call part with output for either tool.
   *
   * Two gotchas:
   *   - Track which part ids you've already handled in a ref. Without that you
   *     re-invalidate on every stream tick.
   *   - useChat narrows tool names to the registered *client* tools, so
   *     checking for "bookFlight" won't typecheck. Widen with
   *     `messages as UIMessage[]` and leave a comment saying why.
   */

  // GIVEN: keep the transcript pinned to the newest message.
  React.useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
  }, [messages])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    // TODO 3b — call sendMessage(trimmed) once useChat is wired.
    setInput("")
  }

  // Casper is signed-in only — /api/chat returns 401 without a session anyway.
  if (!open || !session) return null

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ghost className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Casper</p>
            <p className="text-xs text-muted-foreground">
              Your travel assistant
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close chat"
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-3 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Ask me to find flights, check your trips, or book your next
              getaway.
            </p>
            <div className="flex flex-col items-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <p className="pt-4 text-xs text-muted-foreground">
              ⚠️ Casper isn&apos;t wired up yet — see the TODOs in
              casper-drawer.tsx
            </p>
          </div>
        ) : null}

        {/* TODO 3d — render the transcript:
         *
         *   messages.map((message) => (
         *     <Message key={message.id} message={message} busy={isLoading}
         *       onBookFlight={(flight) => send(`Please book flight ...`)}
         *       onApproval={(id, approved) =>
         *         addToolApprovalResponse({ id, approved })} />
         *   ))
         */}

        {isLoading ? (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">Casper is thinking…</p>
            {/* TODO 3b — wire this to useChat's `stop()`. A stalled stream
              * shouldn't freeze the drawer for the rest of the demo. */}
            <button
              type="button"
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Stop
            </button>
          </div>
        ) : null}
        {error ? (
          <p className="text-xs text-destructive">
            {error.message || "Something went wrong. Is OPENAI_API_KEY set?"}
          </p>
        ) : null}
      </div>

      {/* Input */}
      <form
        className="flex gap-2 border-t px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Casper anything…"
          aria-label="Message Casper"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={!input.trim() || isLoading}
        >
          <Send />
        </Button>
      </form>
    </aside>
  )
}

/* ============================================================================
 * EXERCISE 4 — Generative UI
 * ============================================================================
 *
 * A message is a list of PARTS. Text parts are bubbles; `tool-call` parts are
 * where generative UI happens — instead of printing JSON, you render a real
 * component per tool.
 *
 * TODO 4 — Write the `Message` component. For each part:
 *   - type === "text"                → a chat bubble (user right, assistant left)
 *   - type !== "tool-call"           → skip
 *   - state === "approval-requested" → <ApprovalRequest>   (bookFlight/cancelTrip)
 *   - name === "searchFlights"   + output → <SearchResults>
 *   - name === "bookFlight"      + output → <BookingConfirmation>
 *   - name === "getMyTrips"      + output → <TripsList>
 *   - name === "applySearchFilters" + output → a one-line "✓ Filters applied"
 *   - no output yet                  → WORKING_LABELS[part.name] fallback
 *
 * The components below take plain typed props — you supply
 * `part.output as SearchResultsOutput` etc. (the server validated the shape
 * against your outputSchema; the stream types it as unknown). Leave a comment
 * noting that.
 *
 * Suggested signature:
 *   function Message({ message, onBookFlight, onApproval, busy }: {...})
 *
 * Everything below this line is GIVEN — you shouldn't need to edit it.
 * ==========================================================================*/

export interface SearchResultsOutput {
  flights?: FlightSummary[]
  totalMatching: number
}

export function SearchResults({
  output,
  onBookFlight,
  busy,
}: {
  output: SearchResultsOutput
  onBookFlight: (flight: FlightSummary) => void
  busy: boolean
}) {
  if (!output.flights?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No flights matched that search.
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {output.flights.map((flight) => (
        <FlightOptionCard
          key={flight.id}
          flight={flight}
          onBook={onBookFlight}
          disabled={busy}
        />
      ))}
      {output.totalMatching > output.flights.length ? (
        <p className="text-xs text-muted-foreground">
          Showing {output.flights.length} of {output.totalMatching} matching
          flights.
        </p>
      ) : null}
    </div>
  )
}

export interface BookingOutput {
  bookingRef: string
  flightNumber: string
  route: string
  price: number
}

export function BookingConfirmation({ output }: { output: BookingOutput }) {
  return (
    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-500/40 dark:bg-emerald-500/10">
      <p className="font-medium">Booked! ✈️</p>
      <p className="text-muted-foreground">
        {output.flightNumber} · {output.route} · ${output.price}
      </p>
      <p className="mt-1 text-xs">
        Confirmation{" "}
        <span className="font-mono font-semibold">{output.bookingRef}</span>
      </p>
    </div>
  )
}

export interface TripsOutput {
  trips: Array<{
    tripId: number
    flightNumber: string
    route: string
    departTime: string
    bookingStatus: string
    price: number
  }>
}

export function TripsList({ output }: { output: TripsOutput }) {
  return (
    <div className="space-y-1.5">
      {output.trips.map((trip) => (
        <div
          key={trip.tripId}
          className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
        >
          <span className="font-medium">{trip.flightNumber}</span>
          <span className="text-muted-foreground">{trip.route}</span>
          <span className="text-muted-foreground">
            {new Date(trip.departTime).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="font-medium text-brand">${trip.price}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * The human-in-the-loop gate. Tools defined with `needsApproval: true` pause
 * here until the user answers; `onApproval` resumes or rejects the run.
 */
export function ApprovalRequest({
  toolName,
  args,
  approvalId,
  onApproval,
}: {
  toolName: string
  args: Record<string, unknown>
  approvalId: string
  onApproval: (id: string, approved: boolean) => void
}) {
  return (
    <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-500/40 dark:bg-amber-500/10">
      <p className="font-medium">
        {toolName === "bookFlight"
          ? "Approve this booking?"
          : "Approve this cancellation?"}
      </p>
      <pre className="overflow-x-auto rounded-lg bg-background p-2 text-xs">
        {JSON.stringify(args, null, 2)}
      </pre>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onApproval(approvalId, true)}>
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onApproval(approvalId, false)}
        >
          Deny
        </Button>
      </div>
    </div>
  )
}

// Keeps `cn` imported for the bubble styling you'll write in TODO 4.
export const bubbleClass = (isUser: boolean) =>
  cn(
    "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
    isUser ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
  )
