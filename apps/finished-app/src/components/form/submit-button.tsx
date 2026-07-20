import { Button } from "@workspace/ui/components/button"

import { useFormContext } from "./contexts"

export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string
  pendingLabel?: string
  className?: string
}) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <Button type="submit" size="lg" className={className} disabled={!canSubmit}>
          {isSubmitting ? (pendingLabel ?? "Submitting…") : label}
        </Button>
      )}
    </form.Subscribe>
  )
}
