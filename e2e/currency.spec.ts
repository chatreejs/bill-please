import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import {
  buildBill,
  chooseOption,
  goToResult,
  payerSummary,
  resultTotal,
  waitForAnimations,
} from './helpers';

const settings = (page: Page) => page.locator('.ant-collapse-content');

const openCurrencySettings = async (page: Page) => {
  await page.getByText('Currency Settings').click();
  await expect(settings(page).getByText('Base Currency:')).toBeVisible();
  await waitForAnimations(page);
};

const addRate = async (page: Page, currency: string, rate: number) => {
  await settings(page)
    .getByRole('button', { name: 'Add Exchange Rate' })
    .click();
  await expect(settings(page).getByPlaceholder('Rate')).toBeVisible();
  await chooseOption(
    page,
    settings(page)
      .locator('.ant-select')
      .filter({ hasText: 'Target Currency' }),
    currency,
  );
  await settings(page).getByPlaceholder('Rate').fill(String(rate));
  await settings(page).getByRole('button', { name: 'Save' }).click();
};

const displaySelect = (page: Page) =>
  page.locator('#bill-ref-element .ant-select');

test.beforeEach(async ({ page }) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 300 }],
    [{ name: 'Alice' }, { name: 'Bob' }],
  );
  await page.goto('/');
  await openCurrencySettings(page);
});

test('defaults to THB with no display currency picker', async ({ page }) => {
  await expect(settings(page).locator('.ant-select').first()).toContainText(
    'THB (฿)',
  );
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await expect(resultTotal(page)).toHaveText('฿ 300.00');
  await expect(displaySelect(page)).toHaveCount(0);
});

test('changing the base currency changes the symbol', async ({ page }) => {
  await chooseOption(
    page,
    settings(page).locator('.ant-select').first(),
    'USD ($)',
  );
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await expect(resultTotal(page)).toHaveText('$ 300.00');
  await expect(payerSummary(page, 'Alice')).toContainText('$ 150.00');
});

test('adds and removes exchange rates', async ({ page }) => {
  await addRate(page, 'USD ($)', 0.03);
  await expect(settings(page).getByText('1 THB = 0.03 USD')).toBeVisible();
  await addRate(page, 'JPY (¥)', 4.2);
  await expect(settings(page).getByText('1 THB = 4.2 JPY')).toBeVisible();

  await settings(page)
    .locator('.ant-tag')
    .filter({ hasText: 'USD' })
    .locator('.ant-tag-close-icon')
    .click();
  await expect(settings(page).getByText('1 THB = 0.03 USD')).toHaveCount(0);
  await expect(settings(page).getByText('1 THB = 4.2 JPY')).toBeVisible();
});

test('Save stays disabled until currency and rate are set', async ({
  page,
}) => {
  await settings(page)
    .getByRole('button', { name: 'Add Exchange Rate' })
    .click();
  const save = settings(page).getByRole('button', { name: 'Save' });
  await expect(save).toBeDisabled();
  await settings(page).getByPlaceholder('Rate').fill('30');
  await expect(save).toBeDisabled();
  await chooseOption(
    page,
    settings(page)
      .locator('.ant-select')
      .filter({ hasText: 'Target Currency' }),
    'USD ($)',
  );
  await expect(save).toBeEnabled();

  await settings(page).getByRole('button', { name: 'Cancel' }).click();
  await expect(settings(page).locator('.ant-tag')).toHaveCount(0);
});

test('a currency with a rate is not offered again', async ({ page }) => {
  await addRate(page, 'USD ($)', 0.03);
  await settings(page)
    .getByRole('button', { name: 'Add Exchange Rate' })
    .click();
  await settings(page)
    .locator('.ant-select')
    .filter({ hasText: 'Target Currency' })
    .click();
  const options = page.locator(
    '.ant-select-dropdown:visible .ant-select-item-option',
  );
  await expect(options.filter({ hasText: 'JPY' })).toHaveCount(1);
  await expect(options.filter({ hasText: 'USD' })).toHaveCount(0);
  await expect(options.filter({ hasText: 'THB' })).toHaveCount(0);
});

test('changing the base currency clears exchange rates', async ({ page }) => {
  await addRate(page, 'USD ($)', 0.03);
  await chooseOption(
    page,
    settings(page).locator('.ant-select').first(),
    'EUR (€)',
  );
  await expect(settings(page).locator('.ant-tag')).toHaveCount(0);
});

test('converts the result into the display currency', async ({ page }) => {
  await addRate(page, 'USD ($)', 0.03);
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);

  await expect(resultTotal(page)).toHaveText('฿ 300.00');
  await chooseOption(page, displaySelect(page), 'USD ($)');
  // 300 × 0.03 = 9; 150 × 0.03 = 4.50
  await expect(resultTotal(page)).toHaveText('$ 9.00');
  await expect(payerSummary(page, 'Alice')).toContainText('$ 4.50');
  await expect(page.locator('#bill-ref-element')).toContainText(
    /Pizza\s*\$ 4\.50/,
  );

  await chooseOption(page, displaySelect(page), 'THB (฿)');
  await expect(resultTotal(page)).toHaveText('฿ 300.00');
});

test('removing the displayed rate falls back to the base currency', async ({
  page,
}) => {
  await addRate(page, 'USD ($)', 0.03);
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await chooseOption(page, displaySelect(page), 'USD ($)');

  await page.goto('/');
  await openCurrencySettings(page);
  await settings(page).locator('.ant-tag-close-icon').click();
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await expect(resultTotal(page)).toHaveText('฿ 300.00');
  await expect(displaySelect(page)).toHaveCount(0);
});

test('converted amounts are rounded to 2 decimals', async ({ page }) => {
  await addRate(page, 'USD ($)', 0.0287);
  await page.getByRole('button', { name: 'Next' }).click();
  await goToResult(page);
  await chooseOption(page, displaySelect(page), 'USD ($)');
  // 300 × 0.0287 = 8.61; 150 × 0.0287 = 4.305 → 4.31
  await expect(resultTotal(page)).toHaveText('$ 8.61');
  await expect(payerSummary(page, 'Alice')).toContainText('$ 4.31');
});
