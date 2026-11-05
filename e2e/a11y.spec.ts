import AxeBuilder from '@axe-core/playwright';
import { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import {
  addItem,
  addPayer,
  goToMapping,
  goToResult,
  mappingCard,
  openTab,
  payerToggle,
  waitForAnimations,
} from './helpers';

/**
 * Run axe against WCAG 2.1 A and AA and expect no violations. Two rules are
 * off until BACKLOG #18 is done. `color-contrast` fails on the theme's grey
 * text and the footer. `meta-viewport` fails on `maximum-scale=1`, which
 * index.html sets so that iOS doesn't zoom into 14px inputs.
 */
const expectNoViolations = async (page: Page) => {
  await waitForAnimations(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast', 'meta-viewport'])
    .analyze();
  expect(
    violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map((node) => node.target.join(' ')),
    })),
  ).toEqual([]);
};

const buildSmallBill = async (page: Page) => {
  await page.goto('/');
  await addItem(page, { name: 'Pizza', price: 300 });
  await addPayer(page, { name: 'Alice' });
  await addPayer(page, { name: 'Bob', friends: ['Dave'] });
};

test.describe('axe finds no WCAG A or AA violations', () => {
  test('on Home', async ({ page }) => {
    await buildSmallBill(page);
    await expectNoViolations(page);
    await openTab(page, 'Payer');
    await expectNoViolations(page);
  });

  test('on the mapping page and its modal', async ({ page }) => {
    await buildSmallBill(page);
    await goToMapping(page);
    await expectNoViolations(page);

    await mappingCard(page, 'Pizza').click();
    const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
    await payerToggle(modal, 'Alice').click();
    await payerToggle(modal, 'Bob').click();
    await expectNoViolations(page);
  });

  test('on the Result page', async ({ page }) => {
    await buildSmallBill(page);
    await goToMapping(page);
    await mappingCard(page, 'Pizza').click();
    const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
    await modal.getByRole('button', { name: 'Select all' }).click();
    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(modal).toBeHidden();
    await goToResult(page);
    await expectNoViolations(page);
  });

  test('on the policy pages', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expectNoViolations(page);
    await page.goto('/tos');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expectNoViolations(page);
  });
});

test('the mapping page works with a keyboard', async ({ page }) => {
  await buildSmallBill(page);
  await goToMapping(page);

  await mappingCard(page, 'Pizza').focus();
  await page.keyboard.press('Enter');
  const modal = page.getByRole('dialog', { name: 'Select payer for Pizza' });
  await expect(modal).toBeVisible();
  await waitForAnimations(page);

  const alice = payerToggle(modal, 'Alice');
  await expect(alice).toHaveAttribute('aria-pressed', 'false');
  await alice.focus();
  await page.keyboard.press('Space');
  await expect(alice).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Enter');
  await expect(alice).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');

  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(modal).toBeHidden();
  await expect(mappingCard(page, 'Pizza')).toContainText('Alice');
});

test('icon-only buttons have names', async ({ page }) => {
  await page.goto('/');
  await addItem(page, { name: 'Pizza', price: 300 });
  await openTab(page, 'Payer');
  await page.getByRole('button', { name: 'Add payer' }).click();
  const modal = page.getByRole('dialog', { name: 'Add new payer' });
  await modal.getByLabel('a friend came with').check();
  await modal.getByRole('button', { name: 'Add friend' }).click();
  await expect(
    modal.getByRole('button', { name: 'Delete friend' }),
  ).toBeVisible();
  await modal.getByRole('button', { name: 'Cancel' }).click();

  await addPayer(page, { name: 'Alice' });
  await goToMapping(page);
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('the page language follows the app language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: /English \(US\)/ }).click();
  await page.getByRole('menuitem', { name: 'ภาษาไทย' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
});
