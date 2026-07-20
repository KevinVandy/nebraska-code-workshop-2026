import { createFileRoute } from "@tanstack/react-router"
import { useMutation } from "@tanstack/react-query"

import { useAppForm } from "@/components/form"
import { sendMessage } from "@/lib/api"
import { HQ_MAP_EMBED } from "@/lib/images"
import { contactSchema } from "@/lib/schemas"

export const Route = createFileRoute("/_marketing/contact")({
  component: ContactPage,
})

function ContactPage() {
  const send = useMutation({ mutationFn: sendMessage })

  const form = useAppForm({
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
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="Jamie Rivera"
                  autoComplete="name"
                />
              )}
            </form.AppField>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  type="email"
                  placeholder="jamie@email.com"
                  autoComplete="email"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="subject">
            {(field) => (
              <field.TextField label="Subject" placeholder="Booking question" />
            )}
          </form.AppField>

          <form.AppField name="message">
            {(field) => (
              <field.TextareaField
                label="Message"
                placeholder="How can we help?"
              />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubmitButton label="Send message" pendingLabel="Sending…" />
          </form.AppForm>

          {send.isSuccess ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Thanks — we&apos;ve got your message and will reply shortly.
            </p>
          ) : null}
          {send.isError ? (
            <p className="text-sm text-destructive">
              {(send.error as Error).message}
            </p>
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
