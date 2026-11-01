# Backlog

Planned work and feature ideas for Bill Please. When an idea ships, move it to [CHANGELOG.md](./CHANGELOG.md) and delete it here.

Each idea states the problem, a rough proposal, and the code it would change. Proposals are starting points, not specs.

Every item has a status and a size. The status is idea, exploring, in progress, parked, or done. Size S fits in an evening, M fits in a weekend, and L needs design or backend work.

## Done, awaiting release

These shipped on `feature/next-0.11.0` and go out in 0.11.0. Move them to the changelog when that release is cut. They keep their numbers because other items refer to them.

### 1. Receipt upload and auto-fill

Done, size L.

Typing every item from a long receipt is slow and leads to mistakes. The "Add from bill" button in `ItemTable` sends a receipt photo to bill-please-mcp, which runs OCR and an LLM to extract each item's name, price, quantity, service and VAT. `ReceiptImportModal` shows a preview, then the app appends the items to the bill.

The code is in `ItemTable`, `ReceiptImportModal`, `@utils/receipt.util.ts`, `receiptItemToBillItem`, `src/interfaces/receipt.ts` and `../bill-please-mcp`. Keep `src/interfaces/receipt.ts` in sync with the backend zod schema.

### 2. Cloudflare Turnstile

Done, size M.

The receipt scan endpoint is public, and every call costs OCR and LLM usage, so bots could run up the bill. `useTurnstile` runs an invisible check when `ItemTable` mounts and falls back to a managed challenge. The "Add from bill" button appears only after the check passes. `scanReceipt` sends the token as the `cf-turnstile-response` form field, and bill-please-mcp checks it with Cloudflare's `siteverify` API before it runs OCR. The app reads the site key from `VITE_APP_TURNSTILE_SITE_KEY` and skips the check when it is unset.

The code is in `useTurnstile`, `TurnstileVerifying`, `ItemTable`, `scanReceipt`, `.env.example` and the bill-please-mcp scan route.

### 3. OpenGraph

Done, size S.

Links to bill-please.chatree.dev showed no preview in LINE, Facebook, X or Discord. `index.html` now has a real description and the `og:*` and `twitter:*` meta tags, and `public/og-image.png` is the 1200×630 preview image.

### 15. Tests for the split math

Done, size S.

The project had no tests, and the expense calculation in `ExpenseList` breaks most easily. It handles proportional service and VAT and friends, and ideas 4, 5 and 7 all change it. The calculation now lives in `calculateExpenses` and `calculateExpenseItem` in `@utils/expense.util.ts`, and `ExpenseList` only renders the result. Vitest covers it, together with `calculateService` and `calculateVat`, in `expense.util.test.ts`. Run it with `npm test`.

## Now

### 4. Uneven splits

Idea, size M.

The app splits every item equally between the payers mapped to it, so it can't express one person eating two slices of a shared pizza. Give each payer in a mapping a weight that defaults to 1, so a pizza could split 2, 1, 1. A later step could allow a fixed amount per payer.

It changes `IBillItemMapping`, `BillItemMappingModal` and the split logic in `ExpenseList`. The `payerId: string[]` field becomes a list of payers with weights, which needs a redux-persist migration.

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

Sharing produces a screenshot, so friends can't open their own breakdown. Compress the bill into the URL hash, which browsers never send to a server, and open it read-only on the Result page. A short link would need bill-please-mcp to store the bill. Bills with many items may exceed URL length limits.

It changes the routes, `ShareBill` and a new serializer in `@utils`.

### 10. Smarter receipt import

Idea, size M. Builds on #1.

"Add from bill" fills in items only. A receipt usually also shows the restaurant name, the currency, and bill-level service, VAT and discount. Have bill-please-mcp return these and let the user apply them in `ReceiptImportModal`. Also accept several photos for a long receipt.

It changes `src/interfaces/receipt.ts` and the backend zod schema together, plus `ReceiptImportModal` and `normalizeReceiptItems`.

## Later

### 11. More payment methods

Idea, size M.

The only payment method is Thai PromptPay QR. Offer payment options per currency, such as bank account details to copy or other countries' QR standards.

It changes `Payment` and `PromptPayQRCode`.

### 12. Live exchange rates

Idea, size S.

Users type exchange rates by hand. Offer to fetch the current rate from bill-please-mcp or a free rates API, and let the user edit it before saving.

It changes `CurrencySettings` and adds a TanStack Query fetch.

### 13. Export

Idea, size S.

The only export is an image. Add "copy as text" for chat apps and a CSV download for spreadsheets.

It changes `ShareBill` and adds a formatter in `@utils`.

### 14. More languages

Idea, size S.

The app supports only English and Thai. Add each language as `public/locales/{lang}/translation.json` and register it in the language switcher.

## Tech debt

### 16. Store migrations

Idea, size S.

Several ideas above change the shape of persisted state. The pre-v0.9.0 currency backfill showed that old `bp-store` data needs handling. Set a redux-persist `version` and a `migrate` function so each shape change gets its own migration step.
