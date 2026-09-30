---
title: TanStack Form
link: https://tanstack.com/form/latest/docs/overview
tags:
  - react
  - typescript
emoji: 📝
date: 2026-09-28
---

TanStack Form is a headless form library. It gives you form state, validation and submission, and you bring your own markup. Field names and values are fully typed from `defaultValues`, and each field subscribes to its own slice of state, so typing in one input doesn't re-render the whole form. Reach for it when a form has client-side validation, async checks, dynamic arrays or linked fields. For a simple form that posts and reloads, a plain `<form>` with `FormData` (or a Server Action) is enough.

## Install

```sh
npm i @tanstack/react-form
```

## Basic form

`useForm` holds the state. `form.Field` renders one field through a render prop and hands you `field.state` plus the handlers. Call `e.preventDefault()` yourself, then `form.handleSubmit()`.

```tsx
import { useForm } from '@tanstack/react-form'

export function SignupForm() {
  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            value.includes('@') ? undefined : 'Enter a valid email',
        }}
        children={(field) => {
          const showError =
            field.state.meta.isTouched && !field.state.meta.isValid

          return (
            <div>
              <label htmlFor={field.name}>Email</label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={showError}
                aria-describedby={showError ? `${field.name}-error` : undefined}
              />
              {showError && (
                <p id={`${field.name}-error`}>
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )
        }}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Saving…' : 'Sign up'}
          </button>
        )}
      />
    </form>
  )
}
```

- `field.handleBlur` sets `isTouched`, so errors wait until the user has left the field.
- `form.Subscribe` re-renders only when the selected values change. Use it for anything that reads form-wide state.
- `canSubmit` stays `true` until the form is touched, then goes `false` while any field is invalid.

## Validation

### Field validators

Each validator gets `{ value, fieldApi }` and returns an error or `undefined`. Pick when it runs with the key: `onChange`, `onBlur`, `onSubmit` or `onMount`. Every sync key has an async twin (`onChangeAsync`, `onBlurAsync`, …) with its own debounce (`onChangeAsyncDebounceMs`). This is where a "username taken" check goes (compare with a hand-rolled [debounce](/notes/debounce/)):

```tsx
import { useForm } from '@tanstack/react-form'
import { isUsernameTaken } from './api'

export function UsernameForm() {
  const form = useForm({ defaultValues: { username: '' } })

  return (
    <form.Field
      name="username"
      validators={{
        onChange: ({ value }) =>
          value.length < 3 ? 'At least 3 characters' : undefined,
        onBlur: ({ value }) =>
          /^[a-z0-9_]+$/.test(value)
            ? undefined
            : 'Lowercase letters, numbers and _ only',
        onChangeAsyncDebounceMs: 500,
        onChangeAsync: async ({ value }) =>
          (await isUsernameTaken(value)) ? 'That username is taken' : undefined,
      }}
      children={(field) => (
        <>
          <input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
          {field.state.meta.isValidating && <span>Checking…</span>}
          {field.state.meta.isTouched && (
            <em>{field.state.meta.errors.join(', ')}</em>
          )}
        </>
      )}
    />
  )
}
```

- The async validator only runs when the sync one passes. Set `asyncAlways: true` to change that.
- `field.state.meta.errors` holds every current error. `field.state.meta.errorMap.onBlur` (etc.) gives you the error from one trigger.
- `asyncDebounceMs` on the field sets a default debounce for all its async validators.

### Schema validation with Zod

Any [Standard Schema](https://standardschema.dev) library (Zod, [Valibot](https://valibot.dev), ArkType, Effect Schema) works directly. No adapter needed. Pass the schema to the form's `validators` and the errors land on the matching fields:

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createAccount } from './api'

const schema = z.object({
  name: z.string().min(1, 'Required'),
  age: z.number().min(18, 'You must be 18 or over'),
})

export function AccountForm() {
  const form = useForm({
    defaultValues: { name: '', age: 0 },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      await createAccount(value)
    },
  })

  return (
    <form.Field
      name="age"
      children={(field) => (
        <>
          <input
            type="number"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
          />
          {field.state.meta.isTouched &&
            field.state.meta.errors.map((error) => (
              <p key={error?.message}>{error?.message}</p>
            ))}
        </>
      )}
    />
  )
}
```

- Schema errors are issue objects, not strings, so render `error.message`.
- `onSubmit` receives the schema's _input_ values. If the schema transforms data, call `schema.parse(value)` in `onSubmit`.
- You can also pass a schema to a single field: `validators={{ onChange: z.string().min(3) }}`.

## Array fields

Put `mode="array"` on the parent field, then render one sub-field per item with a bracketed name:

```tsx
import { useForm } from '@tanstack/react-form'

