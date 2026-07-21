import { createFileRoute } from "@tanstack/react-router"

import { sessionFromCookieHeader } from "@/lib/auth"

/* EXERCISE 2 of 4 — the chat server route: run the model with your tools and
 * stream the result back as SSE. Endpoints, guards, and the recipe are in
 * EXERCISE.md. GIVEN: session check, env guard, apiJson. */

// The API the tools talk to (json-server). Server-side, so read process.env.
const API_URL = process.env.VITE_API_URL ?? "http://localhost:3300"
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o"

/** GIVEN: fetch helper for the Ghost Airlines API. */
async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok)
    throw new Error(`Ghost Airlines API error ${res.status} for ${path}`)
  return res.json() as Promise<T>
}

// TODO 2a — systemPrompt(): a FUNCTION (not a const), so the date is fresh per request.

// TODO 2b — implement the five server tools with .server() (+ a typed CasperContext).

// TODO 2c — in the handler: parse params, mergeAgentTools, chat(), stream as SSE.

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        /* GIVEN — FAKE AUTH, but genuinely enforced: the browser sends the
         * session cookie automatically, and we refuse to run the model
         * without one. (A real app would verify a signature here rather than
         * trusting the cookie's contents — see src/lib/auth.ts.) */
        const session = sessionFromCookieHeader(request.headers.get("cookie"))
        if (!session) {
          return Response.json(
            { error: "You must be signed in to chat with Casper." },
            { status: 401 }
          )
        }

        if (!process.env.OPENAI_API_KEY) {
          return Response.json(
            {
              error:
                "OPENAI_API_KEY is not set. Add it to apps/checkpoint-pre-ai/.env to enable Casper.",
            },
            { status: 500 }
          )
        }

        /* GIVEN — when the browser disconnects mid-stream (tab closed, the
         * drawer's Stop button), the request's signal fires; forwarding it
         * into this controller makes chat() stop calling OpenAI instead of
         * streaming into the void. Pass it to chat() and to the SSE helper. */
        const abortController = new AbortController()
        request.signal.addEventListener("abort", () => abortController.abort())

        // TODO 2c — replace this with the real chat stream (see above).
        void apiJson
        void MODEL
        return Response.json(
          { error: "Casper isn't wired up yet — see the TODOs in this file." },
          { status: 501 }
        )
      },
    },
  },
})
