# Backlog

Planned work and feature ideas for Bill Please. When an idea ships, move it to [CHANGELOG.md](./CHANGELOG.md) and delete it here.

Each idea states the problem, a rough proposal, and the code it would change. Proposals are starting points, not specs.

Every item has a status and a size. The status is idea, exploring, in progress, parked, or done. Size S fits in an evening, M fits in a weekend, and L needs design or backend work.

## Done, awaiting release

These shipped on `feature/next-0.11.0` and go out in 0.11.0. Move them to the changelog when that release is cut. They keep their numbers because other items refer to them.

### 1. Receipt upload and auto-fill

Done, size L.

Typing every item from a long receipt is slow and leads to mistakes. The "Add from bill" button in `ItemTable` sends a receipt photo to bill-please-api, which runs OCR and an LLM to extract each item's name, price, quantity, service and VAT. `ReceiptImportModal` shows a preview, then the app appends the items to the bill.

The code is in `ItemTable`, `ReceiptImportModal`, `@utils/receipt.util.ts`, `receiptItemToBillItem`, `src/interfaces/receipt.ts` and `../bill-please-api`. Keep `src/interfaces/receipt.ts` in sync with the backend zod schema.

### 2. Cloudflare Turnstile

Done, size M.

The receipt scan endpoint is public, and every call costs OCR and LLM usage, so bots could run up the bill. `useTurnstile` runs an invisible check when `ItemTable` mounts and falls back to a managed challenge. The "Add from bill" button appears only after the check passes. `scanReceipt` sends the token as the `cf-turnstile-response` form field, and bill-please-api checks it with Cloudflare's `siteverify` API before it runs OCR. The app reads the site key from `VITE_APP_TURNSTILE_SITE_KEY` and skips the check when it is unset.

The code is in `useTurnstile`, `TurnstileVerifying`, `ItemTable`, `scanReceipt`, `.env.example` and the bill-please-api scan route.

### 3. OpenGraph

Done, size S.

Links to bill-please.chatree.dev showed no preview in LINE, Facebook, X or Discord. `index.html` now has a real description and the `og:*` and `twitter:*` meta tags, and `public/og-image.png` is the 1200×630 preview image.

### 15. Tests for the split math

Done, size S.

The project had no tests, and the expense calculation in `ExpenseList` breaks most easily. It handles proportional service and VAT and friends, and ideas 4, 5 and 7 all change it. The calculation now lives in `calculateExpenses` and `calculateExpenseItem` in `@utils/expense.util.ts`, and `ExpenseList` only renders the result. Vitest covers it, together with `calculateService` and `calculateVat`, in `expense.util.test.ts`. Run it with `bun run test`.

### 4. Uneven splits

Done, size M.

The app split every item equally between the payers mapped to it, so it couldn't express one person eating two slices of a shared pizza. Each payer in a mapping now has a weight that defaults to 1, so a pizza can split 2, 1, 1. When removing payers leaves one payer on an item, that payer's weight goes back to 1. A fixed amount per payer is not built.

`IBillItemMapping` now holds `shares` (a payer id and a weight) instead of `payerId: string[]`. Migration 2 in `src/config/migrations.ts` converts old stores. The code is in `BillItemMappingModal`, the `bill` slice and `@utils/expense.util.ts`.

### 16. Store migrations

Done, size S.

