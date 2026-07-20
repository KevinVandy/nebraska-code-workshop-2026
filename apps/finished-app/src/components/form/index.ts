import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./contexts"
import { SubmitButton } from "./submit-button"
import { TextField } from "./text-field"
import { TextareaField } from "./textarea-field"

// App-wide form hook: `form.AppField` exposes the field components below and
// `form.AppForm` exposes the form-level ones.
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField },
  formComponents: { SubmitButton },
})

export { useFieldContext, useFormContext } from "./contexts"
export { errorText } from "./field-error"
