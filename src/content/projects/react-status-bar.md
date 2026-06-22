---
title: React Status Bar
subtitle: A lightweight, portal-based status bar system for React.
date: 2026-06-22
repo: 'https://github.com/mrmartineau/react-status-bar'
link: 'https://react-status-bar.zander.wtf'
# showReadme: true
status: active
tech: CSS, TypeScript
tags:
  - css
  - typescript
  - react
---

This is a React component library for building a status bar — the kind you see in VS Code and other code editors: a horizontal bar, usually pinned to the bottom of the window, showing small bits of state and controls. The library gives you the same pattern for your own React apps.

Any component, anywhere in the tree, can push UI into a shared bar. A viewport aggregates the entries and renders them — inline, or portaled to a fixed shell node anywhere in the DOM. Each entry can hold any React node, and carries a priority that decides its order (lower wins, incident-style: P0 beats P1). The viewport owns presentation: show only the most important entry, or stack them all.

It leans on an external store and `useSyncExternalStore`, so pushing a status re-renders only the viewport reading that bar — never the component that produced it. Bars are scoped, so one provider can drive several independent status bars at once. It ships unstyled, is SSR-safe, and keeps a single always-mounted aria-live region so screen readers announce changes reliably.

```tsx
import { StatusBarProvider, StatusBarViewport, StatusBar } from "@mrmartineau/react-status-bar";

<StatusBarProvider>
  <StatusBarViewport mode="stack" separator="•" />

  {/* …anywhere deeper in the tree (lower priority = more important) … */}
  <StatusBar priority={1}>Preview mode</StatusBar>
  <StatusBar priority={2}>3 unresolved comments</StatusBar>
  <StatusBar priority={3}>Autosaving…</StatusBar>
</StatusBarProvider>
// → "Preview mode • 3 unresolved comments • Autosaving…"
```