export function TeamForm() {
  const form = useForm({
    defaultValues: {
      people: [] as { name: string }[],
    },
  })

  return (
    <form.Field name="people" mode="array">
      {(field) => (
        <div>
          {field.state.value.map((_, i) => (
            <div key={i}>
              <form.Field name={`people[${i}].name`}>
                {(subField) => (
                  <input
                    aria-label={`Person ${i + 1} name`}
                    value={subField.state.value}
                    onChange={(e) => subField.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
              <button type="button" onClick={() => field.removeValue(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => field.pushValue({ name: '' })}>
            Add person
          </button>
        </div>
      )}
    </form.Field>
  )
}
```

Other array helpers on the field: `insertValue`, `replaceValue`, `swapValues` and `moveValue`.

## Linked fields

A field's validators only re-run when that field changes. Use `onChangeListenTo` (or `onBlurListenTo`) to re-run them when another field changes too, e.g. confirm password:

```tsx
import { useForm } from '@tanstack/react-form'

export function PasswordForm() {
  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  })

  return (
    <form.Field
      name="confirmPassword"
      validators={{
        onChangeListenTo: ['password'],
        onChange: ({ value, fieldApi }) =>
          value !== fieldApi.form.getFieldValue('password')
            ? 'Passwords do not match'
            : undefined,
      }}
      children={(field) => (
        <input
          type="password"
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      )}
    />
  )
}
```

## With TanStack Query

Load with `useQuery`, save with `useMutation`, and `await mutation.mutateAsync()` inside `onSubmit`. `isSubmitting` stays `true` until that promise settles. See [React Query](/notes/react-query/) for the Query side.

Render the form only after the data is there, so `defaultValues` is correct on the first render. To put server errors back on fields, call `formApi.setErrorMap()` with a `{ form, fields }` object. Each field error clears when the user edits that field.

```tsx
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, getProfile, updateProfile, type Profile } from './api'

export function ProfilePage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  if (isPending) return <p>Loading…</p>
  if (isError) return <p>Could not load your profile</p>

  return <ProfileForm profile={data} />
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (saved) => queryClient.setQueryData(['profile'], saved),
  })

  const form = useForm({
    defaultValues: profile,
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await mutation.mutateAsync(value)
        formApi.reset(saved)
      } catch (error) {
        if (error instanceof ApiError) {
          formApi.setErrorMap({
            onSubmit: { form: error.message, fields: error.fields },
          })
          return
        }
        throw error
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* fields… */}
      <form.Subscribe
        selector={(state) => state.errorMap.onSubmit}
        children={(error) =>
          error ? <p role="alert">{String(error)}</p> : null
        }
      />
    </form>
  )
}
```

- `formApi.reset(saved)` sets the values _and_ the new defaults, so the form is clean again after a save.
- A server check you want to run as part of validation, before `onSubmit`, can go in the form's `validators.onSubmitAsync`. It returns the same `{ form, fields }` shape.
- If `onSubmit` returns normally after `setErrorMap`, `isSubmitSuccessful` is still `true`. Check `canSubmit` or the error map, not that flag.

## Reusable fields with `createFormHook`

The docs recommend this for real apps. Bind your UI components to a custom `useAppForm` once, and each form gets `form.AppField` with `field.TextField` and friends, all still typed.

```tsx
// form-context.tsx
import { createFormHookContexts } from '@tanstack/react-form'

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
```

```tsx
// fields.tsx
import { useId } from 'react'
import { useFieldContext, useFormContext } from './form-context'

export function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>()
  const id = useId()
  const showError = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
      />
      {showError && (
        <p id={`${id}-error`}>
          {field.state.meta.errors
            .map((error) =>
              typeof error === 'string' ? error : error?.message,
            )
            .join(', ')}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <button type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Saving…' : label}
        </button>
      )}
    />
  )
}
```

```tsx
// app-form.tsx
import { createFormHook } from '@tanstack/react-form'
import { z } from 'zod'
import { fieldContext, formContext } from './form-context'
import { SubmitButton, TextField } from './fields'

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
})

export function ContactForm() {
  const form = useAppForm({
    defaultValues: { name: '', email: '' },
    validators: {
      onChange: z.object({
        name: z.string().min(1, 'Required'),
        email: z.email('Enter a valid email'),
      }),
    },
    onSubmit: ({ value }) => console.log(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.AppField
        name="name"
        children={(field) => <field.TextField label="Name" />}
      />
      <form.AppField
        name="email"
        children={(field) => <field.TextField label="Email" />}
      />
      <form.AppForm>
        <form.SubmitButton label="Send" />
      </form.AppForm>
    </form>
  )
}
```

- `useAppForm` takes every `useForm` option. `form.AppField` takes every `form.Field` prop.
- Components in `formComponents` must sit inside `<form.AppForm>` to get the form context.
- To split a big form across components, use `withForm` from the same `createFormHook` call.

## Gotchas and accessibility

- Always call `e.preventDefault()` in the `<form>` `onSubmit`, or the browser does a full-page submit.
- Give a reset button `type="button"` or call `e.preventDefault()` before `form.reset()`. A native reset event can clear `<select>` elements unexpectedly.
- Pair every input with a `<label htmlFor>` and a matching `id`. `field.name` works for flat forms. Use `useId()` in shared components or array rows, where names contain brackets or repeat.
- Set `aria-invalid` and point `aria-describedby` at the error element, but only once there is an error to show.
- Don't show errors before `isTouched`. `onChange` validators run on the first keystroke. On submit, `handleSubmit` marks every field as touched, so the errors appear then.
- `disabled` submit buttons can't be focused and give no reason. Consider `aria-disabled` and let `onSubmitInvalid` move focus to the first error.
- Import types such as `AnyFieldApi` from `@tanstack/react-form` if you need to type a helper that takes a field.
