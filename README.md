# Ghost Airlines — TanStack Workshop

A flight-booking app built with the whole TanStack toolkit, split into ten
checkpoints. Each checkpoint is a complete, running app that's missing exactly
one library. You add it back.

**You do not have to keep up.** Every checkpoint is self-contained, and the
answer key for checkpoint _N_ is simply checkpoint _N+1_. Fall behind, get
stuck, or want to skip ahead? Change directories and you're caught up.

---

## One-time setup

You'll need **Node 20+** and **pnpm 10+** (`npm install -g pnpm`).

```bash
pnpm install
pnpm seed        # generates the fake flight/trip/user data
```

## Running the app

You always need **two terminals**: the fake API, and one checkpoint.

```bash
# Terminal 1 — the API. Leave this running all day.
pnpm dev:server

# Terminal 2 — whichever checkpoint you're on.
pnpm dev:1
```

Then open the port for your checkpoint (see the table below) and log in with
the **Demo login** button.

> **Log in as:** `jd@example.com` / `Test1234`
> The Demo login button fills this in for you. John Doe has 23 trips, Gold
> status, and enough history to make the tables and charts interesting.

## The checkpoints

| Run | Checkpoint | You'll add | Open |
|-----|------------|------------|------|
| `pnpm dev:1` | `checkpoint-1-pre-dashboard` | **Router** — routes, layouts, typed search params | http://localhost:5551 |
| `pnpm dev:2` | `checkpoint-2-pre-query` | **Query** — replace hand-rolled `useEffect` fetching | http://localhost:5552 |
| `pnpm dev:3` | `checkpoint-3-pre-query-prefetching` | **Query** — prefetch on hover | http://localhost:5553 |
| `pnpm dev:4` | `checkpoint-4-pre-start` | **Start** — pick a rendering mode per page (+ RSC bonus) | http://localhost:5554 |
| `pnpm dev:5` | `checkpoint-5-pre-table` | **Table** — three tables, sorting, row selection | http://localhost:5555 |
| `pnpm dev:6` | `checkpoint-6-pre-virtual` | **Virtual** — infinite scroll + virtualized rows | http://localhost:5556 |
| `pnpm dev:7` | `checkpoint-7-pre-form` | **Form** — the contact form, with zod | http://localhost:5557 |
| `pnpm dev:8` | `checkpoint-8-pre-pacer` | **Pacer** — debounce two search boxes | http://localhost:5558 |
| `pnpm dev:9` | `checkpoint-9-pre-hotkeys` | **Hotkeys** — a keyboard-driven app | http://localhost:5559 |
| `pnpm dev:10` | `checkpoint-10-pre-ai` | **AI** — Casper, the booking assistant | http://localhost:5560 |
| `pnpm dev:finished` | `finished-app` | *(everything, finished)* | http://localhost:5561 |

Every checkpoint has an **`EXERCISE.md`** in its folder. Read that first — it
tells you what to build and where, and the code has numbered `TODO` comments
to match. The *how* is yours (and the answer key's). A checkpoint sometimes
ships brand-new scaffolding for the feature you're about to build (a
component, a provider) — when it does, it's listed under **New in this
checkpoint** so nothing appears by magic.

Ports are fixed per checkpoint, so you can leave several running at once —
handy for diffing your work against the answer key side by side.

## Comparing against the answer key

The answer key for any checkpoint is the next one:

```bash
# Working on checkpoint 5, want to see how it's meant to look?
diff -r apps/checkpoint-5-pre-table/src apps/checkpoint-6-pre-virtual/src
```

Or just run both and click between :5555 and :5556.

## Checkpoint 10 needs an API key

Only the AI checkpoint talks to a real model. Copy the example env file and
add your key:

```bash
cp apps/checkpoint-10-pre-ai/.env.example apps/checkpoint-10-pre-ai/.env
# then edit it and set OPENAI_API_KEY=sk-...
```

Every other checkpoint runs entirely on your machine.

## Troubleshooting

**Everything shows "Is the API running on :3300?"**
The API isn't running. `pnpm dev:server` in a second terminal.

**You re-seeded and the data looks wrong / your login stopped working.**
json-server reads `db.json` once at startup. After `pnpm seed`, restart
`pnpm dev:server`. (It also *writes* to `db.json`, so a server left running
from before a re-seed will overwrite your fresh data.)

**Everything feels slow.**
That's deliberate — the API sleeps 1s per request so loading states are
visible. Several exercises exist specifically to make that delay disappear.
To turn it off: `DELAY=0 pnpm dev:server`.

**Port already in use.**
Something's still running from an earlier checkpoint. `lsof -ti:5555 | xargs kill`
(swap in your port), or close that terminal.

**Type errors after you add a route.**
Expected, and the point of checkpoint 1 — the route tree regenerates when the
dev server is running. Make sure it is.

## What's in here

```
apps/
  api/           fake REST API (json-server) — port 3300
  checkpoint-*/  the ten workshop checkpoints
  finished-app/  the completed app
  slides/        workshop slides
packages/
  ui/            shared shadcn components + theme
  types/         shared API types
```

## A note on the auth

The sign-in flow is **deliberately fake** — plain-text passwords in `db.json`,
an unsigned cookie. It's real enough to demonstrate protected routes, a
server-side guard, and a 401, and nothing more. Every fake part is marked with
a `FAKE AUTH` comment explaining what a real app would do instead. Don't copy
it.
