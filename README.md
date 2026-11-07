# expense-tracker-e2e

Playwright (TypeScript) end-to-end tests for the expense tracker: 75 tests, 42 API and 33 UI.
Unit tests (Vitest) live in the app repo, not here.

## Setup
    npm install
    npx playwright install chromium

## Pick an environment
Each `.env.<env>` file holds that environment's `BASE_URL`
(development, uat, qa, prod). Use `TEST_ENV` to choose; default is development.

## Run
| Command | What it runs |
|---|---|
| `npm test` | everything on development |
| `npm run test:smoke` | smoke tests only (quick check after deploy) |
| `npm run test:regression` | regression tests |
| `npm run test:api` / `npm run test:ui` | API tests / browser tests |
| `npm run test:qa` | everything on qa (also `:uat`, `:development`) |
| `npm run test:prod:smoke` | smoke tests on prod |
| `npm run report` | open the HTML report |

PowerShell example for a feature: `npx playwright test --grep @summary`

## Tags
- Type: `@smoke` (fast checks), `@regression` (full)
- Layer: `@api`, `@browser`
- Feature: `@add @edit @delete @filter @search @sort @summary @validation @health`
- Release: `@v2`, `@v3` (new in that release)

Set `APP_RELEASE` (1, 2 or 3) to the release deployed on that environment.
Tests for newer releases are skipped automatically.

## Test data
Tests create their own uniquely named data and delete it afterwards.
Tests that need an empty database empty it first, and are skipped on prod.

## Vercel Deployment Protection
Preview URLs may be protected. Create a "Protection Bypass for Automation" secret in the
Vercel project and set it as `VERCEL_BYPASS_SECRET` (GitHub secret in CI,
environment variable locally). Never commit it.

## CI
`.github/workflows/e2e.yml` runs manually (workflow_dispatch) or after a deployment
(repository_dispatch event `deployment-finished`).
