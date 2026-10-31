# Backlog

Planned work and feature ideas for Bill Please. When an idea ships, move it to [CHANGELOG.md](./CHANGELOG.md) and delete it here.

Each idea states the problem, a rough proposal, and the code it would change. Proposals are starting points, not specs.

Every item has a status and a size. The status is idea, exploring, in progress, or parked. Size S fits in an evening, M fits in a weekend, and L needs design or backend work.

## Now

### 1. Receipt upload and auto-fill

In progress, size L.

Typing every item from a long receipt is slow and leads to mistakes. The user uploads a receipt photo, and bill-please-mcp runs OCR and an LLM to extract each item's name, price, quantity, service and VAT. The app shows a preview, then appends the items to the bill. The work is on the `feature/bill-please-mcp` branch.

It changes `ItemTable`, `ReceiptImportModal`, `@utils/receipt.util.ts`, `receiptItemToBillItem`, `src/interfaces/receipt.ts` and `../bill-please-mcp`. Keep `src/interfaces/receipt.ts` in sync with the backend zod schema.

### 2. Cloudflare Turnstile

Idea, size M. Depends on #1.

The receipt scan endpoint is public, and every call costs OCR and LLM usage, so bots can run up the bill. The app shows a Turnstile widget in invisible or managed mode before a scan and sends the token with `POST /api/receipts/scan`. bill-please-mcp checks the token with Cloudflare's `siteverify` API before it runs OCR. The app needs a site key env var such as `VITE_APP_TURNSTILE_SITE_KEY`, and the backend needs the secret key.

It changes `scanReceipt` in `@utils/receipt.util.ts`, `ItemTable`, the `.env` example and the bill-please-mcp scan route.

### 3. OpenGraph

Idea, size S.

Links to bill-please.chatree.dev show no preview in LINE, Facebook, X or Discord. `index.html` has only a title and the placeholder description "Bill Please Application". Add the `og:title`, `og:description`, `og:image`, `og:url`, `og:type` and `twitter:card` meta tags, write a real description, and add a 1200×630 preview image to `public/`.

It changes `index.html` and `public/`.

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

Idea, size M. Follows #1.

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

### 15. Tests for the split math

Idea, size S.

The project has no tests, and the expense calculation in `ExpenseList` breaks most easily. It handles proportional service and VAT, friends, and currency conversion, and ideas 4, 5 and 7 all change it. Move the calculation out of `ExpenseList` into a pure function in `@utils` and cover it with Vitest before building on it.

### 16. Store migrations

Idea, size S.

Several ideas above change the shape of persisted state. The pre-v0.9.0 currency backfill showed that old `bp-store` data needs handling. Set a redux-persist `version` and a `migrate` function so each shape change gets its own migration step.
