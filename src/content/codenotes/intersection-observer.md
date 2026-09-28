---
title: IntersectionObserver
link: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
tags:
  - javascript
  - typescript
  - react
emoji: 🚸
date: 2026-09-28
---

`IntersectionObserver` tells you when an element enters or leaves the viewport (or another scrolling element). The browser does the work off the main thread, so it's much cheaper than a scroll listener that calls `getBoundingClientRect()`.

Use it to answer "is this on screen?": lazy loading, infinite scroll, reveal animations, analytics impressions, pausing off-screen video, scrollspy navs.

## Basic usage

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.target // the observed element
      entry.isIntersecting // true when it's (partly) on screen
      entry.intersectionRatio // how much is visible, 0–1
      entry.boundingClientRect // its position, measured for free
    }
  },
  {
    root: null, // null = the viewport, or pass a scrolling element
    rootMargin: '0px', // grow (+) or shrink (-) the root box, like CSS margin
    threshold: 0, // 0 = any pixel visible, 1 = fully visible, or an array
  },
)

observer.observe(element)

observer.unobserve(element) // stop watching one element
observer.disconnect() // stop watching everything
```

- The callback runs **once straight away** for each element you observe, with its current state. Don't treat the first call as "it just came into view".
- One observer can watch many elements. Create one and call `observe()` for each, instead of one observer per element.

### `rootMargin`

`rootMargin` moves the edges of the viewport before the check happens.

```js
// start loading 300px before the element scrolls into view
new IntersectionObserver(callback, { rootMargin: '300px 0px' })

// only count it inside a thin band across the middle of the viewport
new IntersectionObserver(callback, { rootMargin: '-45% 0px -50% 0px' })
```

### `threshold`

```js
// fire each time visibility crosses 0%, 25%, 50%, 75% and 100%
new IntersectionObserver(callback, { threshold: [0, 0.25, 0.5, 0.75, 1] })
```

## Examples

### Lazy load, once

Stop watching an element after it loads.

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.src = entry.target.dataset.src
      observer.unobserve(entry.target)
    }
  },
  { rootMargin: '300px 0px' },
)

document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img))
```

> For plain images and iframes you don't need this: use `<img loading="lazy">`. Reach for the observer for anything else (components, embeds, data).

### Reveal on scroll

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    }
  },
  { threshold: 0.2 },
)

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
```

```css
.reveal {
  opacity: 0;
  translate: 0 2rem;
  transition: opacity 0.6s, translate 0.6s;
}
.reveal.is-visible {
  opacity: 1;
  translate: 0 0;
}
```

CSS can now do this with no JavaScript, using scroll-driven animations (`animation-timeline: view()`). Check [browser support](https://caniuse.com/css-scroll-timeline) first.

### Infinite scroll

Watch an empty "sentinel" element at the end of the list. Load more when it comes near the viewport. No scroll listener and no [throttle](/notes/throttle/) needed.

```js
const sentinel = document.querySelector('#load-more')

const observer = new IntersectionObserver(
  async ([entry]) => {
    if (!entry.isIntersecting) return
    const hasMore = await loadNextPage()
    if (!hasMore) observer.disconnect()
  },
  { rootMargin: '800px 0px' },
)

observer.observe(sentinel)
```

### Pause videos that are off screen

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      entry.isIntersecting ? entry.target.play() : entry.target.pause()
    }
  },
  { threshold: 0.5 },
)

document.querySelectorAll('video[autoplay]').forEach((video) => observer.observe(video))
```

### Scrollspy: highlight the current section in a nav

The negative `rootMargin` shrinks the viewport to a thin band across its middle. The section inside that band is the current one.

```js
const links = new Map(
  [...document.querySelectorAll('nav a[href^="#"]')].map((a) => [a.hash.slice(1), a]),
)

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        links.forEach((a) => a.removeAttribute('aria-current'))
        links.get(entry.target.id)?.setAttribute('aria-current', 'true')
      }
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
)

document.querySelectorAll('section[id]').forEach((section) => observer.observe(section))
```

