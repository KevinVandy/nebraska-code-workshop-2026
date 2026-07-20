/**
 * Brand accents + taglines for each TanStack library.
 *
 * Hex values are copied verbatim from tanstack.com
 * (`src/server/og/colors.ts`) so the deck matches the site exactly.
 * Taglines come from `src/libraries/libraries.ts`.
 */
export interface Library {
  name: string
  color: string
  tagline: string
}

export const libraries = {
  query: {
    name: "Query",
    color: "#fb2c36", // red-500
    tagline:
      "Powerful asynchronous state management, server-state utilities and data fetching",
  },
  router: {
    name: "Router",
    color: "#00bc7d", // emerald-500
    tagline: "Type-safe Routing for React and Solid applications",
  },
  start: {
    name: "Start",
    color: "#00b8db", // cyan-500
    tagline:
      "Full-stack Framework powered by TanStack Router for React and Solid",
  },
  table: {
    name: "Table",
    color: "#2b7fff", // blue-500
    tagline: "Headless UI for building powerful tables & datagrids",
  },
  virtual: {
    name: "Virtual",
    color: "#ad46ff", // purple-500
    tagline: "Headless UI for Virtualizing Large Element Lists",
  },
  form: {
    name: "Form",
    color: "#f0b100", // yellow-500
    tagline: "Headless UI for building performant and type-safe forms",
  },
  store: {
    name: "Store",
    color: "#ae7d44", // twine-500
    tagline: "Framework agnostic data store with reactive framework adapters",
  },
  pacer: {
    name: "Pacer",
    color: "#7ccf00", // lime-500
    tagline:
      "Framework agnostic debouncing, throttling, rate limiting, queuing, and batching utilities",
  },
  hotkeys: {
    name: "Hotkeys",
    color: "#ff2056", // rose-500
    tagline:
      "Type-safe keyboard shortcuts, sequences, and key state tracking for your apps",
  },
  db: {
    name: "DB",
    color: "#ff6900", // orange-500
    tagline: "The reactive client-first store for your API",
  },
  ai: {
    name: "AI",
    color: "#f6339a", // pink-500
    tagline:
      "A powerful, open-source AI SDK with a unified interface across multiple providers",
  },
  intent: {
    name: "Intent",
    color: "#00a6f4", // sky-500
    tagline: "Ship Agent Skills with your npm Packages",
  },
} as const satisfies Record<string, Library>

export type LibraryId = keyof typeof libraries

/** DevObsessed brand green — used wherever DevObsessed is referenced. */
export const DEV_OBSESSED_GREEN = "#34c759"
