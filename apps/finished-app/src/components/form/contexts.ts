import { createFormHookContexts } from "@tanstack/react-form"

// Kept in their own module so the field/form components can consume the
// contexts without importing the hook that registers them (circular import).
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
