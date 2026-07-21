# Checkpoint: TanStack Form

The Contact page has a heading, a map, and no form. Build it with TanStack
Form and zod.

**Answer key:** `apps/checkpoint-8-pre-pacer` — but try it yourself first.

## Setup

```bash
pnpm dev:server                          # json-server on :3300 (repo root)
pnpm --filter checkpoint-7-pre-form dev    # this app on :5557
```

Log in with the **Demo login** button (`jd@example.com` / `Test1234`).

## The exercise

All four TODOs are in `src/routes/_marketing/contact.tsx`:

| # | What you'll build |
|---|-------------------|
| 1 | The zod schema (Standard Schema — TanStack Form takes it directly) |
| 2 | A `FieldError` component |
| 3 | `useForm` plus a `useMutation` that POSTs the message |
| 4 | The form markup: `form.Field` per input, `form.Subscribe` for the button |

**Given:** the page layout, the map/HQ sidebar, and `sendMessage` (the API
call isn't the lesson).

**Validation rules for the schema (TODO 1):**

| Field | Rule | Message |
|-------|------|---------|
| `name` | at least 2 chars | "Please tell us your name." |
| `email` | valid email | "Enter a valid email address." |
| `subject` | at least 3 chars | "Add a short subject." |
| `message` | 10–1000 chars | "Give us a little more detail (at least 10 characters)." / "That's a bit long — keep it under 1000 characters." |

## You already have three worked examples

TanStack Form is used elsewhere in this app, and those files are your best
reference — read them:

| File | Shows |
|------|-------|
| `src/routes/_marketing/login.tsx` | The minimum: schema, fields, submit |
| `src/routes/_marketing/signup.tsx` | Async field validation (debounced email-taken check) layered on the form-level schema |
| `src/routes/_app/profile.tsx` | `defaultValues` seeded from a query, selects and switches, a save mutation |

Notice each keeps its own schema and its own small `FieldError` right in the
file. That's deliberate — every form reads top-to-bottom without chasing
imports. Follow the same style rather than extracting shared helpers.

## Things to try

- **Delete the `isTouched` check** in `FieldError` and reload. Every field
  screams before you've typed anything — that's what it's guarding against.
- **Watch the submit button.** `form.Subscribe` on `canSubmit` disables it
  while the form is invalid or in flight, without re-rendering the whole form
  on every keystroke.
- **Confirm your message landed:** `curl http://localhost:5557/messages`
- **Open the devtools panel → Form tab** and watch field state as you type.
- **Compare submit-error handling:** contact uses the mutation's `isError`;
  login and signup use plain `useState`. Neither is more correct — but know
  why you'd reach for each.

## Not in this checkpoint

- The Book search and the command palette fire a request per keystroke. That
  gets fixed with TanStack Pacer in the next checkpoint.
- No keyboard shortcuts yet — the palette opens from the header's **Search**
  button.
- Casper's panel opens but is empty; the AI assistant comes later.
