---
title: Stimulus cheatsheet
tags:
  - javascript
date: 2026-07-20
---

Updated for Stimulus 3.x — the package moved to `@hotwired/stimulus` and the old `data-target`/Data APIs are gone.

- Website: https://stimulus.hotwired.dev/
- GitHub repo: https://github.com/hotwired/stimulus
- Handbook: https://stimulus.hotwired.dev/handbook/introduction
- Forum: https://discuss.hotwired.dev/

## Lifecycle callbacks

- `initialize`: once, when the controller is first instantiated
- `connect`: anytime the controller is connected to the DOM
- `disconnect`: anytime the controller is disconnected from the DOM

## Action descriptors

The data-action value `click->hello#greet` is called an action descriptor. This particular descriptor says:

- `click` is the event name
- `hello` is the controller identifier
- `greet` is the name of the method to invoke

### Common Events Have a Shorthand Action Notation

Stimulus defines click as the default event for actions on `<button>` elements, so `data-action="hello#greet"` is enough. The full list of defaults:

#### Element > Default event

- `a` > `click`
- `button` > `click`
- `details` > `toggle`
- `form` > `submit`
- `input` > `input`
- `input type=submit` > `click`
- `select` > `change`
- `textarea` > `input`

### Multiple Actions

If an element has multiple actions you can separate each one with a space `click->hello#greet click->hello#save`.

The element can even have multiple actions for multiple controllers `click->hello#greet click->history#save`.

## Targets

Targets are declared per-controller with `data-<identifier>-target`. So for a `hello` controller: `<input data-hello-target="name" />`. (The old `data-target="hello.name"` syntax was removed in v3.)

When Stimulus loads your controller class, it looks for target name strings in a static array called `targets`. For each target name in the array, Stimulus adds three new properties to your controller. Here, a `source` target name becomes:

- `this.sourceTarget` evaluates to the first source target in your controller's scope. If there is no source target, accessing the property throws an error.
- `this.sourceTargets` evaluates to an array of all source targets in the controller's scope.
- `this.hasSourceTarget` evaluates to true if there is a source target or false if not.

An element can be a target for multiple controllers — just add a target attribute for each: `data-hello-target="name" data-history-target="text"`.

## Values API

The old Data API (`this.data.get/set/has`) is gone; use Values instead. Declare typed values on the controller and Stimulus wires them to `data-<identifier>-<name>-value` attributes:

```js
export default class extends Controller {
  static values = { index: Number }

  next() {
    this.indexValue++ // reads/writes data-slideshow-index-value
  }
}
```

```html
<div data-controller="slideshow" data-slideshow-index-value="1"></div>
```

You get `this.indexValue`, `this.hasIndexValue`, and a `indexValueChanged(value, previousValue)` callback that fires on any change. Supported types: `String`, `Number`, `Boolean`, `Array`, `Object`.

## Classes and Outlets

- **Classes API**: `static classes = ['loading']` + `data-hello-loading-class="spinner"` in HTML gives you `this.loadingClass` / `this.hasLoadingClass` — keeps CSS class names out of your JS.
- **Outlets API**: `static outlets = ['result']` + `data-hello-result-outlet=".result"` gives you `this.resultOutlet(s)` — direct references to *other controllers'* instances, for cross-controller communication.

## Naming Conventions

| Component            | Convention             | Rationale                                                                                                     |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Controller filenames | snake_case.js          | Rails works that way                                                                                          |
| Identifiers          | kebab-case             | Sometimes used as part of HTML attribute names; analogous to CSS classes, which are conventionally kebab-case |
| Action names         | camelCase              | Map directly to JavaScript controller methods                                                                 |
| Target names         | camelCase              | Map directly to JavaScript controller properties                                                              |
| Data attributes      | camelCase + kebab-case | Thin wrapper around the HTMLElement.dataSet API; camelCase names in JS, kebab-case attributes in HTML         |

## HTML API

### Controller `data-controller`

e.g. `<div data-controller="hello">`

e.g. Multiple controllers on the same element: `<div data-controller="hello history">`

### Target `data-<identifier>-target`

e.g. `<input data-hello-target="name" />`

### Value `data-<identifier>-<name>-value`

e.g. `<div data-controller="slideshow" data-slideshow-index-value="1">`

### Action `data-action`

e.g. `<button data-action="click->hello#greet">Click me</button>`

e.g. Multiple actions on the same element: `<button data-action="click->hello#greet mouseover->hello#preload">Click me</button>`

## Code snippets

### Empty class

```js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = []
  static values = {}
  static classes = []

  initialize() {}

  connect() {}

  disconnect() {}
}
```

### HTML

Example HTML from the [Stimulus](https://stimulus.hotwired.dev/) home page

```html
<div data-controller="hello">
  <input data-hello-target="name" type="text" />

  <button data-action="click->hello#greet">Greet</button>

  <span data-hello-target="output"></span>
</div>
```
