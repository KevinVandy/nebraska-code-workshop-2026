// Deterministic fake-image sources.
//
// Both are free, key-less, and stable for a given seed, so the same destination
// or person always renders the same picture across reloads and machines:
//   - Picsum        → scenic photography (destination / deal cards)
//   - faker's person-portrait CDN → real portrait photos (avatars)

// FNV-1a: small, stable string → number hash.
function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Scenic photo, stable per `seed`. */
export function photoUrl(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`ghost-${seed}`)}/${width}/${height}`
}

// The faker assets repo ships portraits 0-99 under male/ and female/.
const PORTRAIT_COUNT = 100

/**
 * Portrait photo, stable per `seed`.
 *
 * Note: FNV-1a's low bit is poorly distributed (its parity depends only on how
 * many odd-valued chars the seed has), so pick the folder from a well-mixed
 * high bit — otherwise every name lands in the same folder.
 */
export function portraitUrl(seed: string, size: 512 | 128 = 512): string {
  const h = hashSeed(seed)
  const folder = ((h >>> 16) & 1) === 0 ? "female" : "male"
  const index = h % PORTRAIT_COUNT
  return `https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/${folder}/${size}/${index}.jpg`
}

/** Static OpenStreetMap embed for the HQ location (Salem, MA). */
export const HQ_MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-70.92%2C42.51%2C-70.87%2C42.53&layer=mapnik&marker=42.5195%2C-70.8967"
