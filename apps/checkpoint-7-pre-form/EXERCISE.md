# Checkpoint 7: TanStack Form

The Contact page has a heading, a map, and no form. Build it with TanStack
Form and zod.

**Answer key:** `apps/checkpoint-8-pre-pacer`

## Setup

```bash
pnpm dev:server   # json-server on :3300 (repo root)
pnpm dev:7        # this app on :5557
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercises

All four TODOs are in `src/routes/_marketing/contact.tsx`:

1. Write the zod validation schema.
2. Write a small `FieldError` component.
3. Set up `useForm` plus a `useMutation` that POSTs the message.
4. Build the form markup — `form.Field` per input, `form.Subscribe` for the
   submit button.

The app already contains three finished TanStack Form examples to crib from:
`login.tsx` (the minimum), `signup.tsx` (async field validation), and
`profile.tsx` (defaults from a query, selects, a save mutation).
