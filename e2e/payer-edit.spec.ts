import { expect, test } from './fixtures';
import {
  addPayer,
  buildBill,
  goToMapping,
  goToResult,
  mappingCard,
  openEditPayer,
  openTab,
  payerSummary,
  tableRow,
  tableRows,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('requires a payer name', async ({ page }) => {
  await openTab(page, 'Payer');
  await page.getByRole('button', { name: 'Add payer' }).click();
  const modal = page.getByRole('dialog', { name: 'Add new payer' });
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal.getByText('Please input payer name')).toBeVisible();
  await expect(modal).toBeVisible();
});

test('renames a payer', async ({ page }) => {
  await addPayer(page, { name: 'Alice' });
  const modal = await openEditPayer(page, 'Alice');
  await expect(modal.getByLabel('Payer name')).toHaveValue('Alice');
  await modal.getByLabel('Payer name').fill('Alicia');
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();
  await expect(tableRows(page)).toHaveCount(1);
  await expect(tableRow(page, 'Alicia')).toHaveCount(1);
});

test('a renamed payer keeps their assignment', async ({ page }) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 300 }],
    [{ name: 'Alice' }, { name: 'Bob' }],
  );
  await page.goto('/');
  const modal = await openEditPayer(page, 'Alice');
  await modal.getByLabel('Payer name').fill('Alicia');
  await modal.getByRole('button', { name: 'Save' }).click();

  await goToMapping(page);
  await expect(mappingCard(page, 'Pizza')).toContainText('Alicia');
  await goToResult(page);
  await expect(payerSummary(page, 'Alicia')).toContainText('150.00');
});

test('a payer can bring several friends', async ({ page }) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 400 }],
    [{ name: 'Alice', friends: ['Dave', 'Erin', 'Frank'] }],
  );
  await expect(mappingCard(page, 'Pizza')).toContainText(
    /Alice.*Dave.*Erin.*Frank/,
  );
  await goToResult(page);
  // 400 split 4 ways, and Alice pays for all four shares
  await expect(payerSummary(page, 'Alice')).toContainText('400.00');
  for (const friend of ['Dave', 'Erin', 'Frank']) {
    await expect(
      page.locator('#bill-ref-element').getByText(friend, { exact: true }),
    ).toBeVisible();
  }
});

test('removing one of several friends keeps the others', async ({ page }) => {
  await buildBill(
    page,
    [{ name: 'Pizza', price: 300 }],
    [{ name: 'Alice', friends: ['Dave', 'Erin'] }],
  );
  await page.goto('/');
  const modal = await openEditPayer(page, 'Alice');
  const friendRow = modal
    .locator('.ant-flex')
    .filter({ has: page.locator('input[value="Dave"]') });
  await friendRow.getByRole('button').click();
  await expect(modal.getByPlaceholder('Friend name')).toHaveCount(1);
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();

  await goToMapping(page);
  await expect(mappingCard(page, 'Pizza')).not.toContainText('Dave');
  await expect(mappingCard(page, 'Pizza')).toContainText('Erin');
  await goToResult(page);
  // Alice and Erin split 300, and Dave is gone
  await expect(payerSummary(page, 'Alice')).toContainText('300.00');
  await expect(
    page.locator('#bill-ref-element').getByText('Dave', { exact: true }),
  ).toHaveCount(0);
});

test('adding a friend to an assigned payer does not auto-assign them', async ({
  page,
}) => {
  await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
  await page.goto('/');
  const modal = await openEditPayer(page, 'Alice');
  await modal.getByLabel('a friend came with').check();
  await modal.getByRole('button', { name: 'Add friend' }).click();
  await modal.getByPlaceholder('Friend name').fill('Dave');
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(tableRow(page, 'Alice')).toContainText('and friend');

  await goToMapping(page);
  await expect(mappingCard(page, 'Pizza')).not.toContainText('Dave');
});

test('edit modal shows existing friends', async ({ page }) => {
  await addPayer(page, { name: 'Alice', friends: ['Dave'] });
  const modal = await openEditPayer(page, 'Alice');
  await expect(modal.getByLabel('a friend came with')).toBeChecked();
  await expect(modal.getByPlaceholder('Friend name')).toHaveValue('Dave');
});
