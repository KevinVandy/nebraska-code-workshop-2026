import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import type { AnyFieldApi } from "@tanstack/react-form"
import { z } from "zod"

import type { MealPreference, SeatPreference, User } from "@workspace/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"

import { useAuth } from "@/components/auth-context"
import { API_URL, currentUserQuery } from "@/lib/api"
import { portraitUrl } from "@/lib/images"

const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.email("Enter a valid email address."),
  // Kept as plain (possibly empty) strings so they line up with the form's
  // default values — an empty field is allowed, a too-short one isn't.
  phone: z
    .string()
    .refine((v) => v === "" || v.length >= 7, "Enter a valid phone number."),
  homeAirport: z.string(),
  seat: z.enum(["window", "aisle", "no-preference"]),
  meal: z.enum(["standard", "vegetarian", "vegan", "none"]),
  contactByEmail: z.boolean(),
  contactBySms: z.boolean(),
})

interface ProfileUpdate {
  name: string
  email: string
  phone?: string
  homeAirport?: string
  preferences: User["preferences"]
}

async function updateProfile(userId: number, values: ProfileUpdate) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  if (!res.ok) throw new Error("Couldn't save your profile. Please try again.")
  return res.json() as Promise<User>
}

export const Route = createFileRoute("/_app/profile")({
  // Personal to the signed-in user — see the note in dashboard.tsx.
  ssr: "data-only",
  component: ProfilePage,
})

const SEAT_OPTIONS = [
  { value: "window", label: "Window" },
  { value: "aisle", label: "Aisle" },
  { value: "no-preference", label: "No preference" },
]

const MEAL_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "none", label: "No meal" },
]

const TIER_TARGET = 25_000

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function FieldError({ field }: { field: AnyFieldApi }) {
  if (!field.state.meta.isTouched || field.state.meta.isValid) return null
  return (
    <p className="text-xs text-destructive">
      {field.state.meta.errors.map((err) => err?.message).join(", ")}
    </p>
  )
}

function ProfilePage() {
  const { session } = useAuth()
  const user = useQuery(currentUserQuery(session?.userId))

  if (user.isPending) {
    return (
      <p className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading profile…
      </p>
    )
  }
  if (user.isError) {
    return (
      <p className="container mx-auto px-4 py-10 text-destructive">
        Couldn&apos;t load your profile. Is the API running on :3300?
      </p>
    )
  }

  // `key` remounts the form when the user changes, so defaultValues re-seed
  // from fresh query data — no effect-based reset needed.
  return <ProfileForm key={user.data.id} user={user.data} />
}

function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const { signIn } = useAuth()

  const save = useMutation({
    mutationFn: (values: ProfileUpdate) => updateProfile(user.id, values),
    onSuccess: (updated) => {
      // Refetch everything user-shaped (header avatar/name included).
      queryClient.invalidateQueries({ queryKey: ["user"] })
      /* FAKE AUTH: the session cookie carries name/email, so re-issue it —
       * otherwise the header shows the old name until the next login. */
      signIn(updated)
    },
  })

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      // The only two optional fields on User — default to empty inputs.
      phone: user.phone ?? "",
      homeAirport: user.homeAirport ?? "",
      seat: user.preferences.seat,
      meal: user.preferences.meal,
      contactByEmail: user.preferences.contactByEmail,
      contactBySms: user.preferences.contactBySms,
    },
    validators: { onChange: profileSchema },
    onSubmit: async ({ value }) => {
      await save.mutateAsync({
        name: value.name,
        email: value.email,
        phone: value.phone,
        homeAirport: value.homeAirport,
        preferences: {
          seat: value.seat,
          meal: value.meal,
          contactByEmail: value.contactByEmail,
          contactBySms: value.contactBySms,
        },
      })
    },
  })

  const progress = Math.min(
    100,
    Math.round((user.milesBalance / TIER_TARGET) * 100)
  )
  const avatar = user.avatar || portraitUrl(user.name)

  return (
    <form
      className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1.8fr_1fr]"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Personal info</h2>
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <form.Field name="name">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label htmlFor={field.name}>Full name</Label>
                    <Input
                      id={field.name}
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
                      autoComplete="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError field={field} />
                  </div>
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label htmlFor={field.name}>Phone</Label>
                    <Input
                      id={field.name}
                      type="tel"
                      placeholder="(617) 555-0142"
                      autoComplete="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError field={field} />
                  </div>
                )}
              </form.Field>
              <form.Field name="homeAirport">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label htmlFor={field.name}>Home airport</Label>
                    <Input
                      id={field.name}
                      placeholder="Salem (SLM)"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError field={field} />
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Travel preferences</h2>
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <form.Field name="seat">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label htmlFor={field.name}>Seat preference</Label>
                    <select
                      id={field.name}
                      className={selectClass}
                      value={field.state.value}
                      // A native <select> always yields a string; the options
                      // are all SeatPreference values, so narrow it back.
                      onChange={(e) =>
                        field.handleChange(e.target.value as SeatPreference)
                      }
                      onBlur={field.handleBlur}
                    >
                      {SEAT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
              <form.Field name="meal">
                {(field) => (
                  <div className="grid gap-1.5">
                    <Label htmlFor={field.name}>Dietary option</Label>
                    <select
                      id={field.name}
                      className={selectClass}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value as MealPreference)
                      }
                      onBlur={field.handleBlur}
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Contact preferences</h2>
          <Card>
            <CardContent className="divide-y p-0">
              <form.Field name="contactByEmail">
                {(field) => (
                  <div className="flex items-center justify-between px-6 py-4">
                    <label htmlFor={field.name} className="text-sm">
                      Email updates
                    </label>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked: boolean) =>
                        field.handleChange(checked)
                      }
                    />
                  </div>
                )}
              </form.Field>
              <form.Field name="contactBySms">
                {(field) => (
                  <div className="flex items-center justify-between px-6 py-4">
                    <label htmlFor={field.name} className="text-sm">
                      SMS alerts
                    </label>
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked: boolean) =>
                        field.handleChange(checked)
                      }
                    />
                  </div>
                )}
              </form.Field>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center gap-3">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" size="lg" disabled={!canSubmit}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            )}
          </form.Subscribe>
          {save.isSuccess ? (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Profile saved.
            </span>
          ) : null}
          {save.isError ? (
            <span className="text-sm text-destructive">
              {save.error.message}
            </span>
          ) : null}
        </div>
      </div>

      <aside>
        <Card>
          <CardContent className="space-y-4">
            <Avatar className="size-16">
              <AvatarImage src={avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">
                Ghost Rewards · {user.tier}
              </p>
            </div>
            <Separator />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">
                  {new Date(user.memberSince).getFullYear()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Miles</dt>
                <dd className="font-medium">
                  {user.milesBalance.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total spent</dt>
                <dd className="font-medium">
                  ${user.totalSpent.toLocaleString()}
                </dd>
              </div>
            </dl>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{user.tier}</span>
                <span>Gold at {TIER_TARGET.toLocaleString()} mi</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </form>
  )
}
