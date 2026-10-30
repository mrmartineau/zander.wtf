---
title: Newer React hooks
tags:
  - react
  - javascript
  - typescript
emoji: 🪝
date: git Last Modified
link: https://react.dev/reference/react/hooks
---

Tips for the hooks that came after `useState`, `useEffect` and `useRef`.

| Hook | Needs |
| --- | --- |
| `useTransition`, `useDeferredValue`, `useSyncExternalStore` | React 18 |
| `use`, `useActionState`, `useFormStatus`, `useOptimistic` | React 19 |
| `useEffectEvent` | React 19.2 |

## `use`

`use` reads a promise or a context. Unlike every other hook, you can call it inside `if` and loops, and after an early `return`.

```tsx
'use client'
import { use } from 'react'

export function Comments({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  const comments = use(commentsPromise) // suspends until the promise resolves
  return comments.map((c) => <p key={c.id}>{c.text}</p>)
}
```

```tsx
// Server Component: start the fetch, do not await it
export default function Page() {
  const commentsPromise = getComments()
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Comments commentsPromise={commentsPromise} />
    </Suspense>
  )
}
```

- The promise must be the same object on every render. A promise made during render in a Client Component is new each time, so the fallback flashes forever. Make it in a Server Component, in a parent that keeps it, or in a cache. A module-level `Map` keyed by URL works. A framework loader or TanStack Query is better.
- `fetchData(url).then(...)` also makes a new promise each render, even when `fetchData` is cached.
- Never call `use` inside `try`/`catch`. A rejected promise goes to the nearest Error Boundary. For a fallback value, add `.catch()` where you create the promise.
- Do not read `promise.status` to skip `use`. Always pass the promise in.
- Put `<Suspense>` above the component. To refresh data without the fallback, set the new promise inside `startTransition`. React keeps the old content on screen.
- In a Server Component, use `async`/`await`. A Client Component cannot `await` during render, so it needs `use`.
- The resolved value must be serialisable if the promise crosses from server to client.

`use(Context)` replaces `useContext`. It is the only way to read context after an early return. It does not work in Server Components. More on context: [useContext](/notes/react-usecontext/).

```tsx
function Heading({ children }: { children?: ReactNode }) {
  if (children == null) return null
  const theme = use(ThemeContext) // a lint error with useContext
  return <h1 style={{ color: theme.color }}>{children}</h1>
}
```

### Fetching data with `use`

`use` does not fetch. It unwraps a promise that already exists. You must start the fetch somewhere that survives re-renders, then pass the promise to `use`. There are three places to do that.

1. A Server Component, as in the `Page` example above. This is the best option.
2. A parent component that holds the promise in state.
3. A cache outside React.

The parent holds the promise and a child reads it. The child may suspend before it mounts, and React throws its state away when that happens. So the child cannot hold the promise.

```tsx
'use client'
import { Suspense, use, useState, useTransition } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`) // fetch only rejects on network errors
  return res.json()
}

