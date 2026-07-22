import { createIsomorphicFn } from "@tanstack/react-start"
import { getCookie } from "@tanstack/react-start/server"

import type { User } from "@workspace/types"

/* ============================================================================
 * ⚠️  FAKE AUTH — DEMO / WORKSHOP ONLY. DO NOT COPY INTO A REAL APP.  ⚠️
 * ============================================================================
 *
 * What's fake here:
 *   1. Passwords are stored in PLAIN TEXT in db.json and compared by sending
 *      them as a query string to json-server. Real apps hash + salt passwords
 *      and never send them in a URL.
 *   2. The "session" is an unsigned, base64-encoded JSON blob in a NON-httpOnly
 *      cookie. Anyone can read it in devtools and forge one by hand. Real apps
 *      use a signed/encrypted, httpOnly, SameSite cookie (or a server session
 *      store) that the client cannot fabricate.
 *   3. The server trusts that cookie as-is. Real apps verify a signature or
 *      look the session up server-side before trusting any of it.
 *
 * It is deliberately just real enough to demonstrate: entering credentials that
 * actually have to match a record, protected routes, and a server-side 401.
 * ==========================================================================*/

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300"

export const SESSION_COOKIE = "ga_session"

export interface Session {
  userId: number
  email: string
  name: string
}

/** FAKE AUTH: base64 of JSON — obfuscation, not security. */
export function encodeSession(session: Session): string {
  return btoa(encodeURIComponent(JSON.stringify(session)))
}

export function decodeSession(raw: string | undefined | null): Session | null {
  if (!raw) return null
  try {
    // `as Session | null` keeps the runtime shape-check below honest — the
    // cookie is user-forgeable, so its JSON could be anything.
    const parsed = JSON.parse(decodeURIComponent(atob(raw))) as Session | null
    return typeof parsed?.userId === "number" ? parsed : null
  } catch {
    return null
  }
}

/** Isomorphic: pull our session out of a raw `Cookie:` header string. */
export function sessionFromCookieHeader(
  cookieHeader: string | null | undefined
): Session | null {
  if (!cookieHeader) return null
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
  return match ? decodeSession(match.slice(SESSION_COOKIE.length + 1)) : null
}

// --- Browser-side session handling ------------------------------------------

/**
 * Read the session wherever we happen to be running: from the incoming
 * request's cookie during SSR, from document.cookie in the browser. This is
 * what route `beforeLoad`s call — the cookie transport and the guard are REAL;
 * only the cookie's contents being unsigned is fake (see header comment).
 */
export const readSession = createIsomorphicFn()
  .server((): Session | null => decodeSession(getCookie(SESSION_COOKIE)))
  .client((): Session | null => sessionFromCookieHeader(document.cookie))

export function setClientSession(session: Session) {
  // FAKE AUTH: not httpOnly (the client needs to read it) and not Secure on
  // localhost — both would be wrong in production.
  document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; path=/; max-age=86400; SameSite=Lax`
}

export function clearClientSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

// --- Credential checks against json-server ----------------------------------

/**
 * FAKE AUTH: asks json-server for a user matching this email AND password.
 * Real auth would POST to an auth endpoint that hashes and compares server-side.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const params = new URLSearchParams({ email: email.trim(), password })
  const res = await fetch(`${API_URL}/users?${params.toString()}`)
  if (!res.ok) throw new Error("Couldn't reach the Ghost Airlines API.")
  const users = (await res.json()) as User[]
  return users[0] ?? null
}

/** FAKE AUTH: creates a real record in db.json with a plain-text password. */
export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      email: input.email.trim(),
      password: input.password,
      avatar: "",
      memberSince: new Date().toISOString(),
      tier: "Silver",
      milesBalance: 0,
      totalSpent: 0,
      preferences: {
        seat: "no-preference",
        meal: "standard",
        contactByEmail: true,
        contactBySms: false,
      },
    }),
  })
  if (!res.ok) throw new Error("Couldn't create your account.")
  return res.json() as Promise<User>
}

export function sessionFromUser(user: User): Session {
  return { userId: user.id, email: user.email, name: user.name }
}
