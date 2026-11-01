import { expect, test } from './fixtures';

import {
  addItem,
  addPayer,
  assignItem,
  goToMapping,
  goToResult,
  payerSummary,
  resultTotal,
} from './helpers';

test('splits a bill from items to result', async ({ page }) => {
  await page.goto('/');

  await addItem(page, { name: 'Pizza', price: 300 });
  await addPayer(page, { name: 'Alice' });
  await addPayer(page, { name: 'Bob' });

  await goToMapping(page);
  await assignItem(page, 'Pizza', 'all');
  await goToResult(page);

  await expect(resultTotal(page)).toContainText('300.00');
  await expect(payerSummary(page, 'Alice')).toContainText('150.00');
  await expect(payerSummary(page, 'Bob')).toContainText('150.00');
});