export function Posts() {
  const [postsPromise, setPostsPromise] = useState(() => fetchJson<Post[]>('/api/posts'))
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => setPostsPromise(fetchJson('/api/posts')))}
      >
        Refresh
      </button>
      <ErrorBoundary fallback={<p>Could not load posts</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <PostList postsPromise={postsPromise} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

function PostList({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise)
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

- The `useState` initialiser runs once, so the promise stays the same on every render.
- `startTransition` keeps the old list on screen while the new promise is pending. `isPending` turns the button off.
- The `ErrorBoundary` catches a thrown error. More on that: [ErrorBoundary](/notes/react-errorboundary/).

When the input changes, like a user ID, a module-level cache gives the same promise for the same input:

```ts
const cache = new Map<string, Promise<unknown>>()

export function fetchCached<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    const promise = fetchJson<T>(url)
    promise.catch(() => cache.delete(url)) // a cached rejection would show the same error on retry
    cache.set(url, promise)
  }
  return cache.get(url) as Promise<T>
}

// in any component under a Suspense boundary
const user = use(fetchCached<User>(`/api/users/${id}`))
```

- This cache never expires and never clears. It is fine for a small app or a demo.
- For a real app, use a Server Component, a router loader, or TanStack Query with `useSuspenseQuery`. They handle expiry, retries and refetching.

## `useSyncExternalStore`

This hook reads data that lives outside React, like browser APIs or a store. It replaces `useEffect` plus `useState` for subscriptions. It also stops tearing, where two components show different values of the same store in one render.

```tsx
import { useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // getSnapshot, client
    () => true, // getServerSnapshot, server and hydration
  )
}
```

A tiny store of your own:

```ts
let todos: Todo[] = []
const listeners = new Set<() => void>()

export const todosStore = {
  add(todo: Todo) {
    todos = [...todos, todo] // new array, so the snapshot changes
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => todos,
}

// in a component
const todos = useSyncExternalStore(todosStore.subscribe, todosStore.getSnapshot)
```

- `getSnapshot` must return the same value while nothing changed. React compares with `Object.is`. Return `{ todos }` and you get "The result of getSnapshot should be cached" and an infinite loop. Return the stored reference or a primitive.
- Never mutate the store in place. The reference stays the same, so React sees no change.
- Define `subscribe` outside the component, or wrap it in `useCallback`. A new function each render makes React unsubscribe and resubscribe every time.
- Read a slice with a primitive, like `() => store.getState().count`. The component re-renders only when that number changes.
- Pass `getServerSnapshot` if the component renders on the server. Without it, server rendering throws. It must return the same value as the first client render, or hydration fails.
- Store updates cannot be transitions. They always render as blocking updates. Do not suspend on store values, or the nearest Suspense fallback replaces content already on screen.
- Use it only when the source of truth is outside React. Redux and Zustand use it under the hood.

## `useActionState` and `useFormStatus`

```tsx
'use client'
import { useActionState } from 'react'

async function subscribe(prev: { error?: string }, formData: FormData) {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    body: String(formData.get('email')),
  })
  return res.ok ? {} : { error: 'Could not subscribe' }
}

export function SubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribe, {})
  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <button disabled={isPending}>Subscribe</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  )
}
```

- The action gets the previous state first and the `FormData` second. This order is easy to forget.
- Actions queue. Submit twice and the second one waits for the first. For parallel work, use `useState` with `useTransition`.
- React resets the form's uncontrolled fields when the action ends. To keep what the user typed, return the values in the state and set them as `defaultValue`.

`useFormStatus` comes from `react-dom`, not `react`. It reads the status of the parent `<form>`. Call it in a child component. It always returns `pending: false` in the component that renders the `<form>`.

```tsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Save</button>
}
```

## `useOptimistic`

This hook shows the result before the server answers. When the action ends, React drops the optimistic value and shows the real state.

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (current, newTodo: Todo) => [...current, newTodo],
)

async function formAction(formData: FormData) {
  addOptimisticTodo({ id: crypto.randomUUID(), text: String(formData.get('text')), sending: true })
  await saveTodo(formData) // then `todos` must update from the real source
}
```

- Call the setter inside an action, meaning `<form action>` or `startTransition`. Outside one, React warns and shows nothing.
- Update the real `todos` before the action ends, with a parent `setState` or a revalidation. If you do not, the new item vanishes when the action ends.
- If the action throws, the optimistic value rolls back. Show the error somewhere.

## `useTransition` and `useDeferredValue`

```tsx
const [isPending, startTransition] = useTransition()

startTransition(async () => {
  await save()
  startTransition(() => setSaved(true)) // an update after await needs its own transition
})
```

- React 19 accepts async functions in `startTransition`. State updates after an `await` are not marked as transitions. Wrap them in another `startTransition`.
- Do not put a text input's own state in a transition. The input must update at once. Put the transition on the slow update instead.
- `useDeferredValue` does nothing if the slow child re-renders with its parent. Wrap the child in `memo`.

```tsx
const deferredQuery = useDeferredValue(query)
const isStale = query !== deferredQuery // dim the list while it catches up
return <SlowList query={deferredQuery} /> // SlowList is wrapped in memo()
```

- Use `useTransition` when you own the state update. Use `useDeferredValue` when the value arrives as a prop or from a library.

## `useEffectEvent`

This hook reads the latest props and state inside an Effect without making them dependencies.

```tsx
function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme) // always the latest theme
  })

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on('connected', onConnected)
    connection.connect()
    return () => connection.disconnect()
  }, [roomId]) // a theme change does not reconnect
}
```

- Call it only from inside an Effect, or from another Effect Event. Calling it during render throws. Calling it from an event handler is a lint error.
- Do not pass it to child components. Do not list it in the dependency array. Its identity changes on every render.
- Use it only for logic that is an event fired from an Effect. Do not use it to hide a dependency. If a value should restart the Effect, keep it in the array.
