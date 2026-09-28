---
title: AbortController
link: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
tags:
  - javascript
  - typescript
  - react
date: 2026-09-28
emoji: 🛑
---

An `AbortController` is how you cancel async work in the browser (and Node). You keep the **controller** and call `abort()` on it. You pass its **signal** to the thing you might want to cancel.

```ts
const controller = new AbortController()

fetch(url, { signal: controller.signal })

controller.abort() // the fetch promise rejects with an AbortError
```

- A controller is **single-use**. Once aborted it stays aborted, so make a new one for the next job.
- One signal can be passed to many things. A single `abort()` cancels them all.
- `abort(reason)` takes an optional reason. The promise rejects with that instead of the default `AbortError`.

More on fetch itself, including error handling: [fetch](/notes/fetch/).

## Cancel a fetch

```ts
const controller = new AbortController()
cancelButton.addEventListener('click', () => controller.abort())

try {
  const res = await fetch('/api/report', { signal: controller.signal })
  render(await res.json())
} catch (error) {
  if ((error as Error).name === 'AbortError') return // cancelled on purpose
  throw error
}
```

## Cancel the previous request

The classic race: the user types "re", then "react". If the "re" response arrives last, it overwrites the right results. Abort the old request before you start a new one.

```ts
let controller: AbortController | undefined

async function search(query: string) {
  controller?.abort()
  controller = new AbortController()

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
    renderResults(await res.json())
  } catch (error) {
    if ((error as Error).name !== 'AbortError') throw error
  }
}
```

Pair it with [debounce](/notes/debounce/) so you send fewer requests in the first place.

```ts
import { debounce } from './debounce'

const debouncedSearch = debounce(search, 300)

input.addEventListener('input', (e) => {
  debouncedSearch((e.target as HTMLInputElement).value.trim())
})
```

They do different jobs, so you want both:

- **Debounce** waits until typing pauses, so "r", "re", "rea"… don't each send a request.
- **Abort** handles the request that is already in flight. If the user pauses, the request starts, and then they type again, the old request is cancelled before the new one starts.

## Timeouts

You don't need a controller for a timeout. `AbortSignal.timeout()` makes a signal that aborts itself.

```ts
const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
// rejects with a TimeoutError if it takes longer than 5s
```

Need a timeout **and** a cancel button? Combine signals with `AbortSignal.any()`. The first one to fire wins.

```ts
const controller = new AbortController()

const res = await fetch(url, {
  signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
})
```

## Remove event listeners

Pass the same signal to many `addEventListener` calls. One `abort()` removes them all, and you don't need to keep a reference to each handler.

```ts
const controller = new AbortController()
const { signal } = controller

window.addEventListener('resize', onResize, { signal })
window.addEventListener('scroll', onScroll, { passive: true, signal })
document.addEventListener('keydown', onKeyDown, { signal })

// later, e.g. when a modal closes
controller.abort()
```

## Make your own functions cancellable

Accept a `signal` like `fetch` does. Check it between steps.

```ts
async function processAll(items: Item[], { signal }: { signal?: AbortSignal } = {}) {
  for (const item of items) {
    signal?.throwIfAborted() // throws the abort reason if aborted
    await processItem(item)
  }
}
```

Wrap a callback-based API by listening for the `abort` event.

```ts
const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal?.throwIfAborted()
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(signal.reason)
      },
      { once: true },
    )
  })
```

## React

### Clean up in `useEffect`

Abort in the cleanup function. The request is cancelled when the component unmounts or when `id` changes, so an old response can never set state.

```tsx
function User({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/users/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then(setUser)
      .catch((error) => {
        if (error.name !== 'AbortError') console.error(error)
      })

    return () => controller.abort()
  }, [id])

  return user ? <h1>{user.name}</h1> : <p>Loading…</p>
}
```

The same pattern cleans up event listeners.

```tsx
useEffect(() => {
  const controller = new AbortController()
  window.addEventListener('keydown', onKeyDown, { signal: controller.signal })
  window.addEventListener('resize', onResize, { signal: controller.signal })
  return () => controller.abort()
}, [])
```

### React Query

[React Query](/notes/react-query/) makes the controller for you. It passes a `signal` to your `queryFn`. Hand it to `fetch`, and React Query aborts the request when:

- the query key changes (for example, a new search term)
- the component unmounts and nothing else uses the query
- you call `queryClient.cancelQueries()`

```tsx
const { data } = useQuery({
  queryKey: ['users', id],
  queryFn: async ({ signal }) => {
    const res = await fetch(`/api/users/${id}`, { signal })
    if (!res.ok) throw new Error('Failed to load user')
    return res.json()
  },
})
```

If you don't pass `signal` to `fetch`, React Query can't cancel the request. It keeps running to the end.
