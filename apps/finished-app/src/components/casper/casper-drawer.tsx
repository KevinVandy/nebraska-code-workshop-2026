import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { clientTools } from "@tanstack/ai-client"
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react"
import type { UIMessage } from "@tanstack/ai-react"
import { Ghost, Send, X } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { applySearchFiltersToolDef } from "@/lib/ai-tools"
import type { FlightSummary } from "@/lib/ai-tools"
import { useAuth } from "../auth-context"
import { useCasper } from "./casper-context"
import { FlightOptionCard } from "./flight-option-card"

type ToolCallPart = Extract<UIMessage["parts"][number], { type: "tool-call" }>

const SUGGESTIONS = [
  "Find me a cheap flight to Salem",
  "What's my next trip?",
  "Show nonstop options to Roswell in the Book tab",
]

const WORKING_LABELS: Record<string, string> = {
  searchFlights: "Searching flights…",
  getMyTrips: "Checking your trips…",
  bookFlight: "Preparing your booking…",
  cancelTrip: "Preparing the cancellation…",
  applySearchFilters: "Applying filters…",
}

function parseArgs(part: ToolCallPart): Record<string, unknown> {
  try {
    return JSON.parse(part.arguments || "{}") as Record<string, unknown>
  } catch {
    return {}
  }
}

export function CasperDrawer() {
  const { open, setOpen } = useCasper()
  const { session } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [input, setInput] = React.useState("")
  const messagesRef = React.useRef<HTMLDivElement>(null)

  // Client tool: Casper fills in the Book tab's typed URL search params.
  const tools = React.useMemo(
    () =>
      clientTools(
        applySearchFiltersToolDef.client((args) => {
          navigate({
            to: "/dashboard/book",
            search: {
              from: args.from?.toUpperCase(),
              to: args.to?.toUpperCase(),
              q: args.q,
            },
          })
          return { applied: true }
        })
      ),
    [navigate]
  )

  const { messages, sendMessage, isLoading, error, addToolApprovalResponse } =
    useChat({
      connection: fetchServerSentEvents("/api/chat"),
      tools,
    })

  // When a booking/cancellation tool completes, refetch trips + flights so the
  // dashboard behind the drawer updates live.
  const processedParts = React.useRef(new Set<string>())
  React.useEffect(() => {
    // Widen: useChat narrows tool names to the registered *client* tools, but
    // server tools (bookFlight/cancelTrip) also stream through as parts.
    for (const message of messages as UIMessage[]) {
      for (const part of message.parts) {
        if (
          part.type === "tool-call" &&
          (part.name === "bookFlight" || part.name === "cancelTrip") &&
          part.output &&
          !processedParts.current.has(part.id)
        ) {
          processedParts.current.add(part.id)
          queryClient.invalidateQueries({ queryKey: ["trips"] })
          queryClient.invalidateQueries({ queryKey: ["flights"] })
        }
      }
    }
  }, [messages, queryClient])

  React.useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight })
  }, [messages])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    sendMessage(trimmed)
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
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onBookFlight={(flight) =>
                send(
                  `Please book flight ${flight.flightNumber} (id ${flight.id}) for 1 passenger.`
                )
              }
              onApproval={(id, approved) =>
                addToolApprovalResponse({ id, approved })
              }
              busy={isLoading}
            />
          ))
        )}

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Casper is thinking…</p>
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

function Message({
  message,
  onBookFlight,
  onApproval,
  busy,
}: {
  message: UIMessage
  onBookFlight: (flight: FlightSummary) => void
  onApproval: (id: string, approved: boolean) => void
  busy: boolean
}) {
  const isUser = message.role === "user"

  const parts = message.parts.map((part, index) => {
    if (part.type === "text" && part.content.trim()) {
      return (
        <div
          key={index}
          className={cn(
            "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
            isUser ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          {part.content}
        </div>
      )
    }

    if (part.type !== "tool-call") return null

    // Approval gate (bookFlight / cancelTrip)
    if (part.state === "approval-requested" && part.approval) {
      const args = parseArgs(part)
      return (
        <div
          key={part.id}
          className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-500/40 dark:bg-amber-500/10"
        >
          <p className="font-medium">
            {part.name === "bookFlight"
              ? "Approve this booking?"
              : "Approve this cancellation?"}
          </p>
          <pre className="overflow-x-auto rounded-lg bg-background p-2 text-xs">
            {JSON.stringify(args, null, 2)}
          </pre>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onApproval(part.approval!.id, true)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onApproval(part.approval!.id, false)}
            >
              Deny
            </Button>
          </div>
        </div>
      )
    }

    // Generative UI: flight search results as bookable cards
    if (part.name === "searchFlights" && part.output) {
      const output = part.output as {
        flights?: FlightSummary[]
        totalMatching: number
      }
      if (!output.flights?.length) {
        return (
          <p key={part.id} className="text-sm text-muted-foreground">
            No flights matched that search.
          </p>
        )
      }
      return (
        <div key={part.id} className="space-y-2">
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

    // Booking confirmation
    if (part.name === "bookFlight" && part.output) {
      const output = part.output as {
        bookingRef: string
        flightNumber: string
        route: string
        price: number
      }
      return (
        <div
          key={part.id}
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-500/40 dark:bg-emerald-500/10"
        >
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

    // Trips list
    if (part.name === "getMyTrips" && part.output) {
      const output = part.output as {
        trips: Array<{
          tripId: number
          flightNumber: string
          route: string
          departTime: string
          bookingStatus: string
          price: number
        }>
      }
      return (
        <div key={part.id} className="space-y-1.5">
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

    // Filters applied to the Book tab
    if (part.name === "applySearchFilters" && part.output) {
      return (
        <p key={part.id} className="text-xs text-muted-foreground">
          ✓ Filters applied to the Book a Flight tab.
        </p>
      )
    }

    // In-flight tool call
    if (!part.output) {
      return (
        <p key={part.id} className="text-xs text-muted-foreground">
          {WORKING_LABELS[part.name] ?? `Running ${part.name}…`}
        </p>
      )
    }

    return null
  })

  return (
    <div className={cn("space-y-2", isUser && "flex flex-col items-end")}>
      {parts}
    </div>
  )
}
