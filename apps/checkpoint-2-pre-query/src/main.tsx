import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"

import "@workspace/ui/globals.css"

import { routeTree } from "./routeTree.gen"

/**
 * Client-only SPA entry point.
 *
 * The whole app boots in the browser: this file mounts React, React builds the
 * router, and the router renders the matched route. Nothing is rendered on a
 * server — index.html ships an empty <div id="root"> and JavaScript fills it
 * in. (Converting this to TanStack Start is the next checkpoint.)
 */
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
