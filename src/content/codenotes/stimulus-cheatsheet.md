---
title: Stimulus cheatsheet
tags:
  - javascript
date: 2026-08-25
---

Complete reference for Stimulus 3.x. The package is `@hotwired/stimulus`; the old `data-target` and Data APIs were removed in v3.

Current release is **3.2.2** (August 2023). The project is in low-activity maintenance rather than active development, so 3.2.2 is what you'll be using.

- Website: https://stimulus.hotwired.dev/
- GitHub repo: https://github.com/hotwired/stimulus
- Handbook: https://stimulus.hotwired.dev/handbook/introduction
- Forum: https://discuss.hotwired.dev/

## Setup

```js
import { Application } from '@hotwired/stimulus'
import ClipboardController from './controllers/clipboard_controller'

const application = Application.start()
application.register('clipboard', ClipboardController)

application.debug = true                      // log every lifecycle event
application.handleError = (error, message, detail) => {
  Sentry.captureException(error, { extra: { message, detail } })
}
```

`Application.start(element?, schema?)` defaults to `document.documentElement` and waits for `DOMContentLoaded` if the document is still loading.

Controllers are discovered with a `MutationObserver`, so HTML injected after page load wires itself up with no re-initialisation. Callbacks fire in the next microtask, not synchronously.

Other application methods: `register()`, `load()`, `unload()`, `stop()`, `controllers`, `getControllerForElementAndIdentifier()`, `registerActionOption()`.

Per-controller registration hooks:

```js
export default class extends Controller {
  static shouldLoad = !!window.matchMedia('(pointer: fine)').matches  // skip registration
  static afterLoad(identifier, application) { /* runs once on registration */ }
}
```

## Empty controller

```js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = []
  static values = {}
  static classes = []
  static outlets = []

  initialize() {}
  connect() {}
  disconnect() {}
}
```

## Lifecycle callbacks

There are eight, and no single page of the official docs lists them together.

| Callback | Arguments | Fires |
| --- | --- | --- |
| `initialize()` | — | once per controller instance, ever |
| `[name]ValueChanged(value, previous)` | decoded value, decoded previous | on connect, and on every later change |
| `[name]TargetConnected(element)` | `Element` | a target enters the DOM |
| `[name]OutletConnected(outlet, element)` | `Controller`, `Element` | an outlet enters the DOM |
| `connect()` | — | the controller connects |
| `disconnect()` | — | the controller disconnects |
| `[name]OutletDisconnected(outlet, element)` | `Controller`, `Element` | an outlet leaves |
| `[name]TargetDisconnected(element)` | `Element` | a target leaves |

### Order

The sequence is asymmetric, which matters more than it sounds.

**Connecting:** `initialize` → `[name]ValueChanged` → `[name]TargetConnected` → `[name]OutletConnected` → `connect`

**Disconnecting:** `disconnect` → `[name]OutletDisconnected` → `[name]TargetDisconnected`

Target and outlet callbacks run *before* `connect()` but *after* `disconnect()`. So when `disconnect()` runs, your targets are all still tracked, which is exactly when you want to detach things from them.

### `connect()` runs more than once

If an element is detached and re-attached, Stimulus reuses the existing controller instance and calls `connect()` again without re-running `initialize()`. Two `connect()` calls are always separated by one `disconnect()`.

Put one-time setup in `initialize()`, and make everything in `connect()` idempotent. Turbo 8 morphing makes re-connection routine rather than rare.

## HTML API

| Purpose | Attribute | Example |
| --- | --- | --- |
| Controller | `data-controller` | `<div data-controller="hello history">` |
| Target | `data-[identifier]-target` | `<input data-hello-target="name">` |
| Value | `data-[identifier]-[name]-value` | `<div data-slideshow-index-value="1">` |
| Class | `data-[identifier]-[name]-class` | `<div data-hello-loading-class="spinner">` |
| Outlet | `data-[identifier]-[name]-outlet` | `<div data-chat-status-outlet=".online">` |
| Action | `data-action` | `<button data-action="click->hello#greet">` |
| Action param | `data-[identifier]-[name]-param` | `<button data-vote-id-param="42">` |

`data-controller` takes a space-separated list, so one element can host several controllers, and one controller can be instantiated many times on a page.

## Targets

```js
static targets = ['source', 'output']
```

```html
<input data-hello-target="source">
```

Each name in the array gives you three properties:

- `this.sourceTarget` — the first matching target. **Throws** if there isn't one.
- `this.sourceTargets` — an array of all of them, empty if none.
- `this.hasSourceTarget` — boolean, for guarding optional targets.

The attribute value is a space-separated list, so one element can be several targets at once, for one controller or for many:

```html
<input data-hello-target="name email" data-history-target="text">
```

A target must be a descendant of the controller element, and must not sit inside a nested scope of the same identifier.

## Values

```js
static values = {
  url: String,
  index: Number,
  enabled: Boolean,
  refreshInterval: { type: Number, default: 5000 },
}
```

```html
<div data-controller="slideshow" data-slideshow-index-value="1"></div>
```

