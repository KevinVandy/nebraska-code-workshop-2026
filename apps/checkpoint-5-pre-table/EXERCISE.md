# Checkpoint 5: TanStack Table

The dashboard has three hand-written HTML tables: hardcoded headers, a
`.map()` of rows, no sorting. Convert them to TanStack Table v9, in order,
because each one adds one new idea.

**Answer key:** `apps/checkpoint-6-pre-virtual`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:5        # this app on :5555
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercises

1. Convert the Flight Status table (features, typed columns, `useTable`,
   `FlexRender`, client-side sorting) in `routes/_app/dashboard/status.tsx`,
   and register it with the devtools (`routes/__root.tsx`).
2. Add row selection and a bulk-cancel action to the Overview trips table,
   reaching the mutation through typed table meta
   (`routes/_app/dashboard/index.tsx`).
3. Convert the Book table with **server-side** sorting, because it only
   holds one page of 420 flights, so the API has to sort, not the browser
   (`routes/_app/dashboard/book.tsx`).

Follow the `TODO` markers in each file. Everything else on these pages
(queries, filters, charts, pagination) is already built.
