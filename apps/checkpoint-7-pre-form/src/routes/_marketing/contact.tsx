import { createFileRoute } from "@tanstack/react-router"

import { API_URL } from "@/lib/api"
import { HQ_MAP_EMBED } from "@/lib/images"

/* ============================================================================
 * EXERCISE — TanStack Form
 * ============================================================================
 *
 * The Contact page has everything except the form itself. Build it.
 *
 * There are three finished TanStack Form examples already in this app — read
 * them when you get stuck, they're the best reference you have:
 *   src/routes/_marketing/login.tsx    — the simplest one
 *   src/routes/_marketing/signup.tsx   — adds async field validation
 *   src/routes/_app/profile.tsx        — seeds values from a query, selects,
 *                                        switches, and a save mutation
 *
 * Docs: https://tanstack.com/form
 * ==========================================================================*/

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

/* TODO 1 — Write the validation schema.
 *
 * TanStack Form accepts any Standard Schema validator; we use zod everywhere
 * in this app. Define `contactSchema` with the rules and messages:
 *
 *   name     at least 2 chars    "Please tell us your name."
 *   email    a valid email       "Enter a valid email address."
 *   subject  at least 3 chars    "Add a short subject."
 *   message  10–1000 chars       "Give us a little more detail (at least 10
 *                                 characters)." / "That's a bit long — keep it
 *                                 under 1000 characters."
 *
 * Keep the shape identical to ContactValues above so sendMessage still fits.
 */

/* TODO 2 — Add a FieldError component.
 *
 * Each of the other three forms has its own small copy — deliberately, so that
 * every form file reads top-to-bottom on its own. Copy the pattern:
 *
 *   function FieldError({ field }: { field: AnyFieldApi }) {
 *     if (!field.state.meta.isTouched || field.state.meta.isValid) return null
 *     ...render field.state.meta.errors, mapping each to err?.message
 *   }
 *
 * The `isTouched` check is what stops every field screaming "required" before
 * the user has typed anything. Try removing it to see why it's there.
 */

function ContactPage() {
  /* TODO 3 — Create the form.
   *
   *   const send = useMutation({ mutationFn: sendMessage })
   *
   *   const form = useForm({
   *     defaultValues: { name: "", email: "", subject: "", message: "" },
   *     validators: { onChange: contactSchema },   // one schema, every field
   *     onSubmit: async ({ value, formApi }) => {
   *       await send.mutateAsync(value)
   *       formApi.reset()
   *     },
   *   })
   *
   * Note this form gets its submit state from the MUTATION
   * (send.isSuccess / send.isError), whereas login.tsx and signup.tsx keep
   * submit errors in plain useState. Both are fine — this one shows the
   * Form + Query pairing.
   */

  return (
    <div className="container mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a booking, or just want to say boo? We read
          everything.
        </p>

        {/* TODO 4 — Build the form markup, replacing this placeholder.
          *
          * Wrap it in a <form> whose onSubmit does:
          *     e.preventDefault()
          *     form.handleSubmit()
          *
          * Then one <form.Field name="..."> per field. Each render prop gets a
          * `field` and wires the input:
          *     value={field.state.value}
          *     onChange={(e) => field.handleChange(e.target.value)}
          *     onBlur={field.handleBlur}
          *   plus <FieldError field={field} /> underneath.
          *
          * Layout to match the rest of the site: name + email side by side in
          * a `grid gap-5 sm:grid-cols-2`, then subject, then message using
          * <Textarea rows={6} />. Use <Label htmlFor={field.name}> and
          * <Input id={field.name}> so clicking a label focuses its input.
          *
          * For the submit button, subscribe to form state so it disables
          * itself while invalid or in flight:
          *
          *   <form.Subscribe
          *     selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          *   >
          *     {([canSubmit, isSubmitting]) => (
          *       <Button type="submit" size="lg" disabled={!canSubmit}>
          *         {isSubmitting ? "Sending…" : "Send message"}
          *       </Button>
          *     )}
          *   </form.Subscribe>
          *
          * Finally, render success and error states from the mutation.
          * Messages you POST really do land in the API — check
          * http://localhost:3300/messages afterwards.
          */}
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
