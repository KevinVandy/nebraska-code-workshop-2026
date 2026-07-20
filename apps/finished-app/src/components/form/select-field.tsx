import { Label } from "@workspace/ui/components/label"

import { useFieldContext } from "./contexts"
import { FieldError } from "./field-error"

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function SelectField({
  label,
  options,
}: {
  label: string
  options: Array<{ value: string; label: string }>
}) {
  const field = useFieldContext<string>()
  const showError = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={field.name}>{label}</Label>
      <select
        id={field.name}
        name={field.name}
        className={selectClass}
        aria-invalid={showError || undefined}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError errors={showError ? field.state.meta.errors : []} />
    </div>
  )
}
