import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { addItem, tableRow, tableRows } from './helpers';

const RECEIPT = new URL('./assets/receipt.png', import.meta.url).pathname;

const addFromBill = (page: Page) =>
  page.getByRole('button', { name: 'Add from bill' });

const importModal = (page: Page) =>
  page.getByRole('dialog', { name: 'Add from bill' });

const uploadReceipt = (page: Page) =>
  page.locator('input[type="file"]').setInputFiles(RECEIPT);

const SCANNED = {
  items: [
    {
      name: 'Pad Thai',
      quantity: 2,
      price: 60,
      servicePercentage: 10,
      vatPercentage: 7,
    },
    { name: '  Coke ', quantity: 1, price: '20' },
    // normalizeReceiptItems drops these
    { name: '', quantity: 1, price: 5 },
    { name: 'No price', quantity: 1 },
    { name: 'Bad price', quantity: 1, price: 'abc' },
  ],
};

test('button is disabled when the scan service is down', async ({
  page,
  receiptApi,
}) => {
  receiptApi.setHealthy(false);
  await page.goto('/');
  await expect(addFromBill(page)).toBeDisabled();
});

test.describe('with the scan service up', () => {
  test.beforeEach(async ({ page, receiptApi }) => {
    receiptApi.setHealthy(true);
    await page.goto('/');
    await expect(addFromBill(page)).toBeEnabled();
  });

  test('previews scanned items and imports them', async ({
    page,
    receiptApi,
  }) => {
    let body = '';
    receiptApi.onScan(async (route) => {
      body = route.request().postData() ?? '';
      await route.fulfill({ json: SCANNED });
    });
    await uploadReceipt(page);

    const modal = importModal(page);
    await expect(modal).toContainText('Review the items read from your bill');
    expect(body).toContain('name="image"');
    // No Turnstile site key on this server, so no token is sent
    expect(body).not.toContain('cf-turnstile-response');

    const rows = modal.locator('.ant-table-row');
    await expect(rows).toHaveCount(2);
    // 120 + 12 service + (132 × 7%) 9.24 VAT
    await expect(rows.filter({ hasText: 'Pad Thai' })).toContainText(
      'Service Charge 10% · VAT 7%',
    );
    await expect(rows.filter({ hasText: 'Pad Thai' })).toContainText('141.24');
    await expect(rows.filter({ hasText: 'Coke' })).toContainText('20.00');
    await expect(modal).toContainText(/Total:\s*161\.24/);

    // Untick Coke
    await rows.filter({ hasText: 'Coke' }).getByRole('checkbox').uncheck();
    await expect(modal).toContainText(/Total:\s*141\.24/);
    await modal.getByRole('button', { name: 'Add 1 item(s)' }).click();
    await expect(modal).toBeHidden();

    await expect(tableRow(page, 'Pad Thai')).toContainText('141.24');
    await expect(tableRow(page, 'Coke')).toHaveCount(0);
  });

  test('appends to existing items', async ({ page, receiptApi }) => {
    await addItem(page, { name: 'Pizza', price: 300 });
    receiptApi.onScan((route) => route.fulfill({ json: SCANNED }));
    await uploadReceipt(page);
    await importModal(page)
      .getByRole('button', { name: 'Add 2 item(s)' })
      .click();
    await expect(tableRows(page)).toHaveCount(3);
    await expect(page.locator('.ant-tabs-tabpane-active')).toContainText(
      /Total:\s*461\.24/,
    );
  });

  test('no items selected disables import', async ({ page, receiptApi }) => {
    receiptApi.onScan((route) => route.fulfill({ json: SCANNED }));
    await uploadReceipt(page);
    const modal = importModal(page);
    await modal.locator('thead').getByRole('checkbox').uncheck();
    await expect(
      modal.getByRole('button', { name: 'Add 0 item(s)' }),
    ).toBeDisabled();
  });

  test('shows a loading state while scanning', async ({ page, receiptApi }) => {
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    receiptApi.onScan(async (route) => {
      await released;
      await route.fulfill({ json: SCANNED });
    });
    await uploadReceipt(page);

    const modal = importModal(page);
    await expect(modal).toContainText('Reading your bill');
    await expect(modal.getByRole('button', { name: /^Add \d/ })).toBeDisabled();
    release();
    await expect(modal.locator('.ant-table-row')).toHaveCount(2);
  });

  test('cancelling a running scan ignores its result', async ({
    page,
    receiptApi,
  }) => {
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    receiptApi.onScan(async (route) => {
      await released;
      await route.fulfill({ json: SCANNED });
    });
    await uploadReceipt(page);
    await importModal(page).getByRole('button', { name: 'Cancel' }).click();
    await expect(importModal(page)).toBeHidden();

    release();
    await page.waitForTimeout(500);
    await expect(importModal(page)).toBeHidden();
    await expect(tableRows(page)).toHaveCount(0);
  });

  test('shows an empty state when nothing is found', async ({
    page,
    receiptApi,
  }) => {
    receiptApi.onScan((route) => route.fulfill({ json: { items: [] } }));
    await uploadReceipt(page);
    const modal = importModal(page);
    await expect(modal).toContainText('No items found on this bill');
    await expect(
      modal.getByRole('button', { name: 'Add 0 item(s)' }),
    ).toBeDisabled();
  });

  test('treats a malformed response as empty', async ({ page, receiptApi }) => {
    receiptApi.onScan((route) => route.fulfill({ json: { foo: 'bar' } }));
    await uploadReceipt(page);
    await expect(importModal(page)).toContainText(
      'No items found on this bill',
    );
  });

  test('shows an error when the scan fails', async ({ page, receiptApi }) => {
    receiptApi.onScan((route) => route.fulfill({ status: 500 }));
    await uploadReceipt(page);
    await expect(
      page.getByText('Could not read the bill, please try again'),
    ).toBeVisible();
    await expect(importModal(page)).toBeHidden();
    await expect(tableRows(page)).toHaveCount(0);
  });

  test('can scan the same file twice', async ({ page, receiptApi }) => {
    let scans = 0;
    receiptApi.onScan((route) => {
      scans++;
      return route.fulfill({ json: SCANNED });
    });
    await uploadReceipt(page);
    await importModal(page)
      .getByRole('button', { name: 'Add 2 item(s)' })
      .click();
    await uploadReceipt(page);
    await importModal(page)
      .getByRole('button', { name: 'Add 2 item(s)' })
      .click();
    expect(scans).toBe(2);
    await expect(tableRows(page)).toHaveCount(4);
  });
});
