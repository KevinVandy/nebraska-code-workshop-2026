import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"

import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

import { portraitUrl } from "@/lib/images"
import { demoUser } from "@/lib/placeholder"

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
})

const dietary = ["Vegetarian", "Vegan", "Gluten-free", "Kosher"]

function ProfilePage() {
  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1.8fr_1fr]">
      <div className="space-y-8">
        {/* Personal info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Personal info</h2>
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue={demoUser.name} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={demoUser.email} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue={demoUser.phone} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="airport">Home airport</Label>
                <Input id="airport" defaultValue={demoUser.homeAirport} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Seat preference */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Seat preference</h2>
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary bg-primary/10 text-primary">
              Window
            </Button>
            <Button variant="outline">Aisle</Button>
          </div>
        </section>

        {/* Dietary options */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Dietary options</h2>
          <div className="flex flex-wrap gap-3">
            {dietary.map((option) => (
              <Button key={option} variant="outline" className="rounded-full">
                {option}
              </Button>
            ))}
          </div>
        </section>

        {/* Contact preferences */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Contact preferences</h2>
          <Card>
            <CardContent className="divide-y p-0">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm">Email updates</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-sm">SMS alerts</span>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </section>

        <Button>Save changes</Button>
      </div>

      {/* Rewards sidebar */}
      <aside>
        <Card>
          <CardContent className="space-y-4">
            <Avatar className="size-16">
              <AvatarImage src={portraitUrl(demoUser.name)} alt={demoUser.name} />
              <AvatarFallback>{demoUser.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{demoUser.name}</p>
              <p className="text-sm text-muted-foreground">Ghost Rewards · {demoUser.tier}</p>
            </div>
            <Separator />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{demoUser.memberSince}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Miles</dt>
                <dd className="font-medium">{demoUser.miles}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Trips</dt>
                <dd className="font-medium">{demoUser.trips}</dd>
              </div>
            </dl>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{demoUser.tier}</span>
                <span>Gold at 25,000 mi</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
