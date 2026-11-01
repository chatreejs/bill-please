import { readFileSync } from 'fs';

import { expect, test } from './fixtures';

const th = JSON.parse(
  readFileSync(
    new URL('../public/locales/th/translation.json', import.meta.url),
    'utf8',
  ),
) as { home: { itemList: { button: { add: string } } } };
const thAddItem = th.home.itemList.button.add;

test('switches to Thai and remembers it', async ({ page }) => {
  await page.goto('/');
  await page.getByText('English (US)').click();
  await page.getByRole('menuitem', { name: 'ภาษาไทย' }).click();

  await expect(
    page.getByRole('button', { name: new RegExp(`${thAddItem}$`) }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: new RegExp(`${thAddItem}$`) }),
  ).toBeVisible();
  await expect(page.getByText('ภาษาไทย')).toBeVisible();

  await page.getByText('ภาษาไทย').click();
  await page.getByRole('menuitem', { name: 'English (US)' }).click();
  await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
});

test.describe('with a Thai browser', () => {
  test.use({ locale: 'th-TH' });

  test('starts in Thai', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: new RegExp(`${thAddItem}$`) }),
    ).toBeVisible();
  });
});

test.describe('with an unsupported browser language', () => {
  test.use({ locale: 'fr-FR' });

  test('falls back to English', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
  });
});
