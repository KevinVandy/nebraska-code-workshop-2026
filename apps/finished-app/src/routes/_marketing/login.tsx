import * as React from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { useAuth } from "@/components/auth-context"
import { useAppForm } from "@/components/form"
import { verifyCredentials } from "@/lib/auth"
import { loginSchema } from "@/lib/schemas"

export const Route = createFileRoute("/_marketing/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const { signIn } = useAuth()
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setFormError(null)
      /* FAKE AUTH: the credentials really do have to match a user record in
       * db.json — but the check is a plain query against json-server. */
      const user = await verifyCredentials(value.email, value.password)
      if (!user) {
        setFormError("That email and password don't match an account.")
        return
      }
      signIn(user)
      navigate({ to: redirect ?? "/dashboard" })
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
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.AppField name="email">
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
                placeholder="••••••••"
                autoComplete="current-password"
              />
            )}
          </form.AppField>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <form.AppForm>
            <form.SubmitButton
              label="Log in"
              pendingLabel="Signing in…"
              className="w-full"
            />
          </form.AppForm>
        </form>

        {/* FAKE AUTH: demo credentials, shown because this is a workshop app. */}
        <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
          Demo login — <span className="font-mono">demo@ghostair.com</span> /{" "}
          <span className="font-mono">password</span>
        </p>

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
