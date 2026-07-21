import { createFileRoute } from "@tanstack/react-router"

import { API_URL } from "@/lib/api"
import { HQ_MAP_EMBED } from "@/lib/images"

/* EXERCISE — TanStack Form. Build the contact form (details in EXERCISE.md).
 * Three finished forms in this app are your reference: login.tsx (simplest),
 * signup.tsx (async validation), profile.tsx (query-seeded values). */

export interface ContactValues {
  name: string
  email: string
  subject: string
  message: string
}

/** GIVEN: real POST to the API's `messages` resource — use this in TODO 3. */
export async function sendMessage(values: ContactValues) {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...values, createdAt: new Date().toISOString() }),
  })
  if (!res.ok) throw new Error("Couldn't send your message. Please try again.")
  return res.json() as Promise<ContactValues & { id: number }>
}

export const Route = createFileRoute("/_marketing/contact")({
  component: ContactPage,
})

// TODO 1 — define contactSchema (zod) matching ContactValues; rules in EXERCISE.md.

// TODO 2 — add a small FieldError component (copy the pattern from login.tsx).

function ContactPage() {
  // TODO 3 — create the form: useForm + a useMutation around sendMessage.

  return (
    <div className="container mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a booking, or just want to say boo? We read
          everything.
        </p>

        {/* TODO 4 — build the form markup: one form.Field per input, form.Subscribe for the submit button. */}
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          The contact form goes here — see the TODOs in this file.
        </div>
      </div>

      <aside className="space-y-6">
        <iframe
          title="Ghost Airlines headquarters — Salem, MA"
          src={HQ_MAP_EMBED}
          loading="lazy"
          className="h-44 w-full rounded-lg border"
        />
        <div>
          <h2 className="font-semibold">Headquarters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            14 Gallows Hill Road
            <br />
            Salem, MA 01970
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Support hours</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mon–Sun, 6am–midnight ET
            <br />
            1-800-555-0199
            <br />
            help@ghostairlines.example
          </p>
        </div>
      </aside>
    </div>
  )
}
