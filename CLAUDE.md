# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

The project uses **Bun** (pinned in `.tool-versions` / `packageManager`) as the package manager and script runner only — do not use npm or yarn, or commit a `package-lock.json` / `yarn.lock`. Tools still run on Node (`bun run` honors their `#!/usr/bin/env node` shebangs). Always use `bun run test`, never `bun test`: `bun test` starts Bun's built-in test runner instead of Vitest.

```bash
bun install               # install deps from bun.lock
bun run start             # dev server on localhost:3000
bun run build             # tsc + vite build → build/
bun run lint              # eslint + tsc type-check
bun run check-types       # tsc --noemit only
bun run format:write      # prettier auto-fix
bun run test              # vitest run (unit tests) — NOT `bun test`
bun run test:watch        # vitest in watch mode
bun run test:e2e          # playwright e2e tests (starts vite on :3100)
bun run test:e2e:ui       # playwright UI mode
```

Unit tests use Vitest (`vitest.config.ts`, node environment) and live next to the code as `src/**/*.test.ts`. Import the module under test directly (e.g. `./expense.util`) rather than via `@utils`, so the barrel does not pull in browser-only code.

E2E tests use Playwright (`playwright.config.ts`, Pixel 7 Chromium) and live in `e2e/*.spec.ts`; shared steps are in `e2e/helpers.ts`. Import `test` and `expect` from `./fixtures`, not `@playwright/test`. The fixtures stub GitHub (`githubTags`) and the receipt backend (`receiptApi`, at `http://mcp.test`), and block every other external host, so no test reaches the network. The config starts two Vite servers with GA disabled. Port 3100 has no Turnstile site key (project `mobile-chrome`). Port 3101 has one (project `turnstile`), and only `turnstile.spec.ts` runs there, against a fake Cloudflare script. On a new machine, run `bunx playwright install chromium` once.

Commits must follow [Conventional Commits](https://www.conventionalcommits.org/) — enforced by commitlint via husky.

## Architecture

Bill Please is a mobile-first PWA (max-width 420px) that splits restaurant bills among a group. All state is client-side; there is no backend.

### Data flow

The app has three pages connected by a linear flow:

1. **`/` (Home)** — User enters a bill title, adds items (`IBillItem`) and payers (`IPayer`) via tabbed tables. `CurrencySettings` here sets the base currency and exchange rates.
2. **`/mapping` (BillItemMapping)** — User assigns which payers split each item (`IBillItemMapping`).
3. **`/result` (Result)** — Computes per-payer expenses and shows totals, breakdown, and payment options. A display-currency `Select` appears when exchange rates exist.

Routes are defined in `src/config/routes.tsx`; unknown paths redirect to `/`.

### State management

Redux Toolkit + `redux-persist` (key `bp-store`, localStorage). Two slices:

- **`bill`** — title, items (`IBillItem[]`), payers (`IPayer[]`), itemMapping (`IBillItemMapping[]`). Payers support a `friend` array (sub-payers); removing a payer also cleans their friends from `itemMapping`.
- **`app`** — vatPercentage (default 7%), mainCurrency, displayCurrency, exchangeRates (`ICurrencyExchangeRate[]`). Setting `mainCurrency` resets displayCurrency and clears exchange rates.

`RootState` and `AppDispatch` are exported from `@config`.

### Currency / exchange rates

`mainCurrency` is the bill's base currency. Users add exchange rates (1 main = N target, `ICurrencyExchangeRate`) via `CurrencySettings` on Home. All amounts are computed and stored in `mainCurrency`. On the Result page a `conversionRate` multiplier is derived from the selected `displayCurrency` (1 when it equals `mainCurrency`) and, with a `currencySymbol`, is threaded down as props through `ExpenseList` → `ExpenseItemList`, which format display values via a local `fmt` helper (`symbol + currencyFormat(amount * conversionRate)`). Supported currencies are the fixed `CURRENCIES` array in `@enums/currency.ts`; use `getCurrencySymbol(code)` for the symbol.

### Expense calculation

`calculateExpenses` (`@utils/expense.util.ts`, rendered by `ExpenseList` on the Result page) computes each payer's share by iterating `billPayers`, finding all `IBillItemMapping` entries where that payer (or their friends) are listed, then proportionally splitting item cost (price × quantity), service, and VAT across the assigned payers.

### Receipt import ("Add from bill")

`ItemTable` opens a hidden `<input type="file" accept="image/*">` and sends the photo to the sibling backend **bill-please-mcp** (`../bill-please-mcp`, Bun + Elysia, also an MCP server) via `scanReceipt` in `@utils/receipt.util.ts`: resized to ≤1600px JPEG, `POST {VITE_APP_BILL_PLEASE_MCP_URL}/api/receipts/scan`. The button is disabled unless `GET /health` succeeds (TanStack Query, 60 s refetch). The response (`IReceiptScanResult`, per-item `servicePercentage` / `vatPercentage`) is sanitized by `normalizeReceiptItems`, converted by `receiptItemToBillItem` (`@utils/bill.util.ts`, shares `calculateService` / `calculateVat` with `ItemListModal`), previewed in `ReceiptImportModal`, then appended with the `addItems` action. Keep `src/interfaces/receipt.ts` in sync with the backend's zod schema.

Scans are gated by Cloudflare Turnstile: `useTurnstile` (`@hooks`) runs an invisible check when `ItemTable` mounts (a managed challenge, if any, shows under the buttons). The hook exposes `status` (`verifying` / `interactive` / `passed` / `failed`): while verifying, `TurnstileVerifying` shows an animated placeholder in the button slot, and the "Add from bill" button fades in only on `passed`. On `failed` neither shows. Each scan takes the current single-use token via `getToken()`, which starts the next challenge in the background, and `scanReceipt` sends it as the `cf-turnstile-response` form field. With `VITE_APP_TURNSTILE_SITE_KEY` unset the check is skipped and the button always shows.

### Path aliases

Defined in `tsconfig.json` and resolved by `vite-tsconfig-paths`:

| Alias | Path |
|---|---|
| `@components` | `src/components` |
| `@config` | `src/config` |
| `@interfaces` | `src/interfaces` |
| `@enums` | `src/enums` |
| `@hooks` | `src/hooks` |
| `@slices` | `src/slices` |
| `@utils` | `src/utils` |
| `@views` | `src/views` |

### i18n

Translations are loaded at runtime via `i18next-http-backend` from `/public/locales/{lang}/translation.json`. Supported languages: `en`, `th`. Fallback is `en`.

### Key libraries

- **UI**: Ant Design 5 + styled-components (layout/custom styles)
- **Routing**: React Router v6
- **Data fetching**: TanStack Query (used for GitHub version check only)
- **Share**: `modern-screenshot` captures `#bill-ref-element` for the share sheet
- **Payment**: `promptpay-qr` for Thai PromptPay QR generation
- **Analytics**: `react-ga4` initialized with `VITE_APP_GA_MEASUREMENT_ID` env var
