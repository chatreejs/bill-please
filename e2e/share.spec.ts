import { expect, test } from './fixtures';
import { browserToday, buildBill, goToResult } from './helpers';

test.describe('on mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Headless Chromium has no Web Share API, so record what the app shares
    await page.addInitScript(() => {
      const w = window as unknown as { __shared?: unknown };
      Object.defineProperty(navigator, 'canShare', { value: () => true });
      Object.defineProperty(navigator, 'share', {
        value: (data: { title: string; files: File[] }) => {
          w.__shared = {
            title: data.title,
            files: data.files.map((f) => ({ type: f.type, size: f.size })),
          };
          return Promise.resolve();
        },
      });
    });
  });

  test('shares the bill as a JPEG', async ({ page }) => {
    await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
    await goToResult(page);
    await expect(
      page.getByRole('button', { name: 'Download this bill' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Share' }).click();

    const today = await browserToday(page);
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __shared?: unknown }).__shared,
        ),
      )
      .toMatchObject({
        title: `bill-${today}.jpeg`,
        files: [{ type: 'image/jpeg' }],
      });
  });

  test('share button only shows on the result page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Share' })).toHaveCount(0);
  });
});

test.describe('on desktop', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    isMobile: false,
    hasTouch: false,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  });

  test('downloads the bill as a JPEG named after the title', async ({
    page,
  }) => {
    await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
    await page.goto('/');
    const title = page.getByRole('heading', { level: 3 });
    await title.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByRole('textbox').fill('Friday dinner');
    await page.getByRole('textbox').press('Enter');
    await page.getByRole('button', { name: 'Next' }).click();
    await goToResult(page);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download this bill' }).click();
    const download = await downloadPromise;
    // Spaces become dashes
    expect(download.suggestedFilename()).toBe('bill-Friday-dinner.jpeg');
  });

  test('leaves the page as it was after making the image', async ({ page }) => {
    await buildBill(page, [{ name: 'Pizza', price: 300 }], [{ name: 'Alice' }]);
    await goToResult(page);
    await page.getByRole('button', { name: 'Bank account' }).click();
    await page
      .locator('.ant-select')
      .filter({ has: page.getByRole('combobox', { name: 'Bank' }) })
      .click();
    await page
      .locator('.ant-select-item-option')
      .getByText('SCB', { exact: true })
      .click();
    await page.getByLabel('Account number', { exact: true }).fill('1234567890');
    await page.getByRole('button', { name: 'Save' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download this bill' }).click();
    await downloadPromise;
    // The off-screen copy is gone, and the page keeps its buttons
    await expect(page.locator('.bank-account-number')).toHaveCount(1);
    await expect(page.locator('.ant-typography-copy')).toBeVisible();
    await expect(page.getByText('Change bank account')).toBeVisible();
  });
});