### Style a sticky header once it's stuck

`position: sticky` has no "stuck" state in CSS. Put a 1px sentinel at the very top of the page. When it leaves the viewport, the header is stuck.

```js
const header = document.querySelector('header')
const sentinel = document.querySelector('#top-sentinel')

new IntersectionObserver(([entry]) => {
  header.classList.toggle('is-stuck', !entry.isIntersecting)
}).observe(sentinel)
```

### Track impressions

Count an ad or product card as "seen" when half of it is visible, once.

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      analytics.track('impression', { id: entry.target.dataset.id })
      observer.unobserve(entry.target)
    }
  },
  { threshold: 0.5 },
)

document.querySelectorAll('[data-track-impression]').forEach((el) => observer.observe(el))
```

## With React

### `useInView` hook

```tsx
import { useEffect, useState } from 'react'

type Options = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView<T extends Element>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  once = false,
}: Options = {}) {
  // a callback ref (via useState) re-runs the effect if the element mounts later
  const [element, setElement] = useState<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (once && entry.isIntersecting) observer.disconnect()
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [element, root, rootMargin, threshold, once])

  return [setElement, inView] as const
}
```

Two traps this hook avoids:

- **Options object in the deps.** `useIntersectionObserver({ threshold: 0.5 })` makes a new object on every render. If the effect depends on it, the observer is torn down and rebuilt on every render. Depend on the single values instead. If you pass a `threshold` array, define it outside the component.
- **`useRef` + `useEffect([])`.** If the element renders later (after loading, or behind a condition), `ref.current` is `null` when the effect runs, and the element is never observed. Storing the element in state re-runs the effect when it appears.

### Usage

```tsx
function Section({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.2, once: true })

  return (
    <section ref={ref} className={inView ? 'reveal is-visible' : 'reveal'}>
      {children}
    </section>
  )
}
```

Render something heavy only when it gets close:

```tsx
function LazyMap() {
  const [ref, inView] = useInView<HTMLDivElement>({ rootMargin: '400px', once: true })

  return <div ref={ref} style={{ minHeight: 400 }}>{inView && <Map />}</div>
}
```

The `minHeight` matters: an empty 0px box can sit on screen and fire too early, and the content shifts the layout when it appears.

### Infinite scroll with React Query

```tsx
function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam, signal }) => fetchFeed(pageParam, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const [sentinelRef, nearEnd] = useInView<HTMLLIElement>({ rootMargin: '800px 0px' })

  useEffect(() => {
    if (nearEnd && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [nearEnd, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <ul>
      {data?.pages.flatMap((page) => page.items).map((post) => <PostRow key={post.id} post={post} />)}
      <li ref={sentinelRef}>{isFetchingNextPage ? 'Loading…' : null}</li>
    </ul>
  )
}
```

The effect also re-checks after each page loads. If the sentinel is still near the end (the page was short), it loads the next page at once. More in the [React Query](/notes/react-query/) note.

## Gotchas

- **Tall elements and `threshold: 1`.** An element taller than the viewport can never be 100% visible, so the callback never fires. Use a lower threshold.
- **`display: none` elements** never intersect. Hidden elements with `opacity: 0` or `visibility: hidden` do.
- **`root` must be an ancestor** of the observed element, and it must be the element that scrolls.
- **Clean up.** Call `disconnect()` when the component or page goes away. To tear it down with other listeners in one go, connect it to an [AbortController](/notes/abort-controller/): `signal.addEventListener('abort', () => observer.disconnect())`.
- **It isn't for scroll position.** It tells you _whether_ something is visible, not _how far_ the page has scrolled. For a scroll progress bar, use a [throttled](/notes/throttle/) scroll listener or `animation-timeline: scroll()`.

## References

- [MDN: Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [CSS-Tricks: Using IntersectionObserver](https://css-tricks.com/using-intersectionobserver-to-check-if-page-scrolled-past-certain-point/)
