---
title: React Status Bar v1
date: 2026-06-22
---

Released [react-status-bar](https://github.com/mrmartineau/react-status-bar) v1.0.0 — a lightweight, portal-based **status bar system for React**. Any component can push UI into a shared bar with `<StatusBar>`, and a `<StatusBarViewport>` aggregates the entries and renders them, optionally portaled anywhere in the DOM.

It's built on an external store + `useSyncExternalStore`, so a status change re-renders *only* the viewport reading that scope — never the producer tree. Entries sort by priority, sides can be pinned (`align="start"` / `align="end"`), and `overflow="clip"` hides the least-important entries when they don't fit, VS Code-style. SSR-safe and screen-reader friendly too.

There's a [demo site](https://react-status-bar.zander.wtf/) if you want to poke at it.
