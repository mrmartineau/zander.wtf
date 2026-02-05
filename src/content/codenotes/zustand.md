---
title: Zustand
link: https://zustand.docs.pmnd.rs/
tags:
  - react
emoji: 🐻
date: 2026-02-04
---

## Create a store

Your store is a hook. State must be updated immutably and `set` merges state by default.

```ts
import { create } from "zustand";

interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
```

## Use in components

No providers needed. Select state and the component re-renders on changes.

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  return <h1>{bears} around here...</h1>;
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>one up</button>;
}
```

## Selecting multiple state slices

Use `useShallow` to prevent unnecessary rerenders when selecting multiple values.

```ts
import { useShallow } from "zustand/react/shallow";

// Object pick
const { nuts, honey } = useBearStore(
  useShallow((state) => ({ nuts: state.nuts, honey: state.honey })),
);

// Array pick
const [nuts, honey] = useBearStore(
  useShallow((state) => [state.nuts, state.honey]),
);
```

## Async actions

Just call `set` when ready. Zustand doesn't care if actions are async.

```ts
const useFishStore = create<FishState>()((set) => ({
  fishies: {},
  fetch: async (pond: string) => {
    const response = await fetch(pond);
    set({ fishies: await response.json() });
  },
}));
```

## Reading state in actions

Use `get` to access state outside of `set`.

```ts
const useSoundStore = create<SoundState>()((set, get) => ({
  sound: "grunt",
  action: () => {
    const sound = get().sound;
    // ...
  },
}));
```

## Access state outside components

```ts
// Get non-reactive fresh state
const paw = useDogStore.getState().paw;

// Update state
useDogStore.setState({ paw: false });

// Subscribe to all changes
const unsub = useDogStore.subscribe(console.log);
unsub(); // unsubscribe
```

## Overwriting state

The second argument to `set` replaces state instead of merging (default `false`).

```ts
const useFishStore = create<FishState>()((set) => ({
  salmon: 1,
  tuna: 2,
  deleteEverything: () => set({}, true), // clears entire store
}));
```

## Persist middleware

Persist store data to localStorage or other storage.

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useFishStore = create(
  persist(
    (set, get) => ({
      fishes: 0,
      addAFish: () => set({ fishes: get().fishes + 1 }),
    }),
    {
      name: "fish-storage", // unique name in storage
      storage: createJSONStorage(() => sessionStorage), // default: localStorage
    },
  ),
);
```

## Immer middleware

Use Immer for mutable state updates.

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useBeeStore = create(
  immer((set) => ({
    bees: 0,
    addBees: (by: number) =>
      set((state) => {
        state.bees += by;
      }),
  })),
);
```

## Redux DevTools

```ts
import { devtools } from "zustand/middleware";

const useBearStore = create(
  devtools(
    (set) => ({
      bears: 0,
      increase: (by: number) =>
        set(
          (state) => ({ bears: state.bears + by }),
          undefined,
          "bear/increase", // action name for devtools
        ),
    }),
    { name: "BearStore" },
  ),
);
```

## Combining middleware

```ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        increase: (by) => set((state) => ({ bears: state.bears + by })),
      }),
      { name: "bear-storage" },
    ),
  ),
);
```

## Subscribe with selector

Use `subscribeWithSelector` middleware to subscribe to specific state changes.

```ts
import { subscribeWithSelector } from "zustand/middleware";

const useDogStore = create(
  subscribeWithSelector(() => ({ paw: true, snout: true })),
);

// Subscribe to specific state changes
const unsub = useDogStore.subscribe(
  (state) => state.paw,
  (paw, previousPaw) => console.log(paw, previousPaw),
);
```

## Vanilla store (without React)

```ts
import { createStore } from "zustand/vanilla";

const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

const { getState, setState, subscribe } = store;
```

Use with React via `useStore`:

```ts
import { useStore } from "zustand";
import { vanillaStore } from "./vanillaStore";

const useBoundStore = (selector) => useStore(vanillaStore, selector);
```

## Transient updates

Subscribe without causing re-renders for performance-critical updates.

```tsx
const Component = () => {
  const scratchRef = useRef(useScratchStore.getState().scratches);

  useEffect(
    () =>
      useScratchStore.subscribe((state) => {
        scratchRef.current = state.scratches;
      }),
    [],
  );
  // ...
};
```

## Context for dependency injection

Use vanilla store with React context when you need providers.

```tsx
import { createContext, useContext } from 'react'
import { createStore, useStore } from 'zustand'

const store = createStore(...)
const StoreContext = createContext(store)

const App = () => (
  <StoreContext.Provider value={store}>
    <Component />
  </StoreContext.Provider>
)

const Component = () => {
  const store = useContext(StoreContext)
  const slice = useStore(store, (state) => state.value)
  // ...
}
```
