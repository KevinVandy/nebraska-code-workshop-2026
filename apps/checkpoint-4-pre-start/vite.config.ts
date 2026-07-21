import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/**
 * A plain client-side SPA: Vite + React + TanStack Router.
 *
 * `tanstackRouter` only generates the route tree from src/routes — there's no
 * server, no SSR, no server routes. Converting this to TanStack Start is the
 * next checkpoint.
 */
const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
})

export default config
