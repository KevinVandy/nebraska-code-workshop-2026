import * as React from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { useAuth } from "@/components/auth-context"
import { useAppForm } from "@/components/form"
import { isEmailTaken } from "@/lib/api"
import { registerUser } from "@/lib/auth"
import { signupSchema } from "@/lib/schemas"

export const Route = createFileRoute("/_marketing/signup")({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onChange: signupSchema },
    onSubmit: async ({ value }) => {
      setFormError(null)
      try {
        /* FAKE AUTH: really does create a user row in db.json — with a
         * plain-text password, which no real app should ever do. */
        const user = await registerUser(value)
        signIn(user)
        navigate({ to: "/dashboard" })
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
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Full name"
                placeholder="Jamie Rivera"
                autoComplete="name"
              />
            )}
          </form.AppField>

          {/* Field-level async validation runs alongside the form-level schema. */}
          <form.AppField
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
              <field.TextField
                label="Email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            )}
          </form.AppField>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <form.AppForm>
            <form.SubmitButton
              label="Create account"
              pendingLabel="Creating account…"
              className="w-full"
            />
          </form.AppForm>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          or continue with
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">Google</Button>
          <Button variant="outline">Apple</Button>
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
