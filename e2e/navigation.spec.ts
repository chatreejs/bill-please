import { expect, test } from './fixtures';
import {
  addItem,
  addPayer,
  buildBill,
  goToResult,
  openTab,
  payerSummary,
  tableRow,
} from './helpers';

const backButton = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'arrow-left' });

test.describe('Next button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('is disabled with no items and no payers', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('is disabled with items but no payers', async ({ page }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('is disabled with payers but no items', async ({ page }) => {
    await addPayer(page, { name: 'Alice' });
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});

test('back button walks result → mapping → home', async ({ page }) => {
  await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
  await goToResult(page);

  await backButton(page).click();
  await expect(page).toHaveURL(/\/mapping$/);
  await backButton(page).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(backButton(page)).toHaveCount(0);
  // The bill is still there
  await expect(tableRow(page, 'Pizza')).toHaveCount(1);
});

test('unknown paths redirect home', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
});

for (const [link, path] of [
  ['Terms', '/tos'],
  ['Privacy', '/privacy'],
] as const) {
  test(`footer ${link} link opens ${path} and back returns`, async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: link }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { level: 3 })).toBeVisible();
    await backButton(page).click();
    await expect(page).toHaveURL(/\/$/);
  });
}

test('the whole bill survives a reload on the result page', async ({
  page,
}) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 300 }],
    [{ name: 'Alice' }, { name: 'Bob' }],
  );
  await goToResult(page);
  await page.reload();
  await expect(payerSummary(page, 'Alice')).toContainText('150.00');
  await expect(payerSummary(page, 'Bob')).toContainText('150.00');
});

test.describe('clear bill', () => {
  test('is hidden on an empty bill', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'Clear bill data' }),
    ).toHaveCount(0);
  });

  test('cancel keeps the data', async ({ page }) => {
    await page.goto('/');
    await addItem(page, { name: 'Pizza', price: 300 });
    await addPayer(page, { name: 'Alice' });
    await page.getByRole('button', { name: 'Clear bill data' }).click();
    await expect(
      page.getByText('All data will be deleted').first(),
    ).toBeVisible();
    await page
      .getByRole('tooltip')
      .getByRole('button', { name: 'Cancel' })
      .click();
    await expect(tableRow(page, 'Alice')).toHaveCount(1);
    await openTab(page, 'Item');
    await expect(tableRow(page, 'Pizza')).toHaveCount(1);
  });

  test('clears items, payers and assignments', async ({ page }) => {
    await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
    await page.goto('/');
    await page.getByRole('button', { name: 'Clear bill data' }).click();
    await page
      .getByRole('tooltip')
      .getByRole('button', { name: 'Clear data' })
      .click();
    await expect(page.locator('.ant-table-row')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Clear bill data' }),
    ).toHaveCount(0);
  });
});
