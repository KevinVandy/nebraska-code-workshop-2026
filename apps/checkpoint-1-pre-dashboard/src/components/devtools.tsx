import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

/**
 * One devtools shell, every TanStack library we use.
 *
 * Form ships a ready-made plugin. Query and Router ship panel components
 * instead, so they're wrapped in the `{ id, name, render }` plugin shape the
 * shell expects.
 */
export function Devtools() {
  return (
    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[
        {
          id: "tanstack-router",
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        formDevtoolsPlugin(),
      ]}
    />
  )
}
