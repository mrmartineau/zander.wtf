---
title: Throttle
tags:
  - javascript
  - typescript
  - react
date: 2026-09-28
emoji: 🚦
---

A throttled function runs **at most once every `interval` ms**, however often it's called. Unlike [debounce](/notes/debounce/), it keeps firing _while_ the events keep coming.

Use it for continuous events where you want steady updates: scroll, resize, pointer move, drag, sliders.

## JavaScript

It runs on the first call, then ignores calls until `interval` has passed.

```js
const throttle = (fn, interval) => {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }
}
```

## TypeScript

```ts
export const throttle = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  interval: number,
) => {
  let last = 0
  return (...args: Args) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }
}
```

Compare with [debounce](/notes/debounce/): debounce resets a timer on every call, throttle checks the clock.

### Don't drop the last call

The catch with the version above: calls inside the interval are thrown away, **including the last one**. Scroll to the bottom quickly and the handler may never see the final position.

This version keeps only the latest call and runs it when the interval ends. The React hooks below use it.

```ts
export const throttleTrailing = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  interval: number,
) => {
  let last = 0
  let id: ReturnType<typeof setTimeout> | undefined
  return (...args: Args) => {
    clearTimeout(id)
    const wait = Math.max(interval - (Date.now() - last), 0)
    id = setTimeout(() => {
      last = Date.now()
      fn(...args)
    }, wait)
  }
}
```

## Usage

### Scroll: progress bar and back-to-top button

```ts
const progress = document.querySelector<HTMLElement>('#progress')!
const backToTop = document.querySelector<HTMLElement>('#back-to-top')!

const onScroll = throttle(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.style.transform = `scaleX(${window.scrollY / max})`
  backToTop.hidden = window.scrollY < 600
}, 100)

// passive: we never call preventDefault, so the browser can scroll without waiting for us
window.addEventListener('scroll', onScroll, { passive: true })
```

### Track pointer position

```ts
const sendCursor = throttle((x: number, y: number) => {
  socket.send(JSON.stringify({ type: 'cursor', x, y }))
}, 50)

document.addEventListener('pointermove', (e) => sendCursor(e.clientX, e.clientY))
```

### Throttle to the frame rate instead

For purely visual work (moving an element with the pointer, parallax), throttle to the browser's paint cycle with `requestAnimationFrame` instead of a fixed interval.

```ts
const rafThrottle = <Args extends unknown[]>(fn: (...args: Args) => void) => {
  let frame: number | undefined
  let latest: Args

  return (...args: Args) => {
    latest = args
    frame ??= requestAnimationFrame(() => {
      frame = undefined
      fn(...latest)
    })
  }
}

window.addEventListener(
  'scroll',
  rafThrottle(() => {
    header.classList.toggle('is-stuck', window.scrollY > 0)
  }),
  { passive: true },
)
```

> Before you throttle a scroll handler, check if you need one. "Is this element on screen?" is better answered by [`IntersectionObserver`](/notes/intersection-observer/), and many scroll effects can be pure CSS (`position: sticky`, scroll-driven animations).

## React hooks

### `useThrottledValue`

Throttle a **value**. It updates at most once per `interval`, and always settles on the latest value.

```ts
import { useEffect, useRef, useState } from 'react'

export function useThrottledValue<T>(value: T, interval = 200): T {
  const [throttled, setThrottled] = useState(value)
  const last = useRef(0)

  useEffect(() => {
    const remaining = interval - (Date.now() - last.current)
    const id = setTimeout(
      () => {
        last.current = Date.now()
        setThrottled(value)
      },
      Math.max(remaining, 0),
    )
    return () => clearTimeout(id)
  }, [value, interval])

  return throttled
}
```

### `useThrottledCallback`

Throttle a **function**. Same identity between renders; always calls the latest `fn`.

```ts
import { useLayoutEffect, useMemo, useRef } from 'react'
import { throttleTrailing } from './throttle'

export function useThrottledCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  interval = 200,
) {
  const fnRef = useRef(fn)
  useLayoutEffect(() => {
    fnRef.current = fn
  })

  return useMemo(
    () => throttleTrailing((...args: Args) => fnRef.current(...args), interval),
    [interval],
  )
}
```

### `useScrollY`

A small hook built on top of it.

```ts
export function useScrollY(interval = 100) {
  const [y, setY] = useState(0)
  const onScroll = useThrottledCallback(() => setY(window.scrollY), interval)

  useEffect(() => {
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return y
}

function BackToTop() {
  const y = useScrollY()
  if (y < 600) return null
  return <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button>
}
```

## With React Query

Debounce or throttle? With a search box you want the result for the _final_ text, so debounce. With a slider or a map you want the results to follow along _while_ the user drags, so throttle.

### Live results while dragging a slider

The slider moves smoothly on every change. The query fires at most every 300ms, so the results update while dragging without sending a request for every pixel.

```tsx
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useThrottledValue } from './useThrottledValue'

function PriceFilter() {
  const [maxPrice, setMaxPrice] = useState(500)
  const throttledMax = useThrottledValue(maxPrice, 300)

  const { data: products = [], isFetching } = useQuery({
    queryKey: ['products', { maxPrice: throttledMax }],
    queryFn: ({ signal }) =>
      fetch(`/api/products?maxPrice=${throttledMax}`, { signal }).then((r) => r.json()),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <label>
        Max price: £{maxPrice}
        <input
          type="range"
          min={0}
          max={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </label>
      <ProductGrid products={products} dimmed={isFetching} />
    </>
  )
}
```

The same pattern works for map bounds as the user pans (`queryKey: ['places', throttledBounds]`).

### Infinite scroll with `useInfiniteQuery`

Check the scroll position at most every 200ms and load the next page near the bottom. The `hasNextPage` / `isFetchingNextPage` guard stops duplicate requests.

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

type Page = { items: Post[]; nextCursor: string | null }

function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam, signal }): Promise<Page> => {
      const res = await fetch(`/api/feed?cursor=${pageParam ?? ''}`, { signal })
      return res.json()
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const onScroll = useThrottledCallback(() => {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800
    if (nearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, 200)

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return (
    <ul>
      {data?.pages.flatMap((page) => page.items).map((post) => <PostRow key={post.id} post={post} />)}
      {isFetchingNextPage && <li>Loading…</li>}
    </ul>
  )
}
```

An [`IntersectionObserver`](/notes/intersection-observer/) on a sentinel element at the end of the list does the same job without a scroll listener. Use the throttled version when you already have a scroll handler, or need the position for other things.

### Throttle refetches from rapid events

Some events fire in bursts: a websocket that pushes many "something changed" messages, or a real-time cursor. Throttle the invalidation so the list refetches at most once a second instead of once per message.

```tsx
function useLiveOrders() {
  const queryClient = useQueryClient()
  const invalidate = useThrottledCallback(
    () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    1000,
  )

  useEffect(() => {
    const ws = new WebSocket('wss://example.com/orders')
    ws.addEventListener('message', invalidate)
    return () => ws.close()
  }, [invalidate])

  return useQuery({ queryKey: ['orders'], queryFn: fetchOrders })
}
```
