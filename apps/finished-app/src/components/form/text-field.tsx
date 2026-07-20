import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { useFieldContext } from "./contexts"
import { FieldError } from "./field-error"

export function TextField({
  label,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string
  type?: "text" | "email" | "password" | "tel"
  placeholder?: string
  autoComplete?: string
}) {
  const field = useFieldContext<string>()
  const showError = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
