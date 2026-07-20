/**
 * Generates apps/api/db.json for the Ghost Airlines demo API (json-server).
 *
 * Run with `pnpm seed` (root) or `pnpm --filter api seed`.
 *
 * Faker uses a fixed seed so the STRUCTURE (counts, routes, names) is identical
 * across runs. Absolute timestamps are anchored to the real current time so the
 * data always looks "live" whenever an attendee re-seeds — upcoming flights stay
 * in the future, today's flights stay on the status board.
 */
const { faker } = require('@faker-js/faker')
const fs = require('fs')
const path = require('path')

faker.seed(666)

const AIRPORTS = [
  { code: 'SLM', city: 'Salem', name: 'Salem Witch Regional', region: 'Massachusetts, USA', tz: 'America/New_York', lat: 42.52, lng: -70.9 },
  { code: 'SLH', city: 'Sleepy Hollow', name: 'Sleepy Hollow Field', region: 'New York, USA', tz: 'America/New_York', lat: 41.09, lng: -73.86 },
  { code: 'TSY', city: 'Transylvania', name: 'Transylvania International', region: 'Romania', tz: 'Europe/Bucharest', lat: 45.79, lng: 24.15 },
  { code: 'RSW', city: 'Roswell', name: 'Roswell Spaceport', region: 'New Mexico, USA', tz: 'America/Denver', lat: 33.39, lng: -104.52 },
  { code: 'AMY', city: 'Amityville', name: 'Amityville Harbor', region: 'New York, USA', tz: 'America/New_York', lat: 40.67, lng: -73.41 },
  { code: 'LNS', city: 'Loch Ness', name: 'Loch Ness Highland', region: 'Scotland, UK', tz: 'Europe/London', lat: 57.32, lng: -4.42 },
  { code: 'SAV', city: 'Savannah', name: 'Savannah Historic', region: 'Georgia, USA', tz: 'America/New_York', lat: 32.08, lng: -81.09 },
  { code: 'NOL', city: 'New Orleans', name: 'New Orleans Bayou', region: 'Louisiana, USA', tz: 'America/Chicago', lat: 29.95, lng: -90.07 },
  { code: 'TMB', city: 'Tombstone', name: 'Tombstone Desert', region: 'Arizona, USA', tz: 'America/Phoenix', lat: 31.71, lng: -110.07 },
  { code: 'PPT', city: 'Point Pleasant', name: 'Point Pleasant Mothman', region: 'West Virginia, USA', tz: 'America/New_York', lat: 38.84, lng: -82.13 },
].map((a, i) => ({ id: i + 1, ...a }))

const CABINS = ['economy', 'economy', 'economy', 'economy', 'premium', 'business']
const AIRCRAFT = [
  'Boeing 737-800',
  'Airbus A320',
  'Boeing 757-200',
  'Airbus A321neo',
  'Embraer E175',
  'Bombardier CRJ900',
]

const DAY = 24 * 60
const now = new Date()

function startOfToday() {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}
function pickRoute() {
  const origin = faker.helpers.arrayElement(AIRPORTS)
  let dest = faker.helpers.arrayElement(AIRPORTS)
  while (dest.code === origin.code) dest = faker.helpers.arrayElement(AIRPORTS)
  return [origin, dest]
}

function generateFlights(count) {
  const flights = []
  for (let i = 1; i <= count; i++) {
    const [origin, dest] = pickRoute()
    // Every ~7th flight departs today so the Flight Status board has live rows.
    const departsToday = i % 7 === 0
    let depart
    let status
    if (departsToday) {
      depart = addMinutes(startOfToday(), faker.number.int({ min: 5 * 60, max: 22 * 60 }))
      status = faker.helpers.weightedArrayElement([
        { value: 'on-time', weight: 6 },
        { value: 'delayed', weight: 3 },
        { value: 'cancelled', weight: 1 },
      ])
    } else {
      const dayOffset = faker.number.int({ min: 1, max: 45 })
      depart = addMinutes(startOfToday(), dayOffset * DAY + faker.number.int({ min: 5 * 60, max: 22 * 60 }))
      status = 'scheduled'
    }
    const durationMinutes = faker.number.int({ min: 55, max: 390 })
    flights.push({
      id: i,
      flightNumber: `GA-${faker.number.int({ min: 100, max: 1999 })}`,
      originCode: origin.code,
      destinationCode: dest.code,
      departTime: depart.toISOString(),
      arriveTime: addMinutes(depart, durationMinutes).toISOString(),
      durationMinutes,
      stops: faker.helpers.weightedArrayElement([
        { value: 0, weight: 7 },
        { value: 1, weight: 2 },
        { value: 2, weight: 1 },
      ]),
      aircraft: faker.helpers.arrayElement(AIRCRAFT),
      price: faker.number.int({ min: 39, max: 499 }),
      seatsLeft: faker.number.int({ min: 0, max: 180 }),
      cabin: faker.helpers.arrayElement(CABINS),
      status,
      gate: `${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}${faker.number.int({ min: 1, max: 30 })}`,
      terminal: String(faker.number.int({ min: 1, max: 4 })),
    })
  }
  return flights
}

