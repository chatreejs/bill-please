import { expect, test } from './fixtures';
import {
  addItem,
  buildBill,
  goToResult,
  openEditItem,
  openTab,
  payerSummary,
  resultTotal,
  tableRow,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows unit price × quantity in the table', async ({ page }) => {
  await addItem(page, { name: 'Beer', price: 85, quantity: 4 });
  const row = tableRow(page, 'Beer');
  await expect(row).toContainText('4');
  await expect(row).toContainText('340.00');
});

test('edits name, price and quantity', async ({ page }) => {
  await addItem(page, { name: 'Pizza', price: 300 });

  const modal = await openEditItem(page, 'Pizza');
  await expect(modal.getByLabel('Item name')).toHaveValue('Pizza');
  await expect(modal.getByLabel(/Unit Price/)).toHaveValue('300');
  await modal.getByLabel('Item name').fill('Large pizza');
  await modal.getByLabel(/Unit Price/).fill('350');
  await modal.getByLabel('Quantity').fill('2');
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();

  await expect(tableRow(page, 'Pizza')).toContainText('Large pizza');
  await expect(tableRow(page, 'Large pizza')).toContainText('700.00');
});

test('cancelling an edit keeps the old values', async ({ page }) => {
  await addItem(page, { name: 'Pizza', price: 300 });
  const modal = await openEditItem(page, 'Pizza');
  await modal.getByLabel('Item name').fill('Changed');
  await modal.getByRole('button', { name: 'Cancel' }).click();
  await expect(modal).toBeHidden();
  await expect(tableRow(page, 'Pizza')).toHaveCount(1);
  await expect(tableRow(page, 'Changed')).toHaveCount(0);
});

test('edit modal remembers service and VAT and can turn them off', async ({
  page,
}) => {
  await addItem(page, { name: 'Pasta', price: 100, service: 10, vat: 7 });
  await expect(tableRow(page, 'Pasta')).toContainText('117.70');

  const modal = await openEditItem(page, 'Pasta');
  await expect(modal.getByLabel(/Calculate Service Charge/)).toBeChecked();
  await expect(modal.getByLabel(/Calculate VAT/)).toBeChecked();
  await modal.getByLabel(/Calculate Service Charge/).uncheck();
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();

  // VAT only: 100 × 7% = 7
  await expect(tableRow(page, 'Pasta')).toContainText('107.00');
});

test('uses custom service and VAT percentages', async ({ page }) => {
  // service 100 × 5% = 5; VAT (100 + 5) × 10% = 10.50
  await addItem(page, { name: 'Pasta', price: 100, service: 5, vat: 10 });
  await expect(tableRow(page, 'Pasta')).toContainText('115.50');
});

test('Home summary shows subtotal, service, VAT and total', async ({
  page,
}) => {
  await addItem(page, { name: 'Pasta', price: 100, service: 10, vat: 7 });
  await addItem(page, { name: 'Water', price: 20 });

  const panel = page.locator('.ant-tabs-tabpane-active');
  await expect(panel).toContainText(/Subtotal:\s*120\.00/);
  await expect(panel).toContainText(/Service Charge:\s*10\.00/);
  await expect(panel).toContainText(/VAT:\s*7\.70/);
  await expect(panel).toContainText(/Total:\s*137\.70/);
});

test('hides subtotal/service/VAT lines when there are none', async ({
  page,
}) => {
  await addItem(page, { name: 'Water', price: 20 });
  const panel = page.locator('.ant-tabs-tabpane-active');
  await expect(panel).toContainText(/Total:\s*20\.00/);
  await expect(panel).not.toContainText('Subtotal');
  await expect(panel).not.toContainText('Service Charge:');
});

test.describe('validation', () => {
  test('requires name, price and quantity', async ({ page }) => {
    await page.getByRole('button', { name: 'Add item' }).click();
    const modal = page.getByRole('dialog', { name: 'Add new item' });
    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(modal.getByText('Please input item name')).toBeVisible();
    await expect(modal.getByText('Please input item price')).toBeVisible();
    await expect(modal.getByText('Please input item quantity')).toBeVisible();
    await expect(modal).toBeVisible();
  });

  test('cancel closes without adding', async ({ page }) => {
    await page.getByRole('button', { name: 'Add item' }).click();
    const modal = page.getByRole('dialog', { name: 'Add new item' });
    await modal.getByLabel('Item name').fill('Ghost');
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).toBeHidden();
    await expect(page.getByText('Ghost')).toHaveCount(0);
  });

  test('a fresh add modal is empty after a previous add', async ({ page }) => {
    await addItem(page, { name: 'Pizza', price: 300, service: 10 });
    await page.getByRole('button', { name: 'Add item' }).click();
    const modal = page.getByRole('dialog', { name: 'Add new item' });
    await expect(modal.getByLabel('Item name')).toHaveValue('');
    await expect(
      modal.getByLabel(/Calculate Service Charge/),
    ).not.toBeChecked();
  });
});

test.describe('discounts', () => {
  test('a negative item reduces everyone’s share', async ({ page }) => {
    await buildBill(
      page,
      [
        { name: 'Pizza', price: 300 },
        { name: 'Coupon', price: -100 },
      ],
      [{ name: 'Alice' }, { name: 'Bob' }],
    );
    await goToResult(page);
    await expect(resultTotal(page)).toContainText('200.00');
    await expect(payerSummary(page, 'Alice')).toContainText('100.00');
  });

  test('shows 0 when the bill total is not positive', async ({ page }) => {
    await buildBill(
      page,
      [
        { name: 'Pizza', price: 100 },
        { name: 'Coupon', price: -150 },
      ],
      [{ name: 'Alice' }],
    );
    await goToResult(page);
    await expect(resultTotal(page)).toHaveText('0');
    await expect(payerSummary(page, 'Alice')).toContainText(/Alice\s*0$/);
  });
});

test('editing a mapped item updates the result', async ({ page }) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 300 }],
    [{ name: 'Alice' }, { name: 'Bob' }],
  );
  await page.goto('/');
  const modal = await openEditItem(page, 'Pizza');
  await modal.getByLabel(/Unit Price/).fill('500');
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();

  await openTab(page, 'Item');
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await expect(resultTotal(page)).toContainText('500.00');
  await expect(payerSummary(page, 'Alice')).toContainText('250.00');
});