camelCase in JavaScript, kebab-case in HTML: `refreshInterval` becomes `data-slideshow-refresh-interval-value`.

Each value gives you:

- `this.indexValue` — a getter **and setter**. Assigning writes the attribute back to the DOM; assigning `undefined` removes it.
- `this.hasIndexValue` — boolean.
- `indexValueChanged(value, previousValue)` — a change callback.

### Types and their unset defaults

| Type | Default when the attribute is absent |
| --- | --- |
| `Array` | `[]` |
| `Boolean` | `false` |
| `Number` | `0` |
| `Object` | `{}` |
| `String` | `""` |

### The change callback fires before `connect()`

`[name]ValueChanged` runs on the initial connection as well as on every change, and it runs *before* `connect()`. Code in a change callback cannot assume `connect()` has set anything up.

You can tell the first fire from later ones by `previousValue`: it's `undefined` when the attribute was absent, and the type default (`""`, `0`, `false`) when the attribute was present.

### Decoding quirks

**Boolean is barely boolean.** The implementation is `!(value == "0" || value.toLowerCase() == "false")`. Only `"0"` and `"false"` are falsy, so `data-x-enabled-value="no"` is `true`, and so is `"off"`, `""`… anything else.

**Number strips underscores**, so `"10_000"` parses fine.

**Array and Object use `JSON.parse`** and throw a `TypeError` on the wrong shape.

**`hasXValue` isn't quite what the docs say.** They describe it as true when the attribute is present. It's actually true when the attribute is present *or* you declared a custom default.

A `default` whose type doesn't match the declared `type` throws at registration time.

## Classes

Keeps CSS class names out of your JavaScript, so restyling doesn't mean touching code.

```js
static classes = ['loading', 'success']
```

```html
<div data-controller="hello" data-hello-loading-class="spinner is-busy">
```

- `this.loadingClass` — the raw attribute string. **Throws** if the attribute is missing.
- `this.loadingClasses` — split on spaces, for `element.classList.add(...this.loadingClasses)`.
- `this.hasLoadingClass` — boolean.

## Outlets

References to *other controllers*, added in Stimulus 3.2.

```js
static outlets = ['status']
```

```html
<div data-controller="chat" data-chat-status-outlet=".user-status"></div>
<div class="user-status" data-controller="status"></div>
```

| Property | Gives you |
| --- | --- |
| `this.statusOutlet` | the first matching **controller instance**; throws if none |
| `this.statusOutlets` | an array of controller instances |
| `this.statusOutletElement` | the first matching **element**; throws if none |
| `this.statusOutletElements` | an array of elements |
| `this.hasStatusOutlet` | boolean |

Two constraints that produce confusing errors when broken:

1. The outlet name must equal the target controller's **identifier**.
2. The matched element must actually carry `data-controller="status"`, or Stimulus throws.

Unlike targets, outlets can be anywhere on the page, not just inside the controller's scope. Namespaced identifiers collapse to camelCase: outlet `admin--user-status` becomes `this.adminUserStatusOutlets`.

Note the callback argument order is controller first, element second, which is the reverse of the target callbacks.

## Actions

### Descriptor grammar

```
[keyModifier+]event[.keyFilter][@window|@document]->identifier#method[:option…]
```

`data-action="click->hello#greet"` reads as: on `click`, call the `greet` method of the `hello` controller.

### Default events

Omit the event entirely on these elements:

| Element | Event |
| --- | --- |
| `a` | `click` |
| `button` | `click` |
| `input type="submit"` | `click` |
| `details` | `toggle` |
| `form` | `submit` |
| `input` | `input` |
| `select` | `change` |
| `textarea` | `input` |

So `data-action="hello#greet"` is enough on a `<button>`. Any other element without an explicit event throws `missing event name`.

### Multiple actions

Space-separate them. They run left to right.

```html
<button data-action="click->hello#greet click->history#save">Click me</button>
```

Stop the chain with `event.stopImmediatePropagation()`.

### Options

Chain with colons. A `!` prefix negates any option.

| Option | Effect |
| --- | --- |
| `:once` | listener runs once |
| `:capture` | listen in the capture phase |
| `:passive` | `{ passive: true }` |
| `:!passive` | `{ passive: false }` |
| `:stop` | `event.stopPropagation()` before invoking |
| `:prevent` | `event.preventDefault()` before invoking |
| `:self` | only invoke if `event.target` is this element |

```html
<form data-action="submit->form#save:once:prevent">
```

Register your own with `application.registerActionOption(name, ({ event, element, value }) => boolean)`. Returning `false` blocks the invocation.

### Keyboard filters

```html
<input data-action="keydown.enter->search#submit keydown.esc->search#clear">
<div data-action="keydown.ctrl+a->listbox#selectAll">
```

Mapped names: `enter`, `tab`, `esc`, `space`, `up`, `down`, `left`, `right`, `home`, `end`, `page_up`, `page_down`, plus `a`–`z` and `0`–`9`.

Modifiers: `alt` (option on macOS), `ctrl`, `meta` (command), `shift`.

Two things the docs don't mention:

