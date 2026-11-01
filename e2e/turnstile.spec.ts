/**
 * Runs against the second dev server (project "turnstile"), which has
 * VITE_APP_TURNSTILE_SITE_KEY set. Each test replaces Cloudflare's script with
 * a fake and picks its behaviour through window.__TS_MODE__.
 */
import { Page } from '@playwright/test';

import { expect, test } from './fixtures';

type Mode = 'pass' | 'fail' | 'interactive' | 'hang';

const FAKE_TURNSTILE = `
(() => {
  let n = 0;
  window.turnstile = {
    render(el, opts) {
      window.__TS_OPTS__ = {
        sitekey: opts.sitekey,
        action: opts.action,
        appearance: opts.appearance,
      };
      const run = () => {
        const mode = window.__TS_MODE__ || 'pass';
        if (mode === 'pass') {
          setTimeout(() => opts.callback('token-' + ++n), 200);
        } else if (mode === 'fail') {
          setTimeout(() => opts['error-callback']('110200'), 200);
        } else if (mode === 'interactive') {
          opts['before-interactive-callback']();
          el.innerHTML = '<button id="ts-widget">I am human</button>';
          el.querySelector('#ts-widget').onclick = () => {
            el.innerHTML = '';
            window.__TS_MODE__ = 'pass';
            opts.callback('token-' + ++n);
          };
        }
      };
      window.__TS_RUN__ = run;
      run();
      return 'widget-1';
    },
    reset() { window.__TS_RUN__ && window.__TS_RUN__(); },
    remove() {},
  };
})();
`;

const setup = async (page: Page, mode: Mode, scriptLoads = true) => {
  await page.addInitScript((m) => {
    (window as unknown as { __TS_MODE__: string }).__TS_MODE__ = m;
  }, mode);
  await page.route('https://challenges.cloudflare.com/turnstile/**', (route) =>
    scriptLoads
      ? route.fulfill({ contentType: 'text/javascript', body: FAKE_TURNSTILE })
      : route.abort(),
  );
  await page.goto('/');
};

const addFromBill = (page: Page) =>
  page.getByRole('button', { name: 'Add from bill' });
const verifying = (page: Page) => page.getByText("Verifying you're human");

test.beforeEach(({ receiptApi }) => {
  receiptApi.setHealthy(true);
});

test('shows a placeholder while verifying', async ({ page }) => {
  await setup(page, 'hang');
  await expect(verifying(page)).toBeVisible();
  await expect(addFromBill(page)).toHaveCount(0);
});

test('shows the button once verified', async ({ page }) => {
  await setup(page, 'pass');
  await expect(addFromBill(page)).toBeEnabled();
  await expect(verifying(page)).toHaveCount(0);

  const opts = await page.evaluate(
    () => (window as unknown as { __TS_OPTS__: unknown }).__TS_OPTS__,
  );
  expect(opts).toEqual({
    sitekey: 'e2e-site-key',
    action: 'receipt_scan',
    appearance: 'interaction-only',
  });
});

test('hides the button when the check fails', async ({ page }) => {
  await setup(page, 'fail');
  await expect(verifying(page)).toHaveCount(0);
  await expect(addFromBill(page)).toHaveCount(0);
  // Manual entry still works
  await expect(page.getByRole('button', { name: 'Add item' })).toBeEnabled();
});

test('hides the button when the script cannot load', async ({ page }) => {
  await setup(page, 'pass', false);
  await expect(verifying(page)).toHaveCount(0);
  await expect(addFromBill(page)).toHaveCount(0);
});

test('shows the challenge when Cloudflare wants interaction', async ({
  page,
}) => {
  await setup(page, 'interactive');
  await expect(
    page.getByText('Tap the check below to scan bills'),
  ).toBeVisible();
  await expect(addFromBill(page)).toHaveCount(0);

  await page.locator('#ts-widget').click();
  await expect(addFromBill(page)).toBeEnabled();
});

test('sends a fresh single-use token with each scan', async ({
  page,
  receiptApi,
}) => {
  const tokens: string[] = [];
  receiptApi.onScan(async (route) => {
    const body = route.request().postData() ?? '';
    tokens.push(
      /name="cf-turnstile-response"\r\n\r\n([^\r]+)/.exec(body)?.[1] ?? '',
    );
    await route.fulfill({
      json: { items: [{ name: 'Coke', quantity: 1, price: 20 }] },
    });
  });
  await setup(page, 'pass');
  const receipt = new URL('./assets/receipt.png', import.meta.url).pathname;
  const modal = page.getByRole('dialog', { name: 'Add from bill' });

  await addFromBill(page).waitFor();
  await page.locator('input[type="file"]').setInputFiles(receipt);
  await modal.getByRole('button', { name: 'Add 1 item(s)' }).click();
  await expect(modal).toBeHidden();

  await page.locator('input[type="file"]').setInputFiles(receipt);
  await modal.getByRole('button', { name: 'Add 1 item(s)' }).click();

  expect(tokens).toEqual(['token-1', 'token-2']);
});
