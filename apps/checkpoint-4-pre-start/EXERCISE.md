# Checkpoint: TanStack Start — rendering modes

The app is now a **TanStack Start** app — the conversion from a client-only
SPA was done for you (see below). Right now every page uses the default:
full server-side rendering. This checkpoint is about *choosing* a rendering
mode per page instead of accepting one globally. It's deliberately the
shortest exercise of the day.

**Answer key:** `apps/checkpoint-5-pre-table` — but try it yourself first.

## Setup

```bash
pnpm dev:server                           # json-server on :3300 (repo root)
pnpm --filter checkpoint-4-pre-start dev    # this app on :5554
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## New in this checkpoint

Everything that makes this a Start app instead of an SPA was scaffolded for
you — worth five minutes of reading before the exercise:

- **`index.html` and `main.tsx` are gone.** The server renders the document
  now: `src/routes/__root.tsx` gained a `shellComponent` with `<HeadContent>`
  and `<Scripts>`, and `src/router.tsx` exports `getRouter()` for both the
  server and the browser.
- **Auth got better.** `lib/auth.ts` reads the session cookie with
  `createIsomorphicFn()` — `getCookie()` on the server, `document.cookie` in
  the browser — so the root route's `beforeLoad` guard runs server-side on
  first load. A signed-out visitor is redirected before any dashboard JS
  downloads. View source on `/` while signed in: the header has your name in
  the HTML.
- **One QueryClient per request** (`providers.tsx` creates it in `useState`)
  so two users' server renders never share a cache.

## The exercise

Two TODOs, both one-liners to write — the thinking is the point:

### TODO 1 — prerender the marketing pages (`vite.config.ts`)

`/` and `/about` are identical for every visitor, so render them **once at
build time**:

```ts
tanstackStart({
  prerender: {
    enabled: true,
    crawlLinks: false,
    autoStaticPathsDiscovery: false,
  },
  pages: [
    { path: "/", prerender: { enabled: true } },
    { path: "/about", prerender: { enabled: true } },
  ],
})
```

⚠️ **Both `false`s are load-bearing.** `crawlLinks` and
`autoStaticPathsDiscovery` default to **true** — remove them, run
`pnpm build`, and count the pages in `dist/client/`. The crawler follows the
header's Dashboard link and bakes *authenticated, per-user pages into static
files*. Put the `false`s back.

Verify: `pnpm build`, then look at `dist/client/index.html` — your marketing
page, fully rendered, no server needed.

### TODO 2 — `data-only` for the authed pages

`src/routes/_app/dashboard.tsx` and `src/routes/_app/profile.tsx` are behind
auth and personal to each user — server-rendering their *markup* buys
nothing. Add:

```ts
ssr: "data-only",
```

`data-only` still runs `beforeLoad` and loaders on the server (so the auth
guard and redirect happen before any JS downloads) but ships no rendered HTML
for the subtree.

Verify: signed in, view source on `/dashboard` — the tab bar and stats are
**not** in the HTML. View source on `/` — the hero **is**. Same app, three
rendering modes: prerendered, full SSR (login, contact), and data-only.

## Bonus — a React Server Component (experimental)

RSC support in Start is experimental, and **the answer key does not include
this one** — it's an experiment, so play and then revert. The setup is
pre-installed (`@vitejs/plugin-rsc` is already in `package.json`).

1. **Turn it on** in `vite.config.ts`:

   ```ts
   import rsc from "@vitejs/plugin-rsc"
   // plugins: [..., tanstackStart({ ..., rsc: { enabled: true } }), rsc(), viteReact()]
   ```

2. **Write a server component** — `src/components/server-deals.tsx`. Note
   what it is: an `async` function component that fetches directly. No
   `useQuery`, no `useState` — it runs once, on the server, and the browser
   receives its output instead of its code:

   ```tsx
   import { createServerFn } from "@tanstack/react-start"
   import { renderServerComponent } from "@tanstack/react-start/rsc"

   import type { Flight } from "@workspace/types"

   import { API_URL } from "@/lib/api"

   async function ServerDeals() {
     let flights: Flight[] = []
     try {
       const res = await fetch(
         `${API_URL}/flights?status=scheduled&_sort=price&_limit=3`
       )
       if (res.ok) flights = (await res.json()) as Flight[]
     } catch {
       // API down (e.g. building without json-server) — render nothing.
     }
     if (flights.length === 0) return null

     return (
       <div className="rounded-lg border bg-muted/40 p-4 text-sm">
         <p className="mb-2 font-semibold">
           Today&apos;s three cheapest fares{" "}
           <span className="font-normal text-muted-foreground">
             (rendered on the server — view source!)
           </span>
         </p>
         <ul className="grid gap-1 sm:grid-cols-3">
           {flights.map((f) => (
             <li key={f.id} className="text-muted-foreground">
               {f.originCode} → {f.destinationCode}{" "}
               <span className="font-semibold text-brand">${f.price}</span>
             </li>
           ))}
         </ul>
       </div>
     )
   }

   export const getServerDeals = createServerFn().handler(async () => {
     const Renderable = await renderServerComponent(<ServerDeals />)
     return { Renderable }
   })
   ```

3. **Hand it to the home route** (`src/routes/_marketing/index.tsx`) — the
   loader returns a *rendered subtree*, not data:

   ```tsx
   loader: async () => (await getServerDeals()).Renderable,
   ```

   and render it under the hero search card:

   ```tsx
   <div className="mt-4">{Route.useLoaderData()}</div>
   ```

Things to notice once it runs:

- **View source**: the fares are in the HTML, but `ServerDeals` isn't in any
  JS bundle the browser loads.
- **With TODO 1 done**, `pnpm build` runs the server component at *build
  time* — open `dist/client/index.html` and the fares are baked into the
  static file. That's the whole rendering spectrum in one page: build-time
  RSC inside a prerendered route.
- The dev console warns about `optimizeDeps` inconsistencies — that's the
  experimental part. Expected.

## Not in this checkpoint

The dashboard tables are hand-written HTML (TanStack Table is next) and the
Contact page has no form. The command palette and Casper aren't built yet —
they arrive with the Hotkeys and AI checkpoints.
