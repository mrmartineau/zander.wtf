---
title: TanStack Query (React Query)
link: https://tanstack.com/query/latest/docs/framework/react/overview
tags:
  - react
emoji: ⚛
date: git Last Modified
---

## useQuery

The v5 API uses a single object argument instead of positional arguments.

```ts
import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  name: string
}

const { data, error, isPending, isError } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
})
```

### With options

```ts
const { data, isPending } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // only run when userId is truthy
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
})
```

### Cancel with `signal`

`queryFn` gets an `AbortSignal`. Pass it to `fetch`, and React Query aborts the request when the key changes or nothing uses the query any more. More in the [AbortController](/notes/abort-controller/) note.

```ts
useQuery({
  queryKey: ['user', userId],
  queryFn: ({ signal }) => fetch(`/api/users/${userId}`, { signal }).then((res) => res.json()),
})
```

### Conditional queries with `skipToken`

A type-safe alternative to `enabled`. TypeScript knows `userId` is defined inside `queryFn`, so there's no `!` or extra check.

```ts
import { skipToken, useQuery } from '@tanstack/react-query'

useQuery({
  queryKey: ['user', userId],
  queryFn: userId ? () => fetchUser(userId) : skipToken,
})
```

`refetch()` doesn't work with `skipToken`. Use `enabled` if you need it.

### As a custom hook

```ts
import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  name: string
  email: string
}

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<User> => {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    },
    enabled: !!userId,
  })
}
```

### Usage in a component

```tsx
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, isPending, isError, error } = useUser(userId)

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return <div>Name: {user.name}</div>
}
```

## useMutation

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (newUser: { name: string }) => {
    return fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    })
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})

// Usage
mutation.mutate({ name: 'New User' })
```

### Callback signatures changed in v5.89.0

`onMutate`'s return value became its own argument, `onMutateResult`, and a real `context` object moved to the end. Code written before 5.89 that reads the third argument as the `onMutate` return value still works — the value just moved.

```ts
// Before 5.89
onError: (error, variables, context) => {} // context = onMutate's return value

// 5.89+
onMutate: (variables, context) => {}
onError: (error, variables, onMutateResult, context) => {}
onSuccess: (data, variables, onMutateResult, context) => {}
onSettled: (data, error, variables, onMutateResult, context) => {}
```

`context` is a `MutationFunctionContext`: `context.client` (the `QueryClient`), `context.meta` and `context.mutationKey`. `context.client` means callbacks can touch the cache without closing over `useQueryClient()`.

`mutationFn` gets the same `context` as its second argument:

```ts
mutationFn: (variables, { client, meta, mutationKey }) => {}
```

## Optimistic updates

Two approaches. Pick the cheap one first.

### Via the UI (`variables`)

If the pending item only needs to appear in one place, render `variables` directly — no cache writes, no rollback logic, nothing to undo.

`variables` is whatever you passed to `mutate()`. It's the same value `mutationFn` gets as its first argument, with the same type. Here `mutationFn` takes a string, so `mutate('Buy milk')` makes `variables` the string `'Buy milk'`. It's `undefined` until the first `mutate()` call.

```tsx
const { mutate, variables, isPending, isError } = useMutation({
  mutationFn: (newTodo: string) => addTodo(newTodo),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})

// In the "Add" form's submit handler
mutate('Buy milk') // variables is now 'Buy milk'

return (
  <ul>
    {todos.map((todo) => (
      <li key={todo.id}>{todo.text}</li>
    ))}
    {isPending && <li style={{ opacity: 0.5 }}>{variables}</li>}
    {isError && <li onClick={() => mutate(variables)}>{variables} — retry</li>}
  </ul>
)
```

Pass an object and `variables` is that object:

```tsx
const { mutate, variables, isPending } = useMutation({
  mutationFn: (newTodo: { text: string; dueDate: string }) => addTodo(newTodo),
})

mutate({ text: 'Buy milk', dueDate: '2026-10-27' })

