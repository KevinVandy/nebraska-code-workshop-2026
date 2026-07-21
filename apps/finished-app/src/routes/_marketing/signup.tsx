import * as React from "react"
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import type { AnyFieldApi } from "@tanstack/react-form"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"

import { useAuth } from "@/components/auth-context"
import { API_URL } from "@/lib/api"
import { registerUser } from "@/lib/auth"

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/[a-zA-Z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
})

/** Used by the email field's async validation to flag registered emails. */
async function isEmailTaken(email: string): Promise<boolean> {
  const res = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`)
  if (!res.ok) return false // don't block signup on a lookup failure
  const users = (await res.json()) as Array<unknown>
  return users.length > 0
}

export const Route = createFileRoute("/_marketing/signup")({
  // Already signed in? There's nothing to do here — mirror of the _app guard.
  beforeLoad: ({ context }) => {
    if (context.session) throw redirect({ to: "/dashboard" })
  },
  component: SignupPage,
})

function FieldError({ field }: { field: AnyFieldApi }) {
  // The async email check sets isValidating while it's in flight.
  if (field.state.meta.isValidating) {
    return <p className="text-xs text-muted-foreground">Checking…</p>
  }
  if (!field.state.meta.isTouched || field.state.meta.isValid) return null
  return (
    <p className="text-xs text-destructive">
      {field.state.meta.errors
        // zod errors are issue objects; the async validator returns a string.
        .map((err) => (typeof err === "string" ? err : err?.message))
        .join(", ")}
    </p>
  )
}

function SignupPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [formError, setFormError] = React.useState<string | null>(null)

  /* Submit errors live in local state here; contact.tsx shows the same job
   * done with a TanStack Query useMutation instead. */
  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onChange: signupSchema },
    onSubmit: async ({ value }) => {
      setFormError(null)
      try {
        /* FAKE AUTH: really does create a user row in db.json — with a
         * plain-text password, which no real app should ever do. */
        const user = await registerUser(value)
        signIn(user)
        navigate({ to: "/dashboard", replace: true })
      } catch {
        setFormError(
          "Couldn't create your account. Is the API running on :3300?"
        )
      }
    },
  })

  return (
    <div className="container mx-auto flex justify-center px-4 py-20">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Join Ghost Rewards and start earning miles.
          </p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name}>Full name</Label>
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

          {/* Field-level async validation runs alongside the form-level schema. */}
          <form.Field
            name="email"
            validators={{
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                if (!z.email().safeParse(value).success) return undefined
                return (await isEmailTaken(value))
                  ? "That email is already registered."
                  : undefined
              },
            }}
          >
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError field={field} />
              </div>
            )}
          </form.Field>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          or continue with
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" disabled>
            Google
          </Button>
          <Button variant="outline" disabled>
            Apple
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  )
}
