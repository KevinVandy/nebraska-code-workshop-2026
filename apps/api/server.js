// Ghost Airlines fake API (json-server v0).
//
// Using a small custom server (instead of the CLI) so we can:
//   - expose the X-Total-Count header to the browser (needed for infinite
//     scrolling to know the total row count across origins), and
//   - simulate network latency with a fixed delay.
const jsonServer = require('json-server')
const path = require('path')

const PORT = process.env.PORT ? Number(process.env.PORT) : 3300
const DELAY = process.env.DELAY ? Number(process.env.DELAY) : 400

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

server.use(middlewares)

// Let the browser read pagination metadata on cross-origin requests.
server.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'X-Total-Count')
  next()
})

// Fake latency so loading states are visible in the workshop.
server.use((req, res, next) => setTimeout(next, DELAY))

server.use(router)

server.listen(PORT, () => {
  console.log(`Ghost Airlines API on http://localhost:${PORT} (delay ${DELAY}ms)`)
})
