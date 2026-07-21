import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      /* The marketing pages look the same for every visitor and only change
       * when we redeploy, so build them to static HTML at build time.
       *
       * `crawlLinks: false` matters: it defaults to TRUE, and crawling from
       * "/" reaches the dashboard and profile links in the header — which
       * would prerender authenticated, per-user pages into static files. */
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoStaticPathsDiscovery: false,
      },
      pages: [
        { path: "/", prerender: { enabled: true } },
        { path: "/about", prerender: { enabled: true } },
      ],
    }),
    viteReact(),
  ],
})

export default config
