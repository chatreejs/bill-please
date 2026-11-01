import { expect, test } from './fixtures';

import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
  payerSummary,
  resultTotal,
  tableRow,
  tableRows,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await addItem(page, { name: 'Pizza', price: 300 });
  await addItem(page, { name: 'Salad', price: 120 });
  await addItem(page, { name: 'Soda', price: 40 });
});

test('deletes an item from its edit modal', async ({ page }) => {
  await tableRow(page, 'Salad').click();
  const modal = page.getByRole('dialog', { name: 'Edit item' });
  await modal.getByRole('button', { name: 'Delete item' }).click();
  await expect(modal).toBeHidden();

  await expect(tableRow(page, 'Salad')).toHaveCount(0);
  await expect(tableRow(page, 'Pizza')).toHaveCount(1);
  await expect(tableRow(page, 'Soda')).toHaveCount(1);
});

test('deletes selected items', async ({ page }) => {
  await page.getByRole('button', { name: 'Select item(s)' }).click();
  await tableRow(page, 'Pizza').getByRole('checkbox').check();
  await tableRow(page, 'Soda').getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete selected item(s)' }).click();
  await expect(
    page.getByText('Do you want to delete selected 2 item(s) ?'),
  ).toBeVisible();
  await page.getByRole('tooltip').getByRole('button', { name: 'Ok' }).click();

  await expect(tableRow(page, 'Pizza')).toHaveCount(0);
  await expect(tableRow(page, 'Soda')).toHaveCount(0);
  await expect(tableRow(page, 'Salad')).toHaveCount(1);
});

test('deletes all items and disables Next', async ({ page }) => {
  await addPayer(page, { name: 'Alice' });
  await page.getByRole('tab', { name: 'Item' }).click();
  await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

  await page.getByRole('button', { name: 'Select item(s)' }).click();
  await page.getByRole('button', { name: 'Delete all items' }).click();
  await page.getByRole('tooltip').getByRole('button', { name: 'Ok' }).click();

  await expect(tableRows(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});

test('a deleted item drops out of the result', async ({ page }) => {
  await addPayer(page, { name: 'Alice' });
  await goToMapping(page);
  for (const item of ['Pizza', 'Salad', 'Soda']) {
    await assignItem(page, item, 'all');
  }

  // Go back and delete an already-mapped item
  await page.goto('/');
  await tableRow(page, 'Pizza').click();
  await page
    .getByRole('dialog', { name: 'Edit item' })
    .getByRole('button', { name: 'Delete item' })
    .click();

  await goToMapping(page);
  await expect(
    page.locator('.ant-card').filter({ hasText: 'Pizza' }),
  ).toHaveCount(0);
  await goToResult(page);

  // 120 + 40
  await expect(resultTotal(page)).toContainText('160.00');
  await expect(payerSummary(page, 'Alice')).toContainText('160.00');
});
