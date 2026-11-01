import { expect, Locator, Page } from '@playwright/test';

export interface ItemInput {
  name: string;
  price: number;
  quantity?: number;
  /** Service charge percentage. Leave it out to keep the checkbox unticked. */
  service?: number;
  /** VAT percentage. Leave it out to keep the checkbox unticked. */
  vat?: number;
}

export interface PayerInput {
  name: string;
  friends?: string[];
}

/**
 * Wait for antd open/expand animations to finish. Some components reset
 * their state in an effect when they open, so clicking mid-animation can be
 * undone.
 */
export const waitForAnimations = async (page: Page) => {
  await expect(
    page.locator(
      '.ant-zoom-appear, .ant-zoom-enter, .ant-motion-collapse, .ant-slide-up-enter',
    ),
  ).toHaveCount(0);
};

export const openTab = async (page: Page, tab: 'Item' | 'Payer') => {
  await page.getByRole('tab', { name: tab }).click();
};

export const addItem = async (page: Page, item: ItemInput) => {
  await openTab(page, 'Item');
  await page.getByRole('button', { name: 'Add item' }).click();
  const modal = page.getByRole('dialog', { name: 'Add new item' });
  await modal.getByLabel('Item name').fill(item.name);
  await modal.getByLabel(/Unit Price/).fill(String(item.price));
  await modal.getByLabel('Quantity').fill(String(item.quantity ?? 1));

  if (item.service !== undefined) {
    await modal.getByLabel(/Calculate Service Charge/).check();
    const input = modal.locator('#itemListForm_servicePercentage');
    await input.fill(String(item.service));
  }
  if (item.vat !== undefined) {
    await modal.getByLabel(/Calculate VAT/).check();
    const input = modal.locator('#itemListForm_vatPercentage');
    await input.fill(String(item.vat));
  }

  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();
};

export const addPayer = async (page: Page, payer: PayerInput) => {
  await openTab(page, 'Payer');
  await page.getByRole('button', { name: 'Add payer' }).click();
  const modal = page.getByRole('dialog', { name: 'Add new payer' });
  await modal.getByLabel('Payer name').fill(payer.name);

  if (payer.friends?.length) {
    await modal.getByLabel('a friend came with').check();
    const friendInputs = modal.getByPlaceholder('Friend name');
    for (const friend of payer.friends) {
      await modal.getByRole('button', { name: 'Add friend' }).click();
      await friendInputs.last().fill(friend);
    }
  }

  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();
};

/** Rows of the table in the active Home tab (Item or Payer). */
export const tableRows = (page: Page) =>
  page.locator('.ant-tabs-tabpane-active .ant-table-row');

/** A row in the active Home tab's table. */
export const tableRow = (page: Page, name: string) =>
  tableRows(page).filter({ hasText: name });

/** Assign an item on the mapping page to the given people (or everyone). */
export const assignItem = async (
  page: Page,
  itemName: string,
  people: string[] | 'all',
) => {
  await page.locator('.ant-card').filter({ hasText: itemName }).click();
  const modal = page.getByRole('dialog', {
    name: `Select payer for ${itemName}`,
  });
  await waitForAnimations(page);
  if (people === 'all') {
    await modal.getByRole('button', { name: 'Select all' }).click();
    await expect(
      modal.getByRole('button', { name: 'Deselect all' }),
    ).toBeVisible();
  } else {
    for (const person of people) {
      await modal.getByText(person, { exact: true }).click();
    }
  }
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();
};

export const goToMapping = async (page: Page) => {
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/\/mapping$/);
};

export const goToResult = async (page: Page) => {
  await page.getByRole('button', { name: 'Summarize' }).click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('Expense List')).toBeVisible();
};

/** The bill total shown at the top of the Result page. */
export const resultTotal = (page: Page): Locator =>
  page
    .locator('#bill-ref-element .text-right')
    .filter({ hasText: 'Total' })
    .locator('.value');

/** A payer's collapsed header row (name + amount) on the Result page. */
export const payerSummary = (page: Page, name: string): Locator =>
  page
    .locator('#bill-ref-element .ant-collapse-header')
    .filter({ has: page.getByText(name, { exact: true }) });

/** Pick an option from an antd Select. */
export const chooseOption = async (
  page: Page,
  select: Locator,
  label: string,
) => {
  await select.click();
  await page
    .locator('.ant-select-dropdown:visible .ant-select-item-option')
    .filter({ hasText: label })
    .click();
};

export const openEditItem = async (page: Page, name: string) => {
  await openTab(page, 'Item');
  await tableRow(page, name).click();
  return page.getByRole('dialog', { name: 'Edit item' });
};

export const openEditPayer = async (page: Page, name: string) => {
  await openTab(page, 'Payer');
  await tableRow(page, name).click();
  return page.getByRole('dialog', { name: 'Edit payer' });
};

/** The item card on the mapping page. */
export const mappingCard = (page: Page, itemName: string) =>
  page.locator('.ant-card').filter({ hasText: itemName });

/** Add the items and payers, then assign every item to everyone. */
export const buildBill = async (
  page: Page,
  items: ItemInput[],
  payers: PayerInput[],
) => {
  await page.goto('/');
  for (const item of items) await addItem(page, item);
  for (const payer of payers) await addPayer(page, payer);
  await goToMapping(page);
  for (const item of items) await assignItem(page, item.name, 'all');
};
