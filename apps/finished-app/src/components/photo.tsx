import { cn } from "@workspace/ui/lib/utils"

// Diagonal hatching sits behind every image, so a slow-loading or failed image
// degrades to an intentional-looking placeholder instead of a blank box.
const hatchStyle: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, color-mix(in oklch, currentColor 8%, transparent) 0 1px, transparent 1px 10px)",
}

export function Photo({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <div
      className={cn("overflow-hidden bg-muted/40 text-muted-foreground", className)}
      style={hatchStyle}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
      />
    </div>
  )
}
