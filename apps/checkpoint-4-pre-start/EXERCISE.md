# Checkpoint: TanStack Start

Ghost Airlines is currently a **client-only SPA** — Vite serves an empty
`<div id="root">` and JavaScript builds the whole page in the browser. Convert
it to TanStack Start so it renders on the server, then choose the right
rendering mode per route.

**Answer key:** `apps/checkpoint-5-pre-table` — but try it yourself first.

## Setup

```bash
pnpm dev:server                            # json-server on :3300 (repo root)
pnpm --filter checkpoint-4-pre-start dev     # this app on :5554
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## See what you're fixing

```bash
curl -s http://localhost:5554/ | grep -c "Low fares"
```

Zero. View source on the home page and you'll find an empty `<div id="root">`.
Everything a search engine or a slow phone sees is a blank page until the JS
bundle downloads, parses, and runs.

## The exercise

### 1. Install and swap the Vite plugin

```bash
pnpm --filter checkpoint-4-pre-start add @tanstack/react-start
```

In `vite.config.ts`, replace `tanstackRouter({ ... })` with `tanstackStart()`.
Start includes route generation, so the router plugin comes out.

### 2. Give the app a server-rendered document

Right now `index.html` is the document and `src/main.tsx` mounts React into it.
Start renders the whole document from React instead:

- Add a `shellComponent` to `src/routes/__root.tsx` that returns the real
  `<html>`, `<head>`, and `<body>`.
- Use `<HeadContent />` in the head and `<Scripts />` at the end of the body —
  those are how Start injects meta tags and the client bundle.
- Move the `<title>`, description, and the stylesheet into the root route's
  `head: () => ({ meta: [...], links: [...] })`.
- Move the theme `<script>` from `index.html` into the shell.
- Delete `index.html` and `src/main.tsx` — Start owns the entry now.

Keep `suppressHydrationWarning` on `<html>`: the theme script mutates the class
list before React hydrates, and without it React complains every reload.

### 3. Make session reading isomorphic

`readSession()` in `src/lib/auth.ts` reads `document.cookie`. That's fine in a
browser and *crashes* on a server. Start ships `createIsomorphicFn` for exactly
this:

```ts
export const readSession = createIsomorphicFn()
  .server(() => decodeSession(getCookie(SESSION_COOKIE)))
  .client(() => sessionFromCookieHeader(document.cookie))
```

`getCookie` comes from `@tanstack/react-start/server`. This is what makes the
`_app` auth guard run on the server — a signed-out visitor now gets redirected
before any dashboard JavaScript is sent.

### 4. Choose a rendering mode per route

Not every page wants the same treatment.

**Prerender the marketing pages.** `/` and `/about` are identical for every
visitor and only change when you redeploy, so build them to static HTML:

```ts
tanstackStart({
  prerender: { enabled: true, crawlLinks: false, autoStaticPathsDiscovery: false },
  pages: [
    { path: "/", prerender: { enabled: true } },
    { path: "/about", prerender: { enabled: true } },
  ],
})
```

⚠️ **Those two `false`s matter.** Both default to `true`. Leave them on, run
`pnpm build`, and watch it prerender all ten pages — including `/dashboard` and
`/profile`, baking one user's authenticated view into a static file that gets
served to everyone. Try it once, look at the output, then turn them off.

**Use `ssr: 'data-only'` for the private pages.** Add it to the route options
in `_app/dashboard.tsx` and `_app/profile.tsx`. Loaders and `beforeLoad` still
run on the server (so the guard works), but no HTML for that subtree is sent.
There's no point server-rendering a page that's different for every user and
invisible to crawlers.

## Verify

```bash
pnpm build
```

The prerender log should list exactly two pages. Then:

```bash
curl -s http://localhost:5554/ | grep -c "Low fares"          # now ≥ 1
curl -s http://localhost:5554/dashboard | grep -c "Trips over time"   # still 0
```

The home page ships real HTML; the dashboard ships none. That's the whole
lesson in two commands.

## Note: TanStack Query and SSR

Look at `src/components/providers.tsx`. The QueryClient is created inside a
`useState` initializer, not as a module-level singleton:

```ts
const [queryClient] = useState(() => new QueryClient({ ... }))
```

In a SPA it makes no difference. On a server it's essential — a module-level
client would be shared across every concurrent request, leaking one user's
cached data into another user's page. It was already written this way; now
you know why.

## Not in this checkpoint

The dashboard tables are hand-written HTML (TanStack Table is next), the
Contact page has no form, searches fire per keystroke, there are no keyboard
shortcuts, and Casper's panel is empty.
