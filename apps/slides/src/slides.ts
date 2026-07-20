import type { MDXContent } from "mdx/types"

// Slides are ordered by filename: 01-intro.mdx, 02-agenda.mdx, ...
const modules = import.meta.glob<{ default: MDXContent }>("./slides/*.mdx", {
  eager: true,
})

export const slides: Array<MDXContent> = Object.keys(modules)
  .sort()
  .map((path) => modules[path].default)
