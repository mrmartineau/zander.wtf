---
title: Debounce
tags:
  - javascript
  - typescript
  - react
date: 2026-09-28
emoji: ⏳
---

A debounced function waits until calls **stop** for `delay` ms, then runs once with the last arguments. Every new call resets the timer.

Use it when you only care about the final value: search boxes, form validation, autosave, "resize finished".

Need regular updates _while_ something is happening instead? Use [throttle](/notes/throttle/).

## JavaScript

```js
const debounce = (fn, delay) => {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), delay)
  }
}
```

## TypeScript

```ts
export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
) => {
  let id: ReturnType<typeof setTimeout> | undefined
  return (...args: Args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), delay)
  }
}
```

`Args` is inferred from `fn`, so the debounced function takes exactly the same arguments.

No `fn.apply(this, args)` here. Arrow functions don't have their own `this`, and you rarely need it — pass the element in as an argument instead (`e.target`).

## Usage

### Search as you type

Fire one request after the user stops typing, and abort the previous one if it is still in flight (see [AbortController](/notes/abort-controller/)).

```ts
const input = document.querySelector<HTMLInputElement>('#search')!
let controller: AbortController | undefined

const search = debounce(async (query: string) => {
  controller?.abort()
  controller = new AbortController()

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal: controller.signal,
  })
  renderResults(await res.json())
}, 300)

input.addEventListener('input', (e) => {
  search((e.target as HTMLInputElement).value.trim())
})
```

### Validate a field when typing pauses

```ts
const email = document.querySelector<HTMLInputElement>('#email')!

const validate = debounce(() => {
  email.setCustomValidity(email.validity.typeMismatch ? 'Enter a valid email' : '')
  email.reportValidity()
}, 500)

email.addEventListener('input', validate)
```

### Do expensive work once resizing ends

```ts
const relayout = debounce(() => {
  chart.resize(container.clientWidth, container.clientHeight)
}, 150)

window.addEventListener('resize', relayout)
```

## React hooks

### `useDebouncedValue`

Debounce a **value**. The input stays instant; only the returned value lags behind. This is the one you want most of the time.

```ts
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
```

### `useDebouncedCallback`

Debounce a **function**. The returned function keeps the same identity between renders but always calls the latest `fn`, so it never sees stale props or state.

```ts
import { useLayoutEffect, useMemo, useRef } from 'react'
import { debounce } from './debounce'

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
) {
  const fnRef = useRef(fn)
  useLayoutEffect(() => {
    fnRef.current = fn
  })

  // a call still pending at unmount still runs, so an autosave is never lost
  return useMemo(() => debounce((...args: Args) => fnRef.current(...args), delay), [delay])
}
```

> Don't write `useCallback(debounce(fn, 300), [])` or `debounce(fn)` straight in the component body. A new debounced function is created on every render, so each one has its own timer and nothing is debounced.

## With React Query

### Search as you type

Put the **debounced** value in the `queryKey`. The input is bound to the raw state, so typing never lags.

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'

type User = { id: string; name: string }

function UserSearch() {
  const [search, setSearch] = useState('')
  const query = useDebouncedValue(search.trim(), 300)

  const { data = [], isFetching } = useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async ({ signal }): Promise<User[]> => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`, { signal })
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: query.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })

  return (
    <>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-busy={isFetching}
      />
      <ul>
        {data.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  )
}
```

Why this works well:

- **One request per pause**, not one per keystroke.
- **Every term is cached.** Type "zan", then "zander", then back to "zan": the last one comes from the cache.
- **`signal`** — when the key changes, React Query aborts the old request, so a slow response can't overwrite a newer one. See [AbortController](/notes/abort-controller/).
- **`keepPreviousData`** keeps the old results on screen while the new ones load, so the list doesn't flash empty.
- **`enabled`** skips the query until there are at least two characters.

### Filters in the URL

Same idea, but the debounced value drives the URL and the query reads from the URL. Shareable, and the back button works.

```tsx
function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [text, setText] = useState(searchParams.get('q') ?? '')
  const q = useDebouncedValue(text, 400)

  useEffect(() => {
    setSearchParams((params) => {
      q ? params.set('q', q) : params.delete('q')
      return params
    })
  }, [q, setSearchParams])

  const products = useQuery({
    queryKey: ['products', searchParams.toString()],
    queryFn: ({ signal }) => fetchProducts(searchParams, signal),
    placeholderData: keepPreviousData,
  })

  // ...
}
```

### Autosave with `useMutation`

Debounce the mutation, not the input. The textarea updates on every keystroke; the save happens one second after typing stops.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function NoteEditor({ note }: { note: { id: string; body: string } }) {
  const queryClient = useQueryClient()
  const [body, setBody] = useState(note.body)

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (body: string) =>
      fetch(`/api/notes/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', note.id] }),
  })

  const save = useDebouncedCallback(mutate, 1000)

  return (
    <>
      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
          save(e.target.value)
        }}
      />
      <small>{isPending ? 'Saving…' : isError ? 'Save failed' : 'Saved'}</small>
    </>
  )
}
```

The hook doesn't cancel the timer on unmount, so if the user navigates away mid-typing, the last edit still saves.
