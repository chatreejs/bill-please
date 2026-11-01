import { expect, test } from './fixtures';

import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
  payerSummary,
  resultTotal,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('splits an uneven amount three ways to 2 decimals', async ({ page }) => {
  await addItem(page, { name: 'Pizza', price: 100 });
  for (const name of ['Alice', 'Bob', 'Carol']) {
    await addPayer(page, { name });
  }
  await goToMapping(page);
  await assignItem(page, 'Pizza', 'all');
  await goToResult(page);

  await expect(resultTotal(page)).toContainText('100.00');
  for (const name of ['Alice', 'Bob', 'Carol']) {
    // 100 / 3 = 33.333… → 33.33
    await expect(payerSummary(page, name)).toContainText('33.33');
  }
});

test('rounds a repeating share up', async ({ page }) => {
  await addItem(page, { name: 'Steak', price: 200 });
  for (const name of ['Alice', 'Bob', 'Carol']) {
    await addPayer(page, { name });
  }
  await goToMapping(page);
  await assignItem(page, 'Steak', 'all');
  await goToResult(page);

  // 200 / 3 = 66.666… → 66.67
  await expect(payerSummary(page, 'Alice')).toContainText('66.67');
});

test('hides floating point error in small amounts', async ({ page }) => {
  // 0.1 × 3 = 0.30000000000000004 in JS
  await addItem(page, { name: 'Candy', price: 0.1, quantity: 3 });
  await addPayer(page, { name: 'Alice' });
  await goToMapping(page);
  await assignItem(page, 'Candy', 'all');
  await goToResult(page);

  await expect(resultTotal(page)).toContainText('0.30');
  await expect(payerSummary(page, 'Alice')).toContainText('0.30');
  await expect(page.locator('#bill-ref-element')).not.toContainText('0.30000');
});

test('applies VAT on top of service charge', async ({ page }) => {
  // service = 100 × 10% = 10; VAT = (100 + 10) × 7% = 7.70; total = 117.70
  await addItem(page, { name: 'Pasta', price: 100, service: 10, vat: 7 });
  await addPayer(page, { name: 'Alice' });
  await addPayer(page, { name: 'Bob' });
  await goToMapping(page);
  await assignItem(page, 'Pasta', 'all');
  await goToResult(page);

  const summary = page.locator('#bill-ref-element .text-right');
  await expect(resultTotal(page)).toContainText('117.70');
  await expect(summary).toContainText(/Subtotal:\s*\S*\s*100\.00/);
  await expect(summary).toContainText(/Service Charge:\s*\S*\s*10\.00/);
  await expect(summary).toContainText(/VAT:\s*\S*\s*7\.70/);
  // 117.70 / 2 = 58.85
  await expect(payerSummary(page, 'Alice')).toContainText('58.85');
  await expect(payerSummary(page, 'Bob')).toContainText('58.85');
});
