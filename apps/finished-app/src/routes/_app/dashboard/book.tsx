import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import { createColumnHelper, useTable } from "@tanstack/react-table"
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools"
import type { OnChangeFn, SortingState } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useDebouncedCallback } from "@tanstack/react-pacer"
import { z } from "zod"
import type { Flight } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"
import { useBooking } from "@/components/booking/booking-dialog"
import { PriceHistoryChart } from "@/components/price-history-chart"
import {
  airportsQuery,
  flightsInfiniteQuery,
  priceHistoryQuery,
} from "@/lib/api"
import { SortIndicator, dataTableFeatures } from "@/lib/table"

// Filters live in the URL, so they're shareable/bookmarkable — and Casper's
// applySearchFilters client tool can navigate here with typed values.
const bookSearchSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  q: z.string().optional(),
})

export const Route = createFileRoute("/_app/dashboard/book")({
  validateSearch: bookSearchSchema,
  component: BookPage,
})

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}
function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
function formatStops(stops: number) {
  return stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, Flight>()

function BookPage() {
  const airports = useQuery(airportsQuery)
  const airportOptions = airports.data ?? []

  const filters = Route.useSearch()
  const navigate = Route.useNavigate()

  // Only fetches once both endpoints of the route are chosen (enabled flag).
  const priceHistory = useQuery(priceHistoryQuery(filters.from, filters.to))

  // Merge one filter into the URL (undefined removes the key).
  const setFilter = (key: "from" | "to" | "date" | "q", value: string) => {
    navigate({
      search: (prev) => ({ ...prev, [key]: value || undefined }),
      replace: true,
    })
  }

  /* TanStack Pacer: the search box keeps its own local state so typing stays
   * instant, while the expensive part — writing to the URL, which changes the
   * query key and refetches — is debounced to 400ms. Without this, every
   * keystroke triggered a navigation and an API request. */
  const [searchText, setSearchText] = React.useState(filters.q ?? "")
  const commitSearch = useDebouncedCallback(
    (value: string) => setFilter("q", value),
    { wait: 400 }
  )

  // Keep the input in sync when the URL changes from elsewhere (e.g. Casper's
  // applySearchFilters tool, or the back button).
  React.useEffect(() => {
    setSearchText(filters.q ?? "")
  }, [filters.q])

  // Columns are static, so the Book cell reads the latest opener via a ref.
  const { openBooking } = useBooking()
  const openBookingRef = React.useRef(openBooking)
  openBookingRef.current = openBooking

  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("flightNumber", { header: "Flight", size: 110 }),
        columnHelper.accessor(
          (row) =>
            `${row.originCode} ${formatTime(row.departTime)} → ${row.destinationCode} ${formatTime(row.arriveTime)}`,
          { id: "route", header: "Route", size: 280, enableSorting: false }
        ),
        columnHelper.accessor("durationMinutes", {
          header: "Duration",
          size: 120,
          cell: (info) => formatDuration(info.getValue()),
        }),
        columnHelper.accessor("stops", {
          header: "Stops",
          size: 110,
          cell: (info) => formatStops(info.getValue()),
        }),
        columnHelper.accessor("seatsLeft", { header: "Seats left", size: 130 }),
        columnHelper.accessor("price", {
          header: "Price",
          size: 110,
          cell: (info) => (
            <span className="font-semibold">${info.getValue()}</span>
          ),
        }),
        columnHelper.display({
          id: "book",
          header: "",
          size: 110,
          cell: ({ row }) => (
            <Button
              size="sm"
              className="ml-auto"
              onClick={() =>
                openBookingRef.current({ kind: "flight", flight: row.original })
              }
            >
              Book
            </Button>
          ),
        }),
      ]),
    []
  )

  const { data, fetchNextPage, isFetching, isLoading, hasNextPage } =
    useInfiniteQuery({
      ...flightsInfiniteQuery(sorting, filters),
      placeholderData: keepPreviousData,
    })

  const flatData = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )
  const totalRowCount = data?.pages[0]?.meta.totalRowCount ?? 0
  const totalFetched = flatData.length

  // Fetch the next page as the user nears the bottom of the scroll container.
  const fetchMoreOnBottomReached = React.useCallback(
    (el?: HTMLDivElement | null) => {
      if (!el) return
      const { scrollHeight, scrollTop, clientHeight } = el
      if (
        scrollHeight - scrollTop - clientHeight < 500 &&
        !isFetching &&
        hasNextPage
      ) {
        fetchNextPage()
      }
    },
    [fetchNextPage, isFetching, hasNextPage]
  )

  const table = useTable(
    {
      features: dataTableFeatures,
      data: flatData,
      columns,
      state: { sorting },
      manualSorting: true, // json-server does the sorting server-side
      debugTable: false,
    },
    (state) => state
  )

  // Register this table with the unified TanStack Devtools panel.
  useTanStackTableDevtools(table)

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 48,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (el) => el.getBoundingClientRect().height
        : undefined,
    overscan: 8,
  })

  // Reset scroll to top whenever the sort changes.
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater)
    rowVirtualizer.scrollToIndex(0)
  }
  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }))

  // Check on mount / after fetches whether we should immediately load more.
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current)
  }, [fetchMoreOnBottomReached])

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_2fr_auto] md:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="from">From</Label>
            <select
              id="from"
              className={selectClass}
              value={filters.from ?? ""}
              onChange={(e) => setFilter("from", e.target.value)}
            >
              <option value="">Any</option>
              {airportOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="to">To</Label>
            <select
              id="to"
              className={selectClass}
              value={filters.to ?? ""}
              onChange={(e) => setFilter("to", e.target.value)}
            >
              <option value="">Any</option>
              {airportOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="date">Date</Label>
            <input
              id="date"
              type="date"
              className={selectClass}
              value={filters.date ?? ""}
              onChange={(e) => setFilter("date", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Flight #, city, or airport code"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value) // instant
                commitSearch(e.target.value) // debounced
              }}
            />
          </div>
          <p className="pb-2 text-sm whitespace-nowrap text-muted-foreground">
            {totalRowCount ? `${totalRowCount} flights found` : "…"}
          </p>
        </div>
      </Card>

      {/* Route picked → show its 30-day price trend from /priceHistory. */}
      {filters.from && filters.to && priceHistory.data?.length ? (
        <Card className="p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">
              Price trend · {filters.from} → {filters.to}
            </h2>
            <p className="text-xs text-muted-foreground">
              30-day low{" "}
              <span className="font-semibold text-brand">
                ${Math.min(...priceHistory.data.map((p) => p.price))}
              </span>
            </p>
          </div>
          <PriceHistoryChart data={priceHistory.data} />
        </Card>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div
          ref={tableContainerRef}
          onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
          className="relative h-[600px] overflow-auto"
        >
          <table className="grid w-full text-sm">
            <thead className="sticky top-0 z-10 grid bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="flex w-full">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort()
                    return (
                      <th
                        key={header.id}
                        className="flex items-center overflow-hidden border-b px-4 py-3 text-left font-medium whitespace-nowrap text-muted-foreground"
                        style={{ width: header.getSize() }}
                      >
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1 whitespace-nowrap",
                            canSort &&
                              "cursor-pointer select-none hover:text-foreground"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!canSort}
                        >
                          <table.FlexRender header={header} />
                          <SortIndicator sorted={header.column.getIsSorted()} />
                        </button>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody
              className="relative grid"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {isLoading ? (
                <tr className="flex px-4 py-8 text-muted-foreground">
                  <td>Loading flights…</td>
                </tr>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index]
                  return (
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      className="absolute flex w-full border-b hover:bg-muted/40"
                      style={{ transform: `translateY(${virtualRow.start}px)` }}
                    >
                      {row.getAllCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="flex items-center overflow-hidden px-4 py-3 whitespace-nowrap"
                          style={{ width: cell.column.getSize() }}
                        >
                          <table.FlexRender cell={cell} />
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {totalFetched.toLocaleString()} of {totalRowCount.toLocaleString()}{" "}
          flights loaded
          {isFetching ? " · fetching…" : ""}
        </div>
      </Card>
    </div>
  )
}