// 30 daily price points per route actually used by flights. Query with ?route=SLM-RSW
function generatePriceHistory(flights) {
  const routes = [...new Set(flights.map((f) => `${f.originCode}-${f.destinationCode}`))]
  const points = []
  let id = 1
  for (const route of routes) {
    const base = faker.number.int({ min: 80, max: 420 })
    for (let d = 29; d >= 0; d--) {
      const date = addMinutes(startOfToday(), -d * DAY)
      const price = Math.max(
        29,
        Math.round(base + faker.number.int({ min: -40, max: 40 }) + Math.sin(d / 3) * 15),
      )
      points.push({ id: id++, route, date: date.toISOString().slice(0, 10), price })
    }
  }
  return points
}

function seat() {
  return `${faker.number.int({ min: 1, max: 32 })}${faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E', 'F'])}`
}

function generateTrips(flights) {
  const trips = []
  let id = 1
  const futureFlights = flights.filter(
    (f) => new Date(f.departTime) > now && f.status !== 'cancelled',
  )
  // ~6 upcoming trips referencing real future flights (shown in the Overview table).
  for (const f of faker.helpers.arrayElements(futureFlights, 6)) {
    trips.push({
      id: id++,
      userId: 1,
      flightId: f.id,
      bookingRef: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
      status: 'upcoming',
      bookingStatus: faker.helpers.weightedArrayElement([
        { value: 'confirmed', weight: 3 },
        { value: 'pending', weight: 1 },
      ]),
      seat: seat(),
      cabin: f.cabin,
      passengers: faker.number.int({ min: 1, max: 3 }),
      bookedAt: addMinutes(now, -faker.number.int({ min: 1, max: 30 }) * DAY).toISOString(),
    })
  }
  // ~40 completed trips over the last 12 months (feed the "Trips over time" bar chart).
  for (let k = 0; k < 40; k++) {
    const f = faker.helpers.arrayElement(flights)
    trips.push({
      id: id++,
      userId: 1,
      flightId: f.id,
      bookingRef: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
      status: 'completed',
      bookingStatus: 'confirmed',
      seat: seat(),
      cabin: f.cabin,
      passengers: faker.number.int({ min: 1, max: 3 }),
      bookedAt: addMinutes(now, -faker.number.int({ min: 20, max: 365 }) * DAY).toISOString(),
    })
  }
  return trips
}

function generateUsers() {
  const demo = {
    id: 1,
    name: 'Morticia Graves',
    email: 'demo@ghostair.com',
    password: 'password',
    avatar: faker.image.avatar(),
    memberSince: addMinutes(now, -faker.number.int({ min: 400, max: 1200 }) * DAY).toISOString(),
    tier: 'Gold',
    milesBalance: faker.number.int({ min: 10000, max: 90000 }),
    totalSpent: faker.number.int({ min: 2000, max: 15000 }),
    preferences: { seat: 'window', meal: 'standard', contactByEmail: true, contactBySms: false },
  }
  const others = []
  for (let i = 2; i <= 3; i++) {
    others.push({
      id: i,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password',
      avatar: faker.image.avatar(),
      memberSince: addMinutes(now, -faker.number.int({ min: 100, max: 1500 }) * DAY).toISOString(),
      tier: faker.helpers.arrayElement(['Silver', 'Gold', 'Platinum']),
      milesBalance: faker.number.int({ min: 0, max: 120000 }),
      totalSpent: faker.number.int({ min: 0, max: 20000 }),
      preferences: {
        seat: faker.helpers.arrayElement(['window', 'aisle', 'no-preference']),
        meal: faker.helpers.arrayElement(['standard', 'vegetarian', 'vegan', 'none']),
        contactByEmail: true,
        contactBySms: faker.datatype.boolean(),
      },
    })
  }
  return [demo, ...others]
}

function generate() {
  console.log('Generating Ghost Airlines fake data...')
  const airports = AIRPORTS
  const flights = generateFlights(420)
  const priceHistory = generatePriceHistory(flights)
  const trips = generateTrips(flights)
  const users = generateUsers()
  const messages = []

  const db = { airports, flights, priceHistory, trips, users, messages }
  const dbPath = path.join(__dirname, '..', 'db.json')
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

  console.log(`✅ Wrote ${dbPath}`)
  console.log(
    `   airports:${airports.length} flights:${flights.length} priceHistory:${priceHistory.length} trips:${trips.length} users:${users.length}`,
  )
  console.log(`   Demo login → demo@ghostair.com / password`)
}

generate()
