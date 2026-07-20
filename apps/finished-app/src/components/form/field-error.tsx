// Standard Schema validators (zod) surface errors as issue objects with a
// `message`; inline function validators surface plain strings. Normalise both.
export function errorText(errors: Array<unknown>): string {
  return errors
    .map((err) =>
      typeof err === "string"
        ? err
        : ((err as { message?: string } | null)?.message ?? "")
    )
    .filter(Boolean)
    .join(", ")
}

export function FieldError({
  errors,
  isValidating,
}: {
  errors: Array<unknown>
  isValidating?: boolean
}) {
  if (isValidating) {
    return <p className="text-xs text-muted-foreground">Checking…</p>
  }
  const text = errorText(errors)
  if (!text) return null
  return <p className="text-xs text-destructive">{text}</p>
}
