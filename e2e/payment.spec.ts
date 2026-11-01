import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { buildBill, goToResult } from './helpers';

const choosePromptPay = (page: Page) =>
  page
    .getByRole('button')
    .filter({ has: page.getByAltText('prompt-pay') })
    .click();

const qrButton = (page: Page) => page.getByRole('button', { name: 'qrcode' });

test.beforeEach(async ({ page }) => {
  await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
  await goToResult(page);
});

test('asks for a payment method first', async ({ page }) => {
  await expect(page.getByText('Select your payment method')).toBeVisible();
  await expect(page.getByText('Change your payment method')).toHaveCount(0);
});

test('requires a PromptPay ID', async ({ page }) => {
  await choosePromptPay(page);
  await expect(
    page.getByText('Phone number or Thai National ID'),
  ).toBeVisible();
  await qrButton(page).click();
  await expect(page.getByText('This field is required')).toBeVisible();
});

test('generates a PromptPay QR code', async ({ page }) => {
  await choosePromptPay(page);
  await page.locator('#promptPayId').fill('0812345678');
  await qrButton(page).click();

  await expect(page.getByText('Scan QR Code to pay')).toBeVisible();
  await expect(page.locator('.ant-qrcode svg')).toBeVisible();
});

test('remembers the PromptPay ID', async ({ page }) => {
  await choosePromptPay(page);
  await page.locator('#promptPayId').fill('0812345678');
  await qrButton(page).click();
  await expect(page.getByText('Scan QR Code to pay')).toBeVisible();

  await page.reload();
  await choosePromptPay(page);
  // The saved ID skips the form and shows the QR code
  await expect(page.getByText('Scan QR Code to pay')).toBeVisible();

  await page.getByText('Change QR Code').click();
  await expect(page.locator('#promptPayId')).toHaveValue('0812345678');
});

test('can change the payment method back', async ({ page }) => {
  await choosePromptPay(page);
  await page.getByText('Change your payment method').click();
  await expect(page.getByText('Select your payment method')).toBeVisible();
});