{isPending && <li style={{ opacity: 0.5 }}>{variables.text} — due {variables.dueDate}</li>}
```

`useMutation` only keeps the latest call. If someone adds two to-dos before the first one saves, only the second shows. `useMutationState` returns every pending one.

To read those `variables` from a component that didn't call `mutate`, or to show every pending call, give the mutation a `mutationKey` and use `useMutationState`:

```ts
const pendingTodos = useMutationState<string>({
  filters: { mutationKey: ['addTodo'], status: 'pending' },
  select: (mutation) => mutation.state.variables as string,
})
```

### Via the cache (`onMutate`)

Needed when the update has to show up in several places at once. More code, and you own the rollback.

```ts
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo, context) => {
    // Cancel in-flight refetches so they don't clobber the optimistic write
    await context.client.cancelQueries({ queryKey: ['todos'] })

    const previousTodos = context.client.getQueryData(['todos'])

    context.client.setQueryData(['todos'], (old: Todo[] = []) => [
      ...old,
      newTodo,
    ])

    // Whatever is returned here arrives as onMutateResult
    return { previousTodos }
  },
  onError: (err, newTodo, onMutateResult, context) => {
    context.client.setQueryData(['todos'], onMutateResult?.previousTodos) // undefined if onMutate threw
  },
  onSettled: (data, error, variables, onMutateResult, context) => {
    context.client.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

The `cancelQueries` call is the part people forget: without it, a refetch that was already in flight can land *after* the optimistic write and overwrite it with stale server data.

## Pagination

Page numbers go in the query key, so each page is cached separately. On its own that means a loading flash on every page change — `placeholderData: keepPreviousData` keeps the last page on screen while the next one fetches.

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'

const Projects = () => {
  const [page, setPage] = useState(0)

  const { data, isPending, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetchProjects(page),
    placeholderData: keepPreviousData,
  })

  if (isPending) return <div>Loading...</div>

  return (
    <div>
      {data.projects.map((project) => (
        <p key={project.id}>{project.name}</p>
      ))}

      <button
        onClick={() => setPage((old) => Math.max(old - 1, 0))}
        disabled={page === 0}
      >
        Previous
      </button>
      <button
        onClick={() => setPage((old) => old + 1)}
        // Don't page forward off data we haven't confirmed yet
        disabled={isPlaceholderData || !data.hasMore}
      >
        Next
      </button>

      {isFetching && <span>Loading...</span>}
    </div>
  )
}
```

`isPlaceholderData` tells you the data on screen belongs to the *previous* page — disable "Next" while it's true, otherwise a fast clicker can skip past the end.

Prefetch the next page to make it feel instant:

```ts
useEffect(() => {
  if (!isPlaceholderData && data?.hasMore) {
    queryClient.prefetchQuery({
      queryKey: ['projects', page + 1],
      queryFn: () => fetchProjects(page + 1),
    })
  }
}, [data, isPlaceholderData, page, queryClient])
```

This only works when the API takes a page number or an offset. If it hands back a cursor, use [`useInfiniteQuery`](#infinite-queries) instead.

## Infinite queries

`useInfiniteQuery` stores every page under one query key. `initialPageParam` and `getNextPageParam` are both required — `getNextPageParam` returning `undefined` or `null` is what sets `hasNextPage` to false.

It's the natural fit for cursor-based APIs. Each response carries an opaque cursor that points at the next page, and React Query keeps the chain for you. Cursors also beat offsets when rows get added or deleted between requests: an offset shifts and you get duplicates or gaps, a cursor still points at the same row.

```ts
// GET /api/projects?limit=20&cursor=abc123
interface ProjectsPage {
  projects: Project[]
  nextCursor: string | null // null on the last page
}

const fetchProjects = async (cursor?: string): Promise<ProjectsPage> => {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)

  const response = await fetch(`/api/projects?${params}`)
  if (!response.ok) throw new Error('Failed to fetch projects')
  return response.json()
}
```

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  status,
} = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: ({ pageParam }) => fetchProjects(pageParam),
  // No cursor yet = first page. The cast widens the type so later pages can be strings.
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

`data` is `{ pages, pageParams }`, not a flat array — flatten it to render:

```tsx
const projects = data?.pages.flatMap((page) => page.projects) ?? []
```

Full signature is `getNextPageParam(lastPage, allPages, lastPageParam, allPageParams)`, so offset-based APIs without a cursor can count what they already have:

```ts
getNextPageParam: (lastPage, allPages) =>
  lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined
```

Add `getPreviousPageParam` for bi-directional lists (chat scrollback), which gives you `fetchPreviousPage` and `hasPreviousPage`. `maxPages` caps how many pages stay in the cache. With it set, define both param getters, so pages dropped from either end can be fetched again.

### Infinite scroll

Trigger `fetchNextPage` from an [`IntersectionObserver`](/notes/intersection-observer/) on a sentinel element at the bottom of the list.

```tsx
const InfiniteProjects = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['projects'],
      queryFn: ({ pageParam }) => fetchProjects(pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // isFetchingNextPage guard stops a burst of duplicate fetches
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '200px' }, // start fetching before it's actually visible
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (status === 'pending') return <div>Loading...</div>
  if (status === 'error') return <div>Something went wrong</div>

  return (
    <div>
      {data.pages.flatMap((page) => page.projects).map((project) => (
        <p key={project.id}>{project.name}</p>
      ))}

      <div ref={sentinelRef} />

      {isFetchingNextPage && <span>Loading more...</span>}
      {!hasNextPage && <span>Nothing left to load</span>}
    </div>
  )
}
```

Two things worth knowing:

- Refetching an infinite query refetches **every** page it holds, sequentially, to keep the cursor chain consistent. A hundred loaded pages is a hundred requests. `maxPages` is the fix.
- For long lists, pair this with a virtualiser (TanStack Virtual) — infinite query solves fetching, not the cost of rendering ten thousand DOM nodes.

## queryOptions

The `queryOptions` helper lets you define query configuration in one place and reuse it across `useQuery`, `useSuspenseQuery`, `useQueries`, prefetching, and more. Great for co-locating `queryKey` and `queryFn` together.

```ts
import { queryOptions, useQuery, useQueries, useSuspenseQuery } from '@tanstack/react-query'

