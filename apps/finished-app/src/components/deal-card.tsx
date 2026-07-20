import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"

import { Photo } from "./photo"
import { photoUrl } from "@/lib/images"

export function DealCard({
  route,
  city,
  price,
}: {
  route: string
  city: string
  price: number
}) {
  return (
    <Card className="overflow-hidden p-0">
      <Photo
        src={photoUrl(city, 600, 400)}
        alt={`${city} — ${route}`}
        className="h-40 border-b"
      />
      <div className="flex flex-col gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{route}</p>
          <p className="text-lg font-semibold">{city}</p>
        </div>
        <div className="flex items-center justify-between">
          <p>
            <span className="text-2xl font-bold text-primary">${price}</span>{" "}
            <span className="text-sm text-muted-foreground">one-way</span>
          </p>
          <Button variant="outline" size="sm">
            View deal
          </Button>
        </div>
      </div>
    </Card>
  )
}
