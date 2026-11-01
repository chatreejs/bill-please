import { expect, test } from './fixtures';

import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
  openTab,
  payerSummary,
  tableRow,
  tableRows,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('payer delete', () => {
  test.beforeEach(async ({ page }) => {
    for (const name of ['Alice', 'Bob', 'Carol']) {
      await addPayer(page, { name });
    }
  });

  test('deletes a payer from its edit modal', async ({ page }) => {
    await tableRow(page, 'Bob').click();
    const modal = page.getByRole('dialog', { name: 'Edit payer' });
    await modal.getByRole('button', { name: 'Delete payer' }).click();
    await expect(modal).toBeHidden();

    await expect(tableRow(page, 'Bob')).toHaveCount(0);
    await expect(tableRow(page, 'Alice')).toHaveCount(1);
    await expect(tableRow(page, 'Carol')).toHaveCount(1);
  });

  test('deletes selected payers', async ({ page }) => {
    await page.getByRole('button', { name: 'Select payer(s)' }).click();
    await tableRow(page, 'Alice').getByRole('checkbox').check();
    await tableRow(page, 'Carol').getByRole('checkbox').check();
    await page
      .getByRole('button', { name: 'Delete selected payer(s)' })
      .click();
    await page.getByRole('tooltip').getByRole('button', { name: 'Ok' }).click();

    await expect(tableRow(page, 'Alice')).toHaveCount(0);
    await expect(tableRow(page, 'Carol')).toHaveCount(0);
    await expect(tableRow(page, 'Bob')).toHaveCount(1);
  });

  test('deletes all payers', async ({ page }) => {
    await page.getByRole('button', { name: 'Select payer(s)' }).click();
    await page.getByRole('button', { name: 'Delete all payers' }).click();
    await page.getByRole('tooltip').getByRole('button', { name: 'Ok' }).click();

    await expect(tableRows(page)).toHaveCount(0);
  });

  test('a deleted payer’s share goes to the remaining payers', async ({
    page,
  }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    await goToMapping(page);
    await assignItem(page, 'Pizza', 'all');

    await page.goto('/');
    await openTab(page, 'Payer');
    await tableRow(page, 'Carol').click();
    await page
      .getByRole('dialog', { name: 'Edit payer' })
      .getByRole('button', { name: 'Delete payer' })
      .click();

    await goToMapping(page);
    await goToResult(page);
    await expect(payerSummary(page, 'Carol')).toHaveCount(0);
    await expect(payerSummary(page, 'Alice')).toContainText('150.00');
    await expect(payerSummary(page, 'Bob')).toContainText('150.00');
  });
});

test.describe('payer with friend', () => {
  test('shows the friend under the payer', async ({ page }) => {
    await addPayer(page, { name: 'Alice', friends: ['Dave'] });

    const row = tableRow(page, 'Alice');
    await expect(row).toContainText('Alice and friend');
    await row.getByRole('button', { name: /expand/i }).click();
    await expect(page.locator('.ant-table-expanded-row')).toContainText('Dave');
  });

  test('requires a friend name', async ({ page }) => {
    await openTab(page, 'Payer');
    await page.getByRole('button', { name: 'Add payer' }).click();
    const modal = page.getByRole('dialog', { name: 'Add new payer' });
    await modal.getByLabel('Payer name').fill('Alice');
    await modal.getByLabel('a friend came with').check();
    await modal.getByRole('button', { name: 'Add friend' }).click();
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(modal.getByText('Please input friend name')).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('the payer pays for their friend’s share', async ({ page }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    await addPayer(page, { name: 'Alice', friends: ['Dave'] });
    await addPayer(page, { name: 'Bob' });

    await goToMapping(page);
    await assignItem(page, 'Pizza', 'all');
    // Friends are listed as their own people on the mapping card
    await expect(
      page.locator('.ant-card').filter({ hasText: 'Pizza' }),
    ).toContainText('Dave');
    await goToResult(page);

    // 300 split 3 ways, and Alice pays for herself and Dave
    await expect(payerSummary(page, 'Alice')).toContainText('200.00');
    await expect(payerSummary(page, 'Bob')).toContainText('100.00');
    const daveRow = page
      .locator('#bill-ref-element')
      .getByText('Dave', { exact: true })
      .locator('..');
    await expect(daveRow).toContainText('100.00');
  });

  test('removing a friend drops them from the split', async ({ page }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    await addPayer(page, { name: 'Alice', friends: ['Dave'] });
    await addPayer(page, { name: 'Bob' });
    await goToMapping(page);
    await assignItem(page, 'Pizza', 'all');

    await page.goto('/');
    await openTab(page, 'Payer');
    await tableRow(page, 'Alice').click();
    const modal = page.getByRole('dialog', { name: 'Edit payer' });
    await modal.getByLabel('a friend came with').uncheck();
    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(tableRow(page, 'Alice')).not.toContainText('and friend');

    await goToMapping(page);
    await goToResult(page);
    await expect(
      page.locator('#bill-ref-element').getByText('Dave', { exact: true }),
    ).toHaveCount(0);
    await expect(payerSummary(page, 'Alice')).toContainText('150.00');
    await expect(payerSummary(page, 'Bob')).toContainText('150.00');
  });

  test('deleting a payer also removes their friend', async ({ page }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    await addPayer(page, { name: 'Alice', friends: ['Dave'] });
    await addPayer(page, { name: 'Bob' });
    await goToMapping(page);
    await assignItem(page, 'Pizza', 'all');

    await page.goto('/');
    await openTab(page, 'Payer');
    await tableRow(page, 'Alice').click();
    await page
      .getByRole('dialog', { name: 'Edit payer' })
      .getByRole('button', { name: 'Delete payer' })
      .click();

    await goToMapping(page);
    await expect(
      page.locator('.ant-card').filter({ hasText: 'Pizza' }),
    ).not.toContainText('Dave');
    await goToResult(page);
    await expect(payerSummary(page, 'Bob')).toContainText('300.00');
  });
});
