---
title: Testing library
tags:
  - testing
  - react
  - cypress
emoji: 🧪
link: https://testing-library.com
date: git Last Modified
---

Testing Library finds elements the way a user does: by role, label and text. It works with any runner. See [Vitest](/notes/vitest/) and [Jest](/notes/jest/) for the runner setup. [Playwright](/notes/playwright/) uses the same idea for its locators.

## Types of queries ([docs](https://testing-library.com/docs/queries/about/#types-of-queries))

### Single elements

- `getBy...`: Returns the matching node for a query, and throw a descriptive error if no elements match or if more than one match is found (use `getAllBy` instead if more than one element is expected).
- `queryBy...`: Returns the matching node for a query, and return `null` if no elements match. This is useful for asserting an element that is not present. Throws an error if more than one match is found (use `queryAllBy` instead if this is OK).
- `findBy...`: Returns a Promise which resolves when an element is found which matches the given query. The promise is rejected if no element is found or if more than one element is found after a default timeout of 1000ms. If you need to find more than one element, use `findAllBy`.

### Multiple elements

- `getAllBy...`: Returns an array of all matching nodes for a query, and throws an error if no elements match.
- `queryAllBy...`: Returns an array of all matching nodes for a query, and return an empty array ([]) if no elements match.
- `findAllBy...`: Returns a promise which resolves to an array of elements when any elements are found which match the given query. The promise is rejected if no elements are found after a default timeout of 1000ms.

`findBy` methods are a combination of `getBy*` queries and [`waitFor`](https://testing-library.com/docs/dom-testing-library/api-async#waitfor). They accept the `waitFor` options as the last argument (i.e. `await screen.findByText('text', queryOptions, waitForOptions)`).

## Which query to use ([docs](https://testing-library.com/docs/queries/about/#priority))

Pick the first one that works:

1. Everyone can use it: `ByRole`, `ByLabelText`, `ByPlaceholderText`, `ByText`, `ByDisplayValue`
2. Semantic: `ByAltText`, `ByTitle`
3. Last resort: `ByTestId`

### `ByRole` options ([docs](https://testing-library.com/docs/queries/byrole))

```tsx
screen.getByRole('button', { name: /save/i })
screen.getByRole('heading', { level: 2 })
screen.getByRole('checkbox', { checked: true })
screen.getByRole('button', { pressed: true })
screen.getByRole('tab', { selected: true })
screen.getByRole('button', { expanded: false })
screen.getByRole('alertdialog', { description: /delete/i })
screen.getByRole('button', { hidden: true }) // include elements hidden from the accessibility tree
```

`ByRole` can be slow on a big DOM, because it works out the accessibility tree. `hidden: true` skips the visibility checks and speeds it up. `ByLabelText` and `ByText` are faster still but less strict.

### Scope a query with `within`

```tsx
import { screen, within } from '@testing-library/react'

const dialog = screen.getByRole('dialog')
await user.click(within(dialog).getByRole('button', { name: /confirm/i }))
```

## Waiting

```tsx
// element appears
await screen.findByText('Saved')

// something else changes: the callback must throw to retry
await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))

// element goes away
await waitForElementToBeRemoved(() => screen.queryByText('Loading…'))

// element is not there
expect(screen.queryByText('Error')).not.toBeInTheDocument()
```

- `waitFor` defaults: `timeout` 1000ms, `interval` 50ms. It also reruns when the DOM changes.
- `waitForElementToBeRemoved` throws if the element is already gone when you call it. Make sure the element has appeared first.

## Common `userEvent` actions ([docs](https://testing-library.com/docs/user-event/intro))

```tsx
const user = userEvent.setup()

await user.click(element)
await user.dblClick(element)
await user.tripleClick(element)
await user.type(input, 'Hello World')
await user.clear(input)
await user.selectOptions(select, ['option1', 'option2'])
await user.deselectOptions(select, 'option1')
await user.keyboard('{Enter}')
await user.tab()
await user.tab({ shift: true })
await user.hover(element)
await user.unhover(element)
await user.upload(fileInput, new File(['hi'], 'hi.png', { type: 'image/png' }))
await user.paste('pasted text')
```

Call `userEvent.setup()` inside the test, before `render`. Do not call it in `beforeEach`.

### Fake timers

`userEvent` waits on `setTimeout` between actions, so a test with fake timers hangs. Tell it how to move time on:

```tsx
// Vitest
const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

// Jest
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
```

Do not use `delay: null` for this.

## [jest-dom](https://github.com/testing-library/jest-dom)

Adds DOM matchers to `expect`.

```sh
npm install --save-dev @testing-library/jest-dom
```

Import it once in a setup file:

```ts
// Vitest: list the file in `setupFiles`
import '@testing-library/jest-dom/vitest'

// Jest: list the file in `setupFilesAfterEnv`
import '@testing-library/jest-dom'

// Jest with `@jest/globals` and `injectGlobals: false`
import '@testing-library/jest-dom/jest-globals'
```

```tsx
expect(el).toBeInTheDocument()
expect(el).toBeVisible()
expect(el).toBeDisabled() // and .toBeEnabled()
expect(el).toBeChecked()
expect(el).toHaveFocus()
expect(el).toHaveTextContent('hello')
expect(el).toHaveValue('abc')
expect(el).toHaveAttribute('href', '/about')
expect(el).toHaveClass('active')
expect(el).toHaveAccessibleName('Save')
expect(el).toHaveAccessibleDescription('Saves the form')
```

Some matchers are deprecated. Use `toBeInTheDocument` (not `toBeInTheDOM`), `toBeEmptyDOMElement` (not `toBeEmpty`), `toHaveAccessibleDescription` (not `toHaveDescription`) and `toHaveAccessibleErrorMessage` (not `toHaveErrorMessage`).

## Debugging

```tsx
screen.debug() // print the DOM
screen.debug(screen.getByRole('dialog')) // print one element
screen.logTestingPlaygroundURL() // open the DOM in testing-playground.com

import { logRoles } from '@testing-library/react'
logRoles(container) // list every role and element
```

When a query fails, the error already lists the roles it could find.

## Frameworks

### [React](https://testing-library.com/docs/react-testing-library/intro)

`@testing-library/dom` is a peer dependency, so install it too.

```sh
npm install --save-dev @testing-library/react @testing-library/dom
# with TypeScript
npm install --save-dev @types/react @types/react-dom
```

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Fetch from './fetch'

test('loads and displays greeting', async () => {
  // Setup userEvent instance (recommended over calling methods directly)
  const user = userEvent.setup()

  // ARRANGE
  render(<Fetch url="/greeting" />)

  // ACT
  await user.click(screen.getByText('Load Greeting'))
  await screen.findByRole('heading')

  // ASSERT
  expect(screen.getByRole('heading')).toHaveTextContent('hello there')
  expect(screen.getByRole('button')).toBeDisabled()
})
```

#### `render` ([docs](https://testing-library.com/docs/react-testing-library/api))

Wrap `render` once to add the providers every test needs:

```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers })
}
```

- `rerender(ui)`: render the same component again with new props
- `unmount()`: unmount the component
- `asFragment()`: snapshot of the DOM, to compare before and after an event
- `container`: the root `div`. Use queries instead of `container.querySelector`.
- `reactStrictMode: true`: wrap the UI in `StrictMode`. Set it for all tests with `configure({ reactStrictMode: true })`.
- `legacyRoot`: React 17 style render. Only works on React 18 and earlier.

Cleanup runs by itself after each test, but only if your runner has a global `afterEach`. Without one (Vitest with `globals: false`), call `cleanup()` yourself.

#### `renderHook`

```tsx
import { act, renderHook } from '@testing-library/react'

