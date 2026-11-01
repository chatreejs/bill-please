import { expect, test } from './fixtures';
import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
  mappingCard,
  payerSummary,
  resultTotal,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addItem(page, { name: 'Pizza', price: 300 });
  await addItem(page, { name: 'Wine', price: 900, quantity: 3 });
  for (const name of ['Alice', 'Bob', 'Carol']) {
    await addPayer(page, { name });
  }
  await goToMapping(page);
});

test('lists every item with its quantity and no payer yet', async ({
  page,
}) => {
  await expect(mappingCard(page, 'Pizza')).toContainText('Quantity: 1');
  await expect(mappingCard(page, 'Wine')).toContainText('Quantity: 3');
  await expect(mappingCard(page, 'Pizza')).toContainText('No payer selected');
});

test('items can be split by different people', async ({ page }) => {
  await assignItem(page, 'Pizza', 'all');
  await assignItem(page, 'Wine', ['Alice', 'Bob']);
  await expect(mappingCard(page, 'Wine')).toContainText('Alice');
  await expect(mappingCard(page, 'Wine')).not.toContainText('Carol');
  await goToResult(page);

  // Pizza 100 each; Wine 2700 / 2 = 1350
  await expect(resultTotal(page)).toContainText('3,000.00');
  await expect(payerSummary(page, 'Alice')).toContainText('1,450.00');
  await expect(payerSummary(page, 'Bob')).toContainText('1,450.00');
  await expect(payerSummary(page, 'Carol')).toContainText('100.00');
});

test('shows each payer’s items and split quantity', async ({ page }) => {
  await assignItem(page, 'Pizza', 'all');
  await assignItem(page, 'Wine', ['Alice', 'Bob']);
  await goToResult(page);

  const alice = page.locator('#bill-ref-element .ant-collapse-item').filter({
    has: page
      .locator('.ant-collapse-header')
      .getByText('Alice', { exact: true }),
  });
  // 1 pizza / 3 = 0.3, 3 wine / 2 = 1.5
  await expect(alice).toContainText(/0\.3\s*Pizza/);
  await expect(alice).toContainText(/1\.5\s*Wine/);
});

test('reopening an item keeps the current selection', async ({ page }) => {
  await assignItem(page, 'Pizza', ['Bob']);
  await mappingCard(page, 'Pizza').click();
  const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
  await expect(modal).toContainText('Quantity: 1');
  await expect(
    modal.locator('.ant-tag').filter({ hasText: 'Bob' }).getByRole('img', {
      name: 'check',
    }),
  ).toBeVisible();
  await expect(
    modal.locator('.ant-tag').filter({ hasText: 'Alice' }).getByRole('img', {
      name: 'plus',
    }),
  ).toBeVisible();
});

test('cancel does not save the selection', async ({ page }) => {
  await mappingCard(page, 'Pizza').click();
  const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
  await modal.getByText('Alice', { exact: true }).click();
  await modal.getByRole('button', { name: 'Cancel' }).click();
  await expect(modal).toBeHidden();
  await expect(mappingCard(page, 'Pizza')).toContainText('No payer selected');
});

test('tapping a selected payer unselects them', async ({ page }) => {
  await assignItem(page, 'Pizza', ['Alice', 'Bob']);
  await assignItem(page, 'Pizza', ['Bob']); // toggles Bob off
  await expect(mappingCard(page, 'Pizza')).toContainText('Alice');
  await expect(mappingCard(page, 'Pizza')).not.toContainText('Bob');
});

test('Select all toggles to Deselect all', async ({ page }) => {
  await mappingCard(page, 'Pizza').click();
  const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
  await modal.getByRole('button', { name: 'Select all' }).click();
  await expect(
    modal.getByRole('button', { name: 'Deselect all' }),
  ).toBeVisible();
  await modal.getByRole('button', { name: 'Deselect all' }).click();
  await expect(modal.getByRole('button', { name: 'Select all' })).toBeVisible();
});

test('Summarize is disabled while an item has no payers', async ({ page }) => {
  const summarize = page.getByRole('button', { name: 'Summarize' });
  await assignItem(page, 'Pizza', 'all');
  await assignItem(page, 'Wine', 'all');
  await expect(summarize).toBeEnabled();

  // Clear Wine's payers
  await mappingCard(page, 'Wine').click();
  const modal = page.getByRole('dialog', { name: 'Select payer for Wine' });
  await modal.getByRole('button', { name: 'Deselect all' }).click();
  await modal.getByRole('button', { name: 'Save' }).click();

  await expect(mappingCard(page, 'Wine')).toContainText('No payer selected');
  await expect(summarize).toBeDisabled();
});

// This may be a bug. Summarize is only disabled for an item saved with no
// payers. An item nobody opened has no mapping, so the button stays enabled,
// the item counts in the total, and nobody pays for it.
test.fixme(
  'Summarize is disabled until every item is assigned',
  async ({ page }) => {
    await assignItem(page, 'Pizza', 'all');
    await expect(
      page.getByRole('button', { name: 'Summarize' }),
    ).toBeDisabled();
  },
);

test('assignments survive a reload', async ({ page }) => {
  await assignItem(page, 'Pizza', ['Alice']);
  await page.reload();
  await expect(mappingCard(page, 'Pizza')).toContainText('Alice');
});
