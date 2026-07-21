import * as React from "react"
import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import type { AnyFieldApi } from "@tanstack/react-form"
import { z } from "zod"

import type { User } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"

import { useAuth } from "@/components/auth-context"
import { verifyCredentials } from "@/lib/auth"

// TanStack Form accepts any Standard Schema validator — this zod schema
// drives validation for the whole form.
const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
})

export const Route = createFileRoute("/_marketing/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  // Already signed in? There's nothing to do here — mirror of the _app guard.
  beforeLoad: ({ context }) => {
    // TODO 4 — send signed-in visitors to "/dashboard" once it exists.
    if (context.session) throw redirect({ to: "/" })
  },
  component: LoginPage,
})

function FieldError({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched || field.state.meta.isValid) return null
  return (
    <p className="text-xs text-destructive">
      {field.state.meta.errors.map((err) => err?.message).join(", ")}
    </p>
  )
}

function LoginPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const { signIn } = useAuth()
  const [formError, setFormError] = React.useState<string | null>(null)

  // Shared by the form and the demo-login button below.
  const completeSignIn = (user: User) => {
    signIn(user)
    if (redirectTo) {
      // The guard captured a full href (path + search params), so replay it
      // through history rather than the typed `to` prop. `replace` keeps the
      // filled-in login form out of the Back button.
      router.history.replace(redirectTo)
    } else {
      router.navigate({ to: "/", replace: true }) // TODO 4 → "/dashboard"
    }
  }

  /* Submit errors live in local state here; contact.tsx shows the same job
   * done with a TanStack Query useMutation instead. */
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setFormError(null)
      try {
        /* FAKE AUTH: the credentials really do have to match a user record in
         * db.json — but the check is a plain query against json-server. */
        const user = await verifyCredentials(value.email, value.password)
        if (!user) {
          setFormError("That email and password don't match an account.")
          return
        }
        completeSignIn(user)
      } catch {
        setFormError("Couldn't reach the API. Is it running on :3300?")
      }
    },
  })

  return (
    <div className="container mx-auto flex justify-center px-4 py-20">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to manage your trips.
          </p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="email">
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
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                {isSubmitting ? "Signing in…" : "Log in"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        {/* FAKE AUTH: one-click demo login so workshop attendees don't have to type. */}
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={async () => {
            setFormError(null)
            const user = await verifyCredentials("jd@example.com", "Test1234")
            if (!user) {
              setFormError("Demo user not found — did you run pnpm seed?")
              return
            }
            completeSignIn(user)
          }}
        >
          Demo login
        </Button>

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
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
