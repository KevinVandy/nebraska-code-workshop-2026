// Shared API resource types for Ghost Airlines (json-server db.json)

export type FlightStatus = 'on-time' | 'delayed' | 'cancelled' | 'scheduled'
export type CabinClass = 'economy' | 'premium' | 'business'
export type TripStatus = 'upcoming' | 'completed' | 'cancelled'
export type BookingStatus = 'confirmed' | 'pending'
export type SeatPreference = 'window' | 'aisle' | 'no-preference'
export type MealPreference = 'standard' | 'vegetarian' | 'vegan' | 'none'

export interface Airport {
  id: number
  code: string // 3-letter, e.g. "SLM"
  city: string
  name: string
  region: string
  tz: string
  lat: number
  lng: number
}

export interface Flight {
  id: number
  flightNumber: string // "GA-666"
  originCode: string
  destinationCode: string
  departTime: string // ISO
  arriveTime: string // ISO
  durationMinutes: number
  stops: number
  aircraft: string
  price: number
  seatsLeft: number
  cabin: CabinClass
  status: FlightStatus
  gate: string
  terminal: string
}

// Flat rows for the price-history line chart: query with ?route=SLM-RSW
export interface PriceHistoryPoint {
  id: number
  route: string // "SLM-RSW"
  date: string // YYYY-MM-DD
  price: number
}

export interface Trip {
  id: number
  userId: number
  flightId: number
  bookingRef: string // 6-char
  status: TripStatus
  bookingStatus: BookingStatus
  seat: string
  cabin: CabinClass
  passengers: number
  bookedAt: string // ISO
}

// Trip with its parent flight embedded (json-server ?_expand=flight)
export interface TripWithFlight extends Trip {
  flight: Flight
}

export interface UserPreferences {
  seat: SeatPreference
  meal: MealPreference
  contactByEmail: boolean
  contactBySms: boolean
}

export interface User {
  id: number
  name: string
  email: string
  password: string // fake, plain-text — demo only
  avatar: string
  memberSince: string // ISO
  tier: 'Silver' | 'Gold' | 'Platinum'
  milesBalance: number
  totalSpent: number
  preferences: UserPreferences
}

export interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string // ISO
}

export interface GhostAirlinesDb {
  airports: Airport[]
  flights: Flight[]
  priceHistory: PriceHistoryPoint[]
  trips: Trip[]
  users: User[]
  messages: Message[]
}
