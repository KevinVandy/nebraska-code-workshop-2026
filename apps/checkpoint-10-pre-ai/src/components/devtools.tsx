import { TanStackDevtools } from "@tanstack/react-devtools"
import { aiDevtoolsPlugin } from "@tanstack/react-ai-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { tableDevtoolsPlugin } from "@tanstack/react-table-devtools"
import { pacerDevtoolsPlugin } from "@tanstack/react-pacer-devtools"
import { hotkeysDevtoolsPlugin } from "@tanstack/react-hotkeys-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

/**
 * One devtools shell, every TanStack library we use.
 *
 * Form / Table / AI ship ready-made plugins. Query and Router ship panel
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
        aiDevtoolsPlugin(),
        pacerDevtoolsPlugin(),
        hotkeysDevtoolsPlugin(),
      ]}
    />
  )
}