function userOptions(id: string) {
  return queryOptions({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    staleTime: 5 * 1000,
  })
}

// Usage in components
const { data } = useQuery(userOptions(userId))
const { data: user } = useSuspenseQuery(userOptions(userId))

// Prefetching
queryClient.prefetchQuery(userOptions(userId))

// Setting data directly
queryClient.setQueryData(userOptions(userId).queryKey, newUser)

// Multiple queries
useQueries({
  queries: [userOptions('1'), userOptions('2')],
})
```

Override options at the component level:

```ts
const { data } = useQuery({
  ...userOptions(userId),
  select: (data) => data.name, // type inference still works
})
```

For infinite queries, use `infiniteQueryOptions`.

## mutationOptions

The same idea for mutations — define the config once, reuse it wherever the mutation is triggered or observed.

```ts
import { mutationOptions, useMutation, useMutationState } from '@tanstack/react-query'

function updateUserOptions() {
  return mutationOptions({
    mutationKey: ['updateUser'],
    mutationFn: (user: User) => updateUser(user),
    onSettled: (data, error, variables, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

const mutation = useMutation(updateUserOptions())

// The shared mutationKey means other components can observe it
const pending = useMutationState({
  filters: { mutationKey: updateUserOptions().mutationKey, status: 'pending' },
})
```

Anything `useMutation` accepts, `mutationOptions` accepts. Give it a `mutationKey` if you want to watch it with `useMutationState`. Its real value is keeping `mutationKey` and `mutationFn` together, so `useMutationState` filters can't drift out of sync with the mutation they're watching.

## useQueries

Run multiple queries in parallel.

```ts
import { useQueries } from '@tanstack/react-query'

const results = useQueries({
  queries: [
    {
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
    },
    {
      queryKey: ['posts', userId],
      queryFn: () => fetchUserPosts(userId),
    },
  ],
})
```

## useSuspenseQuery

For use with React Suspense. Data is guaranteed to be defined. It doesn't accept `enabled` or `placeholderData`: a suspense query always runs, and the `<Suspense>` fallback takes the place of a placeholder.

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

const UserProfile = ({ userId }: { userId: string }) => {
  // data is guaranteed to be defined
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return <div>Name: {user.name}</div>
}

// Wrap with Suspense
const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <UserProfile userId="123" />
  </Suspense>
)
```

## QueryClient setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <YourApp />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
```

## Placeholder and initial data

Placeholder data is shown while fetching but never written to the cache. `initialData` *is* written to the cache and is treated as real, fresh data.

```ts
// A stand-in value while the real thing loads
const { data, isPlaceholderData } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  placeholderData: { id: userId, name: 'Loading...' },
})

// Or keep the previous key's data on screen while the new key fetches
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  placeholderData: keepPreviousData,
})
```

`keepPreviousData` is imported from `@tanstack/react-query`. It replaced the v4 `keepPreviousData: true` boolean option.

## v4 → v5 changes

The ones you'll trip over in older code:

- **`isLoading` → `isPending`.** "No data yet" is now `isPending`. `isLoading` still exists but means `isPending && isFetching` (the first load is in progress).
- **`cacheTime` → `gcTime`.**
- **`useErrorBoundary` → `throwOnError`.**
- **`keepPreviousData: true` → `placeholderData: keepPreviousData`.** With `placeholderData`, `status` is `success` while the old data shows. The old option kept the previous query's status.
- **Single object argument.** `useQuery(key, fn, options)` is gone. Use `useQuery({ queryKey, queryFn, ...options })`.
- **`initialPageParam` is required** for infinite queries.
- **Suspense has its own hooks**: `useSuspenseQuery`, `useSuspenseInfiniteQuery`, `useSuspenseQueries`, instead of `suspense: true`.

## Related

- [TanStack Table](/notes/tanstack-table/) — server-side sorting and pagination with `useQuery`
- [TanStack Form](/notes/tanstack-form/) — submit with `useMutation`, load default values with `useQuery`
