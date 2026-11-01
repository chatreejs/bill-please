import { expect, test } from './fixtures';
import { buildBill, goToResult } from './helpers';

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

    const today = new Date().toLocaleDateString('sv-SE');
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
});
