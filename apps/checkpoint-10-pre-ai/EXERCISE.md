# Checkpoint: TanStack AI

Everything in Ghost Airlines works **except Casper**, the AI concierge. Your
job is to wire him up.

**Answer key:** `apps/finished-app` — but try it yourself first.

## Setup

```bash
cp .env.example .env       # then add your OPENAI_API_KEY
pnpm dev:server            # json-server on :3300 (from the repo root)
pnpm --filter checkpoint-10-pre-ai dev    # this app on :5559
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`), then
press `⌘J` / `Ctrl+J` to open Casper. Right now the drawer opens but does
nothing — that's what you're fixing.

## The exercises

Work through the `TODO` comments in these four files, in order:

| # | File | What you'll build |
|---|------|-------------------|
| 1 | `src/lib/ai-tools.ts` | Six isomorphic tool definitions with zod schemas |
| 2 | `src/routes/api.chat.ts` | Server route: tool implementations + streaming |
| 3 | `src/components/casper/casper-drawer.tsx` | `useChat`, the client tool, query invalidation |
| 4 | `src/components/casper/casper-drawer.tsx` | Generative UI: render tool calls as components |

Each file explains what's **GIVEN** (scaffolding, styling, helpers) and what's
yours. The presentational components — flight cards, booking confirmations,
trip lists, the approval prompt — are all written for you at the bottom of
`casper-drawer.tsx`.

## Things to try once it works

- **Ask about a cancelled flight.** Open the Flight Status tab, find a
  cancelled flight (e.g. `GA-1288`), then ask Casper "is GA-1288 on time?" If
  your tool descriptions don't distinguish *flight* status from *booking*
  status, Casper will confidently tell you the wrong thing.
- **Try to book a cancelled flight.** Your `bookFlight` guard should refuse.
- **Deny an approval.** Ask Casper to book something, then hit Deny.
- **"Show me nonstop flights to Roswell in the Book tab"** — that's the client
  tool driving the router.
- Open the devtools panel (bottom of the screen) and watch the **AI** tab as
  messages stream.

## Hints

- The tool definitions are the contract between three files. Get
  `ai-tools.ts` right and the other two mostly fall into place.
- If Casper answers without ever calling a tool, your **descriptions** are too
  vague — the model picks tools by description alone.
- `useChat` narrows tool names to the *client* tools you registered, so
  checking for server tool names needs `messages as UIMessage[]`.
- Server route errors show up in the terminal running `dev`, not the browser.
