---
title: Playwright
tags:
  - javascript
  - testing
emoji: 🎭
link: https://playwright.dev/
date: 2026-07-21
---

My go-to for E2E testing. Cross-browser (Chromium, Firefox, WebKit), auto-waiting built in, and the tooling (`--ui` mode, codegen, trace viewer) is genuinely excellent.

## Setup

```sh
npm init playwright@latest
# or add to an existing project
npm install -D @playwright/test
npx playwright install
```

Useful commands:

```sh
npx playwright test                  # run everything, headless
npx playwright test --ui             # interactive UI mode — use this while writing tests
npx playwright test --headed         # watch the browser
npx playwright test --project=chromium
npx playwright test example.spec.ts  # single file
npx playwright test -g "search"      # tests matching title
npx playwright codegen zander.wtf    # record actions, generate test code
npx playwright show-report
```

## Config boilerplate

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // fail CI if test.only left in
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry', // capture trace when retrying
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 15'] } },
  ],
  // start the dev server before tests, reuse if already running
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
})
```

The `webServer` block is the bit I always forget — Playwright starts (and kills) your dev server for you.

## A basic test

```ts
import { expect, test } from '@playwright/test'

test.describe('search', () => {
  test('finds notes from the search page', async ({ page }) => {
    await page.goto('/search')

    await page.getByRole('searchbox').fill('playwright')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('listitem')).not.toHaveCount(0)
    await expect(page).toHaveURL(/q=playwright/)
  })
})
```

No manual waits anywhere — `expect` retries until it passes or times out (web-first assertions), and actions auto-wait for elements to be actionable.

## Locators

Prefer user-facing locators (role, label, text) over CSS/test-ids — they double as accessibility checks:

```ts
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1 })
page.getByLabel('Email')
page.getByPlaceholder('Search…')
page.getByText('No results')
page.getByTestId('nav-menu') // escape hatch — data-testid

// chaining and filtering
page.getByRole('listitem').filter({ hasText: 'CSS' })
page.getByRole('list').getByRole('link').first()
```

## Common assertions

```ts
await expect(page).toHaveTitle(/Zander/)
await expect(page).toHaveURL('/notes')
await expect(locator).toBeVisible()
await expect(locator).toHaveText('exact match')
await expect(locator).toContainText('partial')
await expect(locator).toHaveCount(5)
await expect(locator).toHaveAttribute('href', '/search')
await expect(locator).toBeChecked()
await expect(locator).toBeDisabled()
```

## Hooks and fixtures

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('nav works', async ({ page }) => {
  // page already on /
})
```

## Auth once, reuse everywhere

Log in a single time in a setup project, save the browser state, reuse it in every test:

```ts
// auth.setup.ts
import { test as setup } from '@playwright/test'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL)
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')
  await page.context().storageState({ path: '.auth/user.json' })
})
```

```ts
// playwright.config.ts projects
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    dependencies: ['setup'],
  },
]
```

## Mocking network requests

```ts
test('shows empty state', async ({ page }) => {
  await page.route('**/api/search**', (route) =>
    route.fulfill({ json: { results: [] } }),
  )

  await page.goto('/search?q=anything')
  await expect(page.getByText('No results')).toBeVisible()
})
```

`page.route` intercepts anything matching the glob — fulfil with a mock, `route.abort()` to simulate failure, or `route.continue()` with tweaks.

## Debugging

- `npx playwright test --debug` — steps through with the inspector
- `await page.pause()` — drop a breakpoint into a test
- Traces are the killer feature: `trace: 'on-first-retry'` in config, then `npx playwright show-trace trace.zip` gives you a full DOM snapshot timeline of the failure. CI failures stop being guesswork.

## CI

```yaml
# .github/workflows/e2e.yml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- run: npm ci
- run: npx playwright install --with-deps
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
```
