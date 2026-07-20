import { createFormHook } from "@tanstack/react-form"

import { fieldContext, formContext } from "./contexts"
import { SelectField } from "./select-field"
import { SubmitButton } from "./submit-button"
import { SwitchField } from "./switch-field"
import { TextField } from "./text-field"
import { TextareaField } from "./textarea-field"

// App-wide form hook: `form.AppField` exposes the field components below and
// `form.AppForm` exposes the form-level ones.
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, SelectField, SwitchField },
  formComponents: { SubmitButton },
})

export { useFieldContext, useFormContext } from "./contexts"
export { errorText } from "./field-error"
