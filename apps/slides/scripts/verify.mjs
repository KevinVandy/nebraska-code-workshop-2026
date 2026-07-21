import { createRequire } from "node:module"

const require = createRequire(
  "/Users/kevinvancott/Documents/tanstack/workshop/node_modules/.pnpm/jsdom@29.1.1/node_modules/noop.js",
)
const { JSDOM } = require("jsdom")

const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
  url: "http://localhost:3200/",
  pretendToBeVisual: true,
})

const g = globalThis
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (!(key in g)) {
    try {
      g[key] = dom.window[key]
    } catch {}
  }
}
Object.defineProperty(g, "navigator", {
  value: dom.window.navigator,
  configurable: true,
})
g.window = dom.window
g.document = dom.window.document

if (!dom.window.matchMedia) {
  const mql = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  })
  dom.window.matchMedia = mql
  g.matchMedia = mql
}

const { run } = await import("../dist-verify/verify-entry.js")
await run()
