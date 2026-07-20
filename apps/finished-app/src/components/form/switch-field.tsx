import { Switch } from "@workspace/ui/components/switch"

import { useFieldContext } from "./contexts"

export function SwitchField({ label }: { label: string }) {
  const field = useFieldContext<boolean>()

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <label htmlFor={field.name} className="text-sm">
        {label}
      </label>
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked: boolean) => field.handleChange(checked)}
      />
    </div>
  )
}
