# Checkpoint: TanStack Table

The dashboard has three tables. All three are hand-written HTML — hardcoded
`<th>`s, a `.map()` of rows, no sorting. Convert them to TanStack Table v9.

**Answer key:** `apps/checkpoint-6-pre-virtual` — but try it yourself first.

## Setup

```bash
pnpm dev:server                            # json-server on :3300 (repo root)
pnpm --filter checkpoint-5-pre-table dev     # this app on :5555
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercises — do them in this order

Each table adds one new idea. Don't skip ahead; the third one only makes sense
after the first two.

| # | File | New idea |
|---|------|----------|
| 1 | `dashboard/status.tsx` | The basics: features, columns, `useTable`, `FlexRender`, client-side sorting |
| 2 | `dashboard/index.tsx` | Row selection, and how cells reach a mutation (`tableMeta`) |
| 3 | `dashboard/book.tsx` | Server-side sorting (`manualSorting`) |

The TODOs in each file walk through it. Everything else on these pages — the
queries, the filters, the charts, the pagination — is already built.

## The three ideas, briefly

**v9 is opt-in.** A table only gets the features you register in
`tableFeatures({ ... })`. Only the Overview table needs row selection, so only
that one registers `rowSelectionFeature`. Declare the feature set per route,
right next to the table that uses it.

**Column definitions must not close over per-render values.** They're module-level
and memoised. When a cell needs something live — the cancel mutation, the
booking dialog opener — the answer is **table meta**: declare its type with the
`tableMeta` slot, pass values via `useTable({ meta })`, read them in the cell
via `table.options.meta`. Typed, and no stale closures.

**Sorting can happen in two places.** Status and Overview sort in the browser
(`sortedRowModel`). Book *can't* — it only holds 50 of 420 flights, so
client-side sorting would sort one page. It sets `manualSorting: true`, keeps
`sorting` in the query key, and lets json-server do the work.

## Things to try

- **Sort the Book table with `manualSorting: false`** and compare the results
  against the real cheapest flights. You'll be sorting 50 rows, not 420.
- **Drop `getRowId`** from the Overview table, select some rows, then sort.
  Selection follows the wrong trips, because keys fall back to row indices.
- **Skip the `indeterminate` ref** on the select-all checkbox and check one
  row. The header checkbox looks unchecked, not partial.
- **Open the devtools panel → Table tab** after TODO 1e and watch column and
  sorting state as you click headers.

## Not in this checkpoint

- The Book table paginates with Previous/Next; infinite scroll and
  virtualization come next.
- The Contact page has no form yet.
- Search boxes fire a request per keystroke; no keyboard shortcuts; Casper's
  panel is empty. All of that comes later.
