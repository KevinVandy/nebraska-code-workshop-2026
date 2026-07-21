import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { User } from "@workspace/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { useAuth } from "@/components/auth-context"
import { useAppForm } from "@/components/form"
import { currentUserQuery, updateProfile } from "@/lib/api"
import { portraitUrl } from "@/lib/images"
import { profileSchema } from "@/lib/schemas"

export const Route = createFileRoute("/_app/profile")({
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

function ProfilePage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const user = useQuery(currentUserQuery(session?.userId))

  if (user.isPending) {
    return (
      <p className="container mx-auto px-4 py-10 text-muted-foreground">
        Loading profile…
      </p>
    )
  }
  if (user.isError || !user.data) {
    return (
      <p className="container mx-auto px-4 py-10 text-destructive">
        Couldn&apos;t load your profile. Is the API running on :3300?
      </p>
    )
  }

  return (
    <ProfileForm
      key={user.data.id}
      user={user.data}
      queryClient={queryClient}
    />
  )
}

function ProfileForm({
  user,
  queryClient,
}: {
  user: User
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const save = useMutation({
    mutationFn: (values: Parameters<typeof updateProfile>[1]) =>
      updateProfile(user.id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user", user.id], updated)
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  const form = useAppForm({
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      homeAirport: user.homeAirport ?? "",
      seat: user.preferences?.seat ?? "no-preference",
      meal: user.preferences?.meal ?? "standard",
      contactByEmail: user.preferences?.contactByEmail ?? true,
      contactBySms: user.preferences?.contactBySms ?? false,
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
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Personal info</h2>
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField label="Full name" autoComplete="name" />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                  />
                )}
              </form.AppField>
              <form.AppField name="phone">
                {(field) => (
                  <field.TextField
                    label="Phone"
                    type="tel"
                    placeholder="(617) 555-0142"
                    autoComplete="tel"
                  />
                )}
              </form.AppField>
              <form.AppField name="homeAirport">
                {(field) => (
                  <field.TextField
                    label="Home airport"
                    placeholder="Boston (BOS)"
                  />
                )}
              </form.AppField>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Travel preferences</h2>
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <form.AppField name="seat">
                {(field) => (
                  <field.SelectField
                    label="Seat preference"
                    options={SEAT_OPTIONS}
                  />
                )}
              </form.AppField>
              <form.AppField name="meal">
                {(field) => (
                  <field.SelectField
                    label="Dietary option"
                    options={MEAL_OPTIONS}
                  />
                )}
              </form.AppField>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Contact preferences</h2>
          <Card>
            <CardContent className="divide-y p-0">
              <form.AppField name="contactByEmail">
                {(field) => <field.SwitchField label="Email updates" />}
              </form.AppField>
              <form.AppField name="contactBySms">
                {(field) => <field.SwitchField label="SMS alerts" />}
              </form.AppField>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center gap-3">
          <form.AppForm>
            <form.SubmitButton label="Save changes" pendingLabel="Saving…" />
          </form.AppForm>
          {save.isSuccess ? (
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Profile saved.
            </span>
          ) : null}
          {save.isError ? (
            <span className="text-sm text-destructive">
              {(save.error).message}
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
                {user.name?.slice(0, 2).toUpperCase()}
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
