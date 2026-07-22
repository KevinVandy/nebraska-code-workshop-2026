// Static MARKETING copy for the public pages (deals, destinations, about).
// Everything data-driven in the app comes from the json-server API via
// TanStack Query — this file is only editorial content that has no API
// equivalent. Deal cards fetch their live fare; `price` here is the fallback
// shown while that loads.

export const destinations = [
  { city: "Salem", code: "SLM", region: "Massachusetts", price: 59 },
  { city: "Sleepy Hollow", code: "SLH", region: "New York", price: 84 },
  { city: "Transylvania", code: "TSY", region: "Romania", price: 249 },
  { city: "Roswell", code: "RSW", region: "New Mexico", price: 142 },
  { city: "Amityville", code: "AMY", region: "New York", price: 64 },
  { city: "Loch Ness", code: "LNS", region: "Scotland", price: 298 },
  { city: "Savannah", code: "SAV", region: "Georgia", price: 77 },
  { city: "New Orleans", code: "NOL", region: "Louisiana", price: 71 },
]

export const valueProps = [
  {
    title: "Transparent pricing",
    body: "The fare you see at search is the fare you pay. No surprise fees at checkout.",
  },
  {
    title: "Flexible dates",
    body: "Change your flight up to 24 hours before departure for a flat $25 fee.",
  },
  {
    title: "Ghost Rewards",
    body: "Earn miles on every trip and redeem them for flights, seats, and bags.",
  },
]

export const leadership = [
  { name: "Priya Nakamura", role: "CEO & Co-founder" },
  { name: "Elias Marsh", role: "Head of Ops" },
  { name: "Dana Whitlock", role: "Head of Product" },
  { name: "Sam Okafor", role: "Head of Safety" },
]
