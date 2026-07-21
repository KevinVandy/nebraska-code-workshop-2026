import { createFileRoute } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import type { AnyFieldApi } from "@tanstack/react-form"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import { API_URL } from "@/lib/api"
import { HQ_MAP_EMBED } from "@/lib/images"

const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name."),
  email: z.email("Enter a valid email address."),
  subject: z.string().min(3, "Add a short subject."),
  message: z
    .string()
    .min(10, "Give us a little more detail (at least 10 characters).")
    .max(1000, "That's a bit long — keep it under 1000 characters."),
})

type ContactValues = z.infer<typeof contactSchema>

/** Real POST to the API's `messages` resource. */
async function sendMessage(values: ContactValues) {
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

function FieldError({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched || field.state.meta.isValid) return null
  return (
    <p className="text-xs text-destructive">
      {field.state.meta.errors.map((err) => err?.message).join(", ")}
    </p>
  )
}

function ContactPage() {
  /* This form pairs TanStack Form with a TanStack Query useMutation, so
   * submit state (isPending/isSuccess/isError) comes from the mutation.
   * Compare with login/signup, which keep submit errors in plain useState. */
  const send = useMutation({ mutationFn: sendMessage })

  const form = useForm({
    defaultValues: { name: "", email: "", subject: "", message: "" },
    // One zod schema drives validation for every field (Standard Schema).
    validators: { onChange: contactSchema },
    onSubmit: async ({ value, formApi }) => {
      await send.mutateAsync(value)
      formApi.reset()
    },
  })

  return (
    <div className="container mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-[1.4fr_1fr]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a booking, or just want to say boo? We read
          everything.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label htmlFor={field.name}>Name</Label>
                  <Input
                    id={field.name}
                    placeholder="Jamie Rivera"
                    autoComplete="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
            <form.Field name="email">
              {(field) => (
                <div className="grid gap-1.5">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="jamie@email.com"
                    autoComplete="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <FieldError field={field} />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="subject">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name}>Subject</Label>
                <Input
                  id={field.name}
                  placeholder="Booking question"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="message">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name}>Message</Label>
                <Textarea
                  id={field.name}
                  rows={6}
                  placeholder="How can we help?"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" size="lg" disabled={!canSubmit}>
                {isSubmitting ? "Sending…" : "Send message"}
              </Button>
            )}
          </form.Subscribe>

          {send.isSuccess ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Thanks — we&apos;ve got your message and will reply shortly.
            </p>
          ) : null}
          {send.isError ? (
            <p className="text-sm text-destructive">{send.error.message}</p>
          ) : null}
        </form>
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
