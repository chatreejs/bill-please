import { readFileSync } from 'fs';

import { expect, test } from './fixtures';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };

test.describe('update prompt', () => {
  test('shows when a newer release is tagged', async ({ page, githubTags }) => {
    // As text, v0.9.9 sorts after v0.10.0, so the app has to compare numbers
    githubTags.set(['0.9.9', '99.0.0', '0.10.0']);
    await page.goto('/');
    const modal = page.getByRole('dialog', {
      name: `A new version available (v${version} → v99.0.0)`,
    });
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('button', { name: 'Update Now!' }),
    ).toBeVisible();
  });

  test('a pre-release is prompted for its final release', async ({
    page,
    githubTags,
  }) => {
    test.skip(
      !version.includes('-'),
      'Only meaningful while package.json is a pre-release',
    );
    // For example, running 0.11.0-beta.1 when 0.11.0 is tagged
    const release = version.split('-')[0];
    githubTags.set([release]);
    await page.goto('/');
    await expect(
      page.getByRole('dialog', {
        name: `A new version available (v${version} → v${release})`,
      }),
    ).toBeVisible();
  });

  test('stays hidden when no newer release exists', async ({
    page,
    githubTags,
  }) => {
    githubTags.set(['0.1.0', '0.9.9']);
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Add item' })).toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByText('A new version available')).toHaveCount(0);
  });

  test('ignores non-numeric tags', async ({ page, githubTags }) => {
    githubTags.set(['0.1.0', 'nightly', '99.0.0-rc.1']);
    await page.goto('/');
    await page.waitForTimeout(500);
    await expect(page.getByText('A new version available')).toHaveCount(0);
  });
});

test('ten quick taps on the logo open debug info', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByText('Bill Please', { exact: true });
  for (let i = 0; i < 10; i++) await logo.click({ delay: 0 });

  const modal = page.getByRole('dialog', { name: 'Debug Info' });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(`v${version}`);
  await expect(modal).toContainText('Asia/Bangkok');
});

test('a few taps do not open debug info', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByText('Bill Please', { exact: true });
  for (let i = 0; i < 3; i++) await logo.click();
  await expect(page.getByRole('dialog', { name: 'Debug Info' })).toHaveCount(0);
});

test('shows the LOCAL env badge outside production', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('LOCAL', { exact: true })).toBeVisible();
});

test('tapping the footer version toggles the build number', async ({
  page,
}) => {
  await page.goto('/');
  const footerVersion = page.getByText(
    new RegExp(`^v${version.replace(/\./g, '\\.')}`),
  );
  await expect(footerVersion).toHaveText(`v${version}`);
  await footerVersion.click();
  await expect(footerVersion).toHaveText(
    new RegExp(`^v${version.replace(/\./g, '\\.')} \\(\\d+\\)$`),
  );
  await footerVersion.click();
  await expect(footerVersion).toHaveText(`v${version}`);
});
