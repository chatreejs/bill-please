import { expect, test } from './fixtures';

import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
} from './helpers';

test('defaults the bill title to today', async ({ page }) => {
  await page.goto('/');
  const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(today);
});

test('renames the bill and keeps the name through to the result', async ({
  page,
}) => {
  await page.goto('/');

  const title = page.getByRole('heading', { level: 3 });
  await title.getByRole('button', { name: 'Edit', exact: true }).click();
  const input = page.getByRole('textbox');
  await input.fill('Friday dinner');
  await input.press('Enter');
  await expect(title).toHaveText('Friday dinner');

  // redux-persist saves it to localStorage
  await page.reload();
  await expect(title).toHaveText('Friday dinner');

  await addItem(page, { name: 'Pizza', price: 300 });
  await addPayer(page, { name: 'Alice' });
  await goToMapping(page);
  await assignItem(page, 'Pizza', 'all');
  await goToResult(page);

  await expect(
    page.locator('#bill-ref-element').getByRole('heading', { level: 3 }),
  ).toHaveText('Friday dinner');
});

test('clearing the bill resets the title to today', async ({ page }) => {
  await page.goto('/');
  const title = page.getByRole('heading', { level: 3 });
  await title.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('textbox').fill('Friday dinner');
  await page.getByRole('textbox').press('Enter');
  await addItem(page, { name: 'Pizza', price: 300 });

  await page.getByRole('button', { name: 'Clear bill data' }).click();
  await page
    .getByRole('tooltip')
    .getByRole('button', { name: 'Clear data' })
    .click();

  const today = new Date().toLocaleDateString('sv-SE');
  await expect(title).toHaveText(today);
  await expect(page.getByText('Pizza')).toBeHidden();
});
