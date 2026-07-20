import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import { useFieldContext } from "./contexts"
import { FieldError } from "./field-error"

export function TextareaField({
  label,
  placeholder,
  rows = 5,
}: {
  label: string
  placeholder?: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const showError = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        name={field.name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={showError || undefined}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldError
        errors={showError ? field.state.meta.errors : []}
        isValidating={field.state.meta.isValidating}
      />
    </div>
  )
}
