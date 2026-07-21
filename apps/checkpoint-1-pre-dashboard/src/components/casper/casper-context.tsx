import * as React from "react"

interface CasperContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CasperContext = React.createContext<CasperContextValue | null>(null)

export function CasperProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const toggle = React.useCallback(() => setOpen((prev) => !prev), [])
  const value = React.useMemo(() => ({ open, setOpen, toggle }), [open, toggle])
  return (
    <CasperContext.Provider value={value}>{children}</CasperContext.Provider>
  )
}

export function useCasper() {
  const ctx = React.useContext(CasperContext)
  if (!ctx) throw new Error("useCasper must be used within CasperProvider")
  return ctx
}
