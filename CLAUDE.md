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

`ItemTable` opens a hidden `<input type="file" accept="image/*">` and sends the photo to the sibling backend **bill-please-mcp** (`../bill-please-mcp`, Bun + Elysia, also an MCP server) via `scanReceipt` in `@utils/receipt.util.ts`: resized to ≤1600px JPEG, `POST {VITE_APP_BILL_PLEASE_MCP_URL}/api/receipts/scan`. The button is disabled unless the `GET /api/receipts/status` Server-Sent Events stream is open, and also while its latest `status` event says `busy: true` because the server's LLM queue is full. `useReceiptScannerStatus` (`@hooks`) keeps an `EventSource` on `getReceiptScannerStatusUrl()`; the server sends a `status` event on connect and on each queue change. The hook closes the stream while the tab is hidden. When a stream drops, `EventSource` reconnects by itself and the hook keeps the last status for 10 s. When the server refuses the stream with an error status, or an older backend answers JSON, the hook opens a new one after 5 s. The tooltip then says `home.itemList.importModal.busy` ("AI กำลังทำงานอย่างหนัก โปรดรอสักครู่"), and the button turns back on by itself as soon as the server pushes the change. The tooltip hangs on a `TooltipTarget` wrapper, because a disabled button gets no pointer events; on phones it opens on tap. A scan that still gets a 503 shows the same busy message.

Bill-scan analytics events (GA4 via `trackEvent`, no personal data):

| Event | Params |
|---|---|
| `receipt_scan_started` | `file_type`, `file_size_kb` |
| `receipt_scan_succeeded` | `count`, `duration_ms` |
| `receipt_scan_failed` | `reason` (`turnstile` client-side, or `getReceiptScanFailureReason`: `busy`, `unreadable`, `rate_limited`, `turnstile_rejected`, `turnstile_unavailable`, `too_large`, `unsupported_type`, `timeout`, `network`, `server_error`, `unknown`), `duration_ms` |
| `receipt_scan_cancelled` | `duration_ms` (the user closed the modal while scanning) |
| `receipt_scanner_busy_shown` | `active`, `waiting` (once each time the button turns busy) |
| `receipt_items_imported` | `count`, `scanned_count` |

The scan asks for `Accept: text/event-stream`, and bill-please-mcp streams Server-Sent Events: `progress` (`IReceiptScanProgress`: `stage` `ocr`, `queue` with `position`, or `llm` with `items`), then `result` or `error` (`{ status, code?, error }`). `scanReceipt` uses the axios XHR adapter with `responseType: 'text'`, parses `responseText` with `parseServerSentEvents` in `onDownloadProgress`, adds the `upload` stage from `onUploadProgress`, and throws a stream error as `ReceiptScanError`, which `getReceiptScanFailureReason` maps like the HTTP status. A plain JSON answer from an older backend still works. `ReceiptScanProgress` in the modal shows the antd spinner and one line for the current step: "Reading receipt image" for `upload` and `ocr`, "Extracting items" for `queue` and `llm` before the first item, then "Found N items". Playwright's `route.fulfill` can't stream, so e2e only checks a whole SSE body. The status mock answers one `status` event with `retry: 500`, so `EventSource` reconnects and picks up `setBusy` / `setHealthy` changes.

The backend's busy 503, or busy error event, has `code: 'scanner_busy'`; any other 503 is the Turnstile siteverify one. The response (`IReceiptScanResult`, per-item `servicePercentage` / `vatPercentage`) is sanitized by `normalizeReceiptItems`, converted by `receiptItemToBillItem` (`@utils/bill.util.ts`, shares `calculateService` / `calculateVat` with `ItemListModal`), previewed in `ReceiptImportModal`, then appended with the `addItems` action. Keep `src/interfaces/receipt.ts` in sync with the backend's zod schema.

Scans are gated by Cloudflare Turnstile: `useTurnstile` (`@hooks`) runs an invisible check when `ItemTable` mounts (a managed challenge, if any, shows under the buttons). The hook exposes `status` (`verifying` / `interactive` / `passed` / `failed`): while verifying, `TurnstileVerifying` shows an animated placeholder in the button slot, and the "Add from bill" button fades in only on `passed`. On `failed` neither shows. Each scan takes the current single-use token via `getToken()`, which starts the next challenge in the background, and `scanReceipt` sends it as the `cf-turnstile-response` form field. With `VITE_APP_TURNSTILE_SITE_KEY` unset the check is skipped and the button always shows.

### Payment methods

`Payment` on the Result page offers PromptPay QR (`PromptPayQRCode`) and Thai bank accounts (`BankAccount`). Banks come from `src/config/banks.json`: each has an `id`, a Bank of Thailand `code`, `name` per language, an `icon` (logos are in `public/banks/{id}.png`, taken from the ISC-licensed `thai-banks-logo` package, except CLICX's and SMED's, which are their App Store icons, and precached by the PWA), a fallback badge `color`, and `minDigits` / `maxDigits`. Every bank shares `accountNumberMask` (`XXX-X-XXXXX-XXXXXXX`, each `X` one digit), so the box takes digits only and stops at 19 characters. `@utils/bank.util.ts` formats the number into the mask, and `isValidAccountNumber` checks the digit count against the bank's range. The form checks the number on blur and again when the bank changes, and shows `numberFormatError`. The PromptPay ID and the bank account are saved in localStorage with `useBrowserStorage`, and analytics never gets either number.

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
