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
  await expect(page.getByText('Choose how to get paid')).toBeVisible();
  await expect(page.getByText('Change how to get paid')).toHaveCount(0);
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

test('takes digits only in the PromptPay ID, up to 15', async ({ page }) => {
  await choosePromptPay(page);
  const input = page.locator('#promptPayId');
  await input.pressSequentially('08a1-234 5678');
  await expect(input).toHaveValue('0812345678');
  await expect(input).toHaveAttribute('inputmode', 'numeric');

  // Pasted text loses everything that is not a digit
  await input.fill('081-234-5678-90123-4567');
  await expect(input).toHaveValue('081234567890123');
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
  await page.getByText('Change how to get paid').click();
  await expect(page.getByText('Choose how to get paid')).toBeVisible();
});

test.describe('bank account', () => {
  const chooseBankAccount = (page: Page) =>
    page.getByRole('button', { name: 'Bank account' }).click();

  const selectBank = async (page: Page, name: string) => {
    // The selected bank covers the combobox input, so click the select box
    await page
      .locator('.ant-select')
      .filter({ has: page.getByRole('combobox', { name: 'Bank' }) })
      .click();
    await page
      .locator('.ant-select-item-option')
      .getByText(name, { exact: true })
      .click();
  };

  const accountNumber = (page: Page) =>
    page.getByLabel('Account number', { exact: true });

  const formatError = (page: Page) =>
    page.getByText('Invalid account number format');

  test('formats the number with dashes', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('1234567890');
    await expect(accountNumber(page)).toHaveValue('123-4-56789-0');

    await accountNumber(page).fill('123456789012345');
    await expect(accountNumber(page)).toHaveValue('123-4-56789-012345');
  });

  test('takes digits only, up to 19 characters', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).pressSequentially('12a3-4b5678901234567890');
    await expect(accountNumber(page)).toHaveValue('123-4-56789-0123456');
    await expect(accountNumber(page)).toHaveAttribute('maxlength', '19');
  });

  test('checks the number when the box loses focus', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('12345');
    // No error while typing
    await expect(formatError(page)).toHaveCount(0);

    await accountNumber(page).blur();
    await expect(formatError(page)).toBeVisible();

    // Fixing the number clears the error
    await accountNumber(page).fill('1234567890');
    await expect(formatError(page)).toHaveCount(0);
  });

  test('shows the bank logo', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    const logo = page.locator('.ant-select-selector img');
    await expect(logo).toHaveAttribute('src', '/banks/KBANK.png');
    await expect
      .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
  });

  test('loads a logo for every bank', async ({ page }) => {
    await chooseBankAccount(page);
    await page
      .locator('.ant-select')
      .filter({ has: page.getByRole('combobox', { name: 'Bank' }) })
      .click();
    const logos = page.locator('.ant-select-item-option img');
    await expect(logos).toHaveCount(19);
    await expect
      .poll(() =>
        logos.evaluateAll((imgs: HTMLImageElement[]) =>
          imgs.filter((img) => img.naturalWidth === 0).map((img) => img.src),
        ),
      )
      .toEqual([]);
  });

  test('offers CLICX with its logo and 10-digit numbers', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'CLICX');
    const logo = page.locator('.ant-select-selector img');
    await expect(logo).toHaveAttribute('src', '/banks/CLICX.png');
    await expect
      .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);

    await accountNumber(page).fill('123456789');
    await accountNumber(page).blur();
    await expect(formatError(page)).toBeVisible();
    await accountNumber(page).fill('1234567890');
    await expect(formatError(page)).toHaveCount(0);
  });

  test('checks the number when a tap outside keeps the box focused', async ({
    page,
  }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('12345');
    await expect(accountNumber(page)).toBeFocused();

    // iPhone Safari sends the tap but leaves the box focused
    await page.getByText('Expense List').dispatchEvent('pointerdown');
    await expect(accountNumber(page)).not.toBeFocused();
    await expect(formatError(page)).toBeVisible();
  });

  test('checks the number when the keyboard closes', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('12345');
    const size = page.viewportSize() ?? { width: 412, height: 839 };

    // The keyboard opens and closes, and the box keeps its focus
    const viewportHeight = () =>
      page.evaluate(() => window.visualViewport?.height ?? 0);
    await page.setViewportSize({ ...size, height: size.height - 300 });
    await expect.poll(viewportHeight).toBeLessThan(size.height - 200);
    await page.setViewportSize(size);
    await expect(accountNumber(page)).not.toBeFocused();
    await expect(formatError(page)).toBeVisible();
  });

  test('shows the error in the new language', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('12345');
    await accountNumber(page).blur();
    await expect(formatError(page)).toBeVisible();

    await page.getByText('English (US)').click();
    await page.getByRole('menuitem', { name: 'ภาษาไทย' }).click();
    await expect(page.getByText('รูปแบบเลขที่บัญชีไม่ถูกต้อง')).toBeVisible();
    await expect(formatError(page)).toHaveCount(0);
  });

  test('labels the copy button in the new language', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'SCB');
    await accountNumber(page).fill('1234567890');
    await page.getByRole('button', { name: 'Save' }).click();
    const copyButton = page.locator('.ant-typography-copy');
    await expect(copyButton).toHaveAttribute(
      'aria-label',
      'Copy account number',
    );

    await page.getByText('English (US)').click();
    await page.getByRole('menuitem', { name: 'ภาษาไทย' }).click();
    await expect(copyButton).toHaveAttribute('aria-label', 'คัดลอกเลขที่บัญชี');
  });

  test('checks the number again when the bank changes', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'KBANK');
    await accountNumber(page).fill('1234567890');
    await accountNumber(page).blur();
    await expect(formatError(page)).toHaveCount(0);

    // GSB numbers have 12 to 15 digits
    await selectBank(page, 'GSB');
    await expect(formatError(page)).toBeVisible();
    await expect(accountNumber(page)).toHaveValue('123-4-56789-0');

    await selectBank(page, 'SCB');
    await expect(formatError(page)).toHaveCount(0);
  });

  test('requires a bank and a full account number', async ({ page }) => {
    await chooseBankAccount(page);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Please select a bank')).toBeVisible();
    await expect(
      page.getByText('Please enter the account number'),
    ).toBeVisible();

    await selectBank(page, 'KTB');
    await accountNumber(page).fill('12345');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(formatError(page)).toBeVisible();
  });

  test('shows the saved account and remembers it', async ({ page }) => {
    await chooseBankAccount(page);
    await selectBank(page, 'SCB');
    await accountNumber(page).fill('1234567890');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Transfer to')).toBeVisible();
    await expect(page.getByText('SCB', { exact: true })).toBeVisible();
    await expect(page.locator('.bank-account-number')).toContainText(
      '123-4-56789-0',
    );

    await page.reload();
    await chooseBankAccount(page);
    // The saved account skips the form
    await expect(page.locator('.bank-account-number')).toContainText(
      '123-4-56789-0',
    );

    await page.getByText('Change bank account').click();
    await expect(accountNumber(page)).toHaveValue('123-4-56789-0');
  });
});
