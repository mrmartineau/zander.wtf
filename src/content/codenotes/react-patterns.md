---
title: React component patterns
tags:
  - react
  - typescript
emoji: ⚛
date: 2026-10-20
link: https://react.dev/learn/thinking-in-react
---

Short examples of the patterns that come up in senior React interviews and design system work. Interview answers: [/notes/technical-job-interview-questions/#react-questions](/notes/technical-job-interview-questions/#react-questions).

## Compound components

Parts share state through context, so the consumer controls the markup.

```tsx
const TabsContext = createContext<{ active: string; setActive: (id: string) => void } | null>(null)

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue)
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!
  return (
    <button role="tab" aria-selected={ctx.active === id} onClick={() => ctx.setActive(id)}>
      {children}
    </button>
  )
}

function Panel({ id, children }: { id: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!
  return ctx.active === id ? <div role="tabpanel">{children}</div> : null
}

Tabs.Tab = Tab
Tabs.Panel = Panel

// usage
<Tabs defaultValue="a">
  <Tabs.Tab id="a">A</Tabs.Tab>
  <Tabs.Tab id="b">B</Tabs.Tab>
  <Tabs.Panel id="a">Panel A</Tabs.Panel>
  <Tabs.Panel id="b">Panel B</Tabs.Panel>
</Tabs>
```

More: [/notes/react-compound-components/](/notes/react-compound-components/)

## Polymorphic components (`as` prop)

One component, any element, with the right props for that element.

```tsx
type BoxProps<T extends ElementType> = {
  as?: T
} & ComponentPropsWithoutRef<T>

function Box<T extends ElementType = 'div'>({ as, ...props }: BoxProps<T>) {
  const Component = as ?? 'div'
  return <Component {...props} />
}

<Box as="a" href="/cv">CV</Box> // href is allowed
<Box as="button" type="submit">Send</Box> // type is allowed
```

Radix uses `asChild` instead: the component merges its props onto its only child (`<Slot>`), so you keep your own element.

## Headless components

Logic and a11y in a hook, styling left to the consumer. Radix, React Aria and TanStack work like this.

```tsx
function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial)
  const id = useId()
  return {
    open,
    getButtonProps: () => ({ 'aria-expanded': open, 'aria-controls': id, onClick: () => setOpen((o) => !o) }),
    getPanelProps: () => ({ id, hidden: !open }),
  }
}

function Faq() {
  const { getButtonProps, getPanelProps } = useDisclosure()
  return (
    <>
      <button className="my-styles" {...getButtonProps()}>Question</button>
      <div {...getPanelProps()}>Answer</div>
    </>
  )
}
```

## State reducer

Let consumers change how internal state moves. Kent C. Dodds' pattern, used by Downshift.

```tsx
type Action = { type: 'toggle' } | { type: 'reset' }

function toggleReducer(state: { on: boolean }, action: Action) {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on }
    case 'reset':
      return { on: false }
  }
}

function useToggle({ reducer = toggleReducer } = {}) {
  const [state, dispatch] = useReducer(reducer, { on: false })
  return { on: state.on, toggle: () => dispatch({ type: 'toggle' }) }
}

// consumer: never allow it to turn off
const { on, toggle } = useToggle({
  reducer: (state, action) => (action.type === 'toggle' && state.on ? state : toggleReducer(state, action)),
})
```

## Controlled and uncontrolled

A component lib should support both, like `<input value>` and `<input defaultValue>`.

```tsx
function useControllableState<T>({ value, defaultValue, onChange }: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}) {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal
  const setValue = (next: T) => {
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }
  return [current, setValue] as const
}
```

## Refs and imperative APIs

In React 19 `ref` is a normal prop, so `forwardRef` is no longer needed. Use `useImperativeHandle` to expose a small API (focus, scroll) and not the whole DOM node.

```tsx
function SearchInput({ ref }: { ref: Ref<{ focus: () => void; clear: () => void }> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = ''
    },
  }))
  return <input ref={inputRef} />
}
```

Older API: [/notes/react-forwardref/](/notes/react-forwardref/)

## Context splitting

Every consumer re-renders when the context value changes. Put state and dispatch in separate contexts, so components that only dispatch don't re-render.

```tsx
const CountState = createContext(0)
const CountDispatch = createContext<Dispatch<Action>>(() => {})

function CountProvider({ children }: { children: ReactNode }) {
  const [count, dispatch] = useReducer(reducer, 0)
  return (
    <CountDispatch.Provider value={dispatch}>
      <CountState.Provider value={count}>{children}</CountState.Provider>
    </CountDispatch.Provider>
  )
}
```

For fast-changing state, use a store with selectors (Zustand, Jotai) instead of context.

## `useSyncExternalStore`

Subscribe to a store that lives outside React, without tearing (different parts of the UI showing different values).

```tsx
function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // client snapshot
    () => true, // server snapshot
  )
}
```

## Keep input responsive: `useTransition` and `useDeferredValue`

Mark slow updates as low priority, so typing never waits for them.

```tsx
function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SlowResults query={deferredQuery} />
    </>
  )
}

// or, when you own the state update
const [isPending, startTransition] = useTransition()
startTransition(() => setTab('reports'))
```

`SlowResults` must be wrapped in `memo`, or it re-renders with every key press anyway.

## Optimistic UI: `useOptimistic`

Show the result at once. React drops the optimistic value when the action finishes, so on failure it rolls back by itself.

```tsx
function Likes({ count, like }: { count: number; like: () => Promise<void> }) {
  const [optimisticCount, addOptimistic] = useOptimistic(count, (current, n: number) => current + n)

  return (
    <form
      action={async () => {
        addOptimistic(1)
        await like() // throws → count stays as it was
      }}
    >
      <button type="submit">♥ {optimisticCount}</button>
    </form>
  )
}
```

TanStack Query version: [/notes/react-query/#optimistic-updates](/notes/react-query/#optimistic-updates)

## Error boundaries and Suspense

Declarative loading and error states. Put the boundary where the fallback makes sense, not around every component.

```tsx
<ErrorBoundary fallback={<p>Could not load comments</p>}>
  <Suspense fallback={<Spinner />}>
    <Comments />
  </Suspense>
</ErrorBoundary>
```

More: [/notes/react-errorboundary/](/notes/react-errorboundary/)

## Related

- [Next.js](/notes/nextjs/) — server and client components, Server Actions, caching
- [React with TypeScript](/notes/react-typescript/)
- [useReducer](/notes/react-usereducer/) and [useContext](/notes/react-usecontext/)
- [Advanced React component patterns](https://kentcdodds.com/blog/advanced-react-component-patterns)
