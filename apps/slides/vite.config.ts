import { defineConfig } from "vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import mdx from "@mdx-js/rollup"
import rehypeHighlight from "rehype-highlight"

export default defineConfig({
  plugins: [
    // MDX must transform before the React plugin sees the file
    { enforce: "pre", ...mdx({ providerImportSource: "@mdx-js/react", rehypePlugins: [rehypeHighlight] }) },
    viteReact({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
  ],
})
