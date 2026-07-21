import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

/**
 * One devtools shell, every TanStack library we use.
 *
 * Form and Table ship ready-made plugins. Query and Router ship panel
 * components instead, so they're wrapped in the `{ id, name, render }` plugin
 * shape the shell expects.
 *
 * Note: TanStack Virtual has no devtools package — its behaviour shows up
 * through the Table plugin on the Book a Flight table instead.
 */
export function Devtools() {
  return (
    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[
        {
          id: "tanstack-query",
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          id: "tanstack-router",
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        tableDevtoolsPlugin(),
        formDevtoolsPlugin(),
        // TODO 3 — add pacerDevtoolsPlugin() here (see book.tsx).
      ]}
    />
  )
}