Several ideas change the shape of persisted state, and the pre-v0.9.0 currency backfill showed that old `bp-store` data needs handling. Each step now lives in `src/config/migrations.ts`, keyed by the redux-persist `version` set in `src/config/Store.ts`, with tests in `migrations.test.ts`. Migration 2 takes a store from main (version 1) to the current shape. It converts mappings to shares (#4) and drops exchange rates for the base currency (#71).

### 11. More payment methods

Done, size M.

PromptPay QR was the only way to get paid. The Result page now also offers Thai bank accounts. `BankAccount` lets the user pick a bank from `src/config/banks.json`, formats the number into the shared mask, checks the digit count for that bank, and saves the account on the device. Analytics never gets the number.

Not built: payment methods for other currencies, such as other countries' QR standards. The GSB, BAAC, GHB, KKP and TISCO digit ranges come from a 2019 government table and still need checking against real passbooks.

The code is in `Payment`, `BankAccount`, `src/config/banks.json` and `@utils/bank.util.ts`.

### 17. Accessibility

Done, size S.

The item cards on the mapping page and the payer tags in `BillItemMappingModal` responded only to taps. They now use `buttonProps` from `@utils/a11y.util.ts`, which gives them a button role, a Tab stop and Enter and Space keys. Each payer tag has `aria-pressed`. The back button and the friend delete button in `PayerListModal` have an `aria-label`. The underlined "change" links on the Result page, the PromptPay logo and the language switcher are now real buttons (`TextButton` in `@components`). `src/i18n.ts` sets `document.documentElement.lang` when the language changes.

`e2e/a11y.spec.ts` runs `@axe-core/playwright` against WCAG 2.1 A and AA on every page and the mapping modal, and checks the keyboard flow and the page language. The e2e helpers find mapping cards and payer tags by role. Two axe rules stay off until #18 is done.

## Now

### 5. Bill-level discount, tip and rounding

Idea, size M.

Service and VAT are set per item, but discounts, coupons and tips usually apply to the whole bill. Each person's total also can't be rounded. Add bill-level adjustments as a percentage or a fixed amount, and split them in proportion to each payer's subtotal. Add an option to round each person's total to the nearest 1 or 5 and show the rounding difference.

It changes the `bill` slice, Home, `ExpenseList` and the Result totals.

### 6. Bill history

Idea, size M.

The app holds one bill at a time, and starting a new one wipes the last. Keep a list of past bills in localStorage with the title, date and total of each. Let the user open, duplicate or delete them. Duplicating saves time for a group that eats together often.

It changes the `bill` slice, which would hold the current bill and an archive and needs a redux-persist migration. It also adds a history view and route.

## Next

### 7. Settle up

Idea, size M.

Usually one person pays the restaurant and everyone else pays them back. The Result page shows what each person owes but not who owes whom. Let the user pick who paid the restaurant, then list the transfers, such as "A pays B ฿120", and let people tick each one off when paid.

It changes the `bill` slice, the Result page and `Payment`.

### 8. Saved groups

Idea, size S.

Users type the same friends again for every bill. Save payer names and their friends as groups that the user can add in one tap.

It changes `PayerTable`, `PayerListModal` and the `app` slice, which would persist the groups.

### 9. Share a bill as a link

Exploring, size L.

Sharing produces a screenshot, so friends can't open their own breakdown. Compress the bill into the URL hash, which browsers never send to a server, and open it read-only on the Result page. A short link would need bill-please-api to store the bill. Bills with many items may exceed URL length limits.

It changes the routes, `ShareBill` and a new serializer in `@utils`.

### 10. Smarter receipt import

Idea, size M. Builds on #1.

"Add from bill" fills in items only. A receipt usually also shows the restaurant name, the currency, and bill-level service, VAT and discount. Have bill-please-api return these and let the user apply them in `ReceiptImportModal`. Also accept several photos for a long receipt.

It changes `src/interfaces/receipt.ts` and the backend zod schema together, plus `ReceiptImportModal` and `normalizeReceiptItems`.

## Later

### 12. Live exchange rates

Idea, size S.

Users type exchange rates by hand. Offer to fetch the current rate from bill-please-api or a free rates API, and let the user edit it before saving.

It changes `CurrencySettings` and adds a TanStack Query fetch.

### 13. Export

Idea, size S.

The only export is an image. Add "copy as text" for chat apps and a CSV download for spreadsheets.

It changes `ShareBill` and adds a formatter in `@utils`.

### 14. More languages

Idea, size S.

The app supports only English and Thai. Add each language as `public/locales/{lang}/translation.json` and register it in the language switcher.

## Tech debt

### 18. Color contrast and zoom

Idea, size S. Found by the axe check from #17.

Axe reports two WCAG AA failures on every page, so `e2e/a11y.spec.ts` turns both rules off for now. The first is `color-contrast`. The theme's grey secondary text, the footer links and the Ko-fi button are too light against their backgrounds. The second is `meta-viewport`. `index.html` sets `maximum-scale=1`, which stops Android users from zooming in. It is there to stop iOS from zooming into inputs with 14px text, so removing it needs 16px inputs first.

Fix the colors in the antd theme tokens and the footer styles, make the inputs 16px, drop `maximum-scale=1`, then remove both rules from `disableRules` in `e2e/a11y.spec.ts`.

It changes the antd theme, `Footer`, `index.html` and `e2e/a11y.spec.ts`.