- **Modifiers are matched exactly.** `keydown.enter` will *not* fire if shift is held, because the filter requires every unlisted modifier to be false.
- **The `.filter` suffix only means "key filter" for `keydown`, `keyup` and `keypress`.** On any other event the dot is folded back into the event name, so `custom.thing->x#y` listens for an event literally called `custom.thing`.

Mouse modifiers use the prefix form instead: `shift+click->x#y`.

Unknown filter names throw. Add your own via a custom `keyMappings` schema passed to `Application.start()`.

### Global events

Only `@window` and `@document` exist, and the list isn't extensible.

```html
<div data-action="resize@window->layout#reflow scroll@window->nav#pin">
```

### Action parameters

```html
<button data-action="click->vote#upvote"
        data-vote-id-param="42"
        data-vote-url-param="/votes">Upvote</button>
```

```js
upvote({ params: { id, url } }) {
  // id is the Number 42, url is the String "/votes"
}
```

Parameters must sit on the **same element as the action**. Values are typecast with `JSON.parse`, falling back to a string. They're scoped per identifier, so two controllers on one element each see only their own.

## Cross-controller communication

```js
this.dispatch('completed', { detail: { id: 42 } })
// fires "hello:completed" on this.element, bubbling
```

```html
<div data-action="hello:completed->toast#show">
```

`dispatch()` prefixes the event name with the controller identifier and bubbles by default. Options: `target`, `detail`, `prefix`, `bubbles`, `cancelable`.

For direct method calls rather than events, use outlets.

## Naming conventions

| Component | Convention | Rationale |
| --- | --- | --- |
| Controller filenames | `snake_case.js` | Rails works that way |
| Identifiers | `kebab-case` | used in HTML attribute names, like CSS classes |
| Action names | `camelCase` | map directly to controller methods |
| Target names | `camelCase` | map directly to controller properties |
| Value names | `camelCase` in JS, `kebab-case` in HTML | thin wrapper over `HTMLElement.dataset` |

Identifiers are derived from the filename:

- `clipboard_controller.js` → `clipboard`
- `date_picker_controller.js` → `date-picker`
- `local-time-controller.js` → `local-time`
- `users/list_item_controller.js` → `users--list-item`

Underscores and dashes are interchangeable in filenames; a directory separator becomes `--`.

## Gotchas

**Errors are swallowed.** Every call into your code is wrapped in try/catch, logged, and forwarded to `window.onerror`. A controller whose `connect()` throws doesn't break the page, it just silently does nothing. Set `application.handleError` on any real project.

**Clean up in `disconnect()`.** Stimulus removes only the listeners it installed through `data-action`. Timers, manual `addEventListener` calls, `IntersectionObserver`s, `AbortController`s and third-party widgets are all yours to tear down.

```js
connect() { this.timer = setInterval(() => this.refresh(), 5000) }
disconnect() { clearInterval(this.timer) }
```

**Turbo page changes destroy controllers.** Turbo caches pages with `cloneNode(true)`, which discards event listeners and attached data, so a restored page gets fresh controller instances rather than resumed ones. Reset transient UI in `turbo:before-cache`, and use `id` plus `data-turbo-permanent` to persist an element and its controller across navigations.

**Everything is microtask-deferred.** Remove an element and immediately assert that `disconnect()` ran, and it won't have yet.

**There's a memory leak in 3.2.2.** When an element carrying `data-action` is removed while its controller element survives, Stimulus's internal dispatcher keeps a strong `Map` entry keyed by that detached element, retaining it for the lifetime of the application. This is exactly the shape of Turbo 8 morphing and stream-driven list updates.

The fix (PR #877) was merged in June 2026 but **is not in any release yet**. Its own measurement, on a page morph-refreshing about 70 rows, found 272 retained detached buttons and 5.4 MB of retained heap over 40 re-renders, dropping to zero afterwards. If you're on Turbo morphing with long-lived pages, take a heap snapshot rather than assuming you're fine.

## Full example

```html
<div data-controller="clipboard"
     data-clipboard-supported-value="true"
     data-clipboard-copied-class="is-copied">
  <input data-clipboard-target="source" type="text" value="hello" readonly>
  <button data-action="clipboard#copy" data-clipboard-label-param="Copied!">
    Copy
  </button>
  <span data-clipboard-target="feedback" role="status" aria-live="polite"></span>
</div>
```

```js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['source', 'feedback']
  static classes = ['copied']
  static values = { supported: Boolean, resetAfter: { type: Number, default: 2000 } }

  connect() {
    this.element.hidden = !this.supportedValue
  }

  disconnect() {
    clearTimeout(this.resetTimer)
  }

  async copy({ params: { label } }) {
    await navigator.clipboard.writeText(this.sourceTarget.value)
    this.element.classList.add(this.copiedClass)
    this.feedbackTarget.textContent = label

    clearTimeout(this.resetTimer)
    this.resetTimer = setTimeout(() => this.reset(), this.resetAfterValue)
  }

  reset() {
    this.element.classList.remove(this.copiedClass)
    this.feedbackTarget.textContent = ''
  }
}
```
