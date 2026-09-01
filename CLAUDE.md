# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server on localhost:3000
npm run build      # tsc + vite build → build/
npm run lint       # eslint + tsc type-check
npm run check-types  # tsc --noemit only
npm run format:write # prettier auto-fix
```

There are no tests in this project.

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

`ExpenseList` (Result page) computes each payer's share by iterating `billPayers`, finding all `IBillItemMapping` entries where that payer (or their friends) are listed, then proportionally splitting item cost (price × quantity), service, and VAT across the assigned payers.

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