const { result, rerender } = renderHook(({ start }) => useCounter(start), {
  initialProps: { start: 0 },
})

act(() => result.current.increment())
expect(result.current.count).toBe(1)

rerender({ start: 10 })
```

`renderHook` is built into `@testing-library/react` from v13.1. The separate [`@testing-library/react-hooks`](https://github.com/testing-library/react-hooks-testing-library) package only supports React 17 and earlier. If you can, test the hook through a component with `render`, as it reads better.

### [Cypress](https://testing-library.com/docs/cypress-testing-library/intro)

#### Install

```sh
npm install --save-dev cypress @testing-library/cypress
```

Add this line to your project's cypress/support/commands.js:

```ts
import '@testing-library/cypress/add-commands'
```

For TypeScript, add `"cypress"` and `"@testing-library/cypress"` to `compilerOptions.types` in `tsconfig.json`.

Only the `find*` and `findAll*` queries exist, because they retry, and Cypress needs that. There are no `get*` queries. `query*` queries are no longer needed, and a later major version removes them.

```js
cy.findByRole('button', { name: /Jackie Chan/i }).click()
cy.findByRole('button', { name: /Button Text/i }).should('exist')
cy.findByRole('button', { name: /Non-existing Button Text/i }).should('not.exist')
cy.findByLabelText(/Label text/i, { timeout: 7000 }).should('exist')

// findByRole _inside_ a form element
cy.get('form').findByRole('button', { name: /Button Text/i }).should('exist')
cy.get('form').then((subject) => {
  cy.findByRole('button', { name: /Button Text/i, container: subject }).should('exist')
})

// scope with within
cy.findByRole('dialog').within(() => {
  cy.findByRole('button', { name: /confirm/i }).click()
})
```
