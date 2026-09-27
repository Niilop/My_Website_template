import { expect, test } from '@playwright/test';

test('works page groups works by series and links to work pages', async ({ page }) => {
  await page.goto('/works/');
  const seriesNav = page.getByRole('navigation', { name: 'Series' });
  const firstSeries = seriesNav.getByRole('link').first();
  test.skip((await firstSeries.count()) === 0, 'fewer than two groups');

  await firstSeries.click();
  await expect(page).toHaveURL(/#.+/);

  const firstWork = page.locator('main [data-gallery] a').first();
  await firstWork.click();
  await expect(page).toHaveURL(/\/works\/[^/]+\/$/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Medium', { exact: true })).toBeVisible();
});

test('work pages link to neighbouring works', async ({ page }) => {
  await page.goto('/works/');
  await page.locator('main [data-gallery] a').first().click();
  const pager = page.getByRole('navigation', { name: 'More works' });
  test.skip((await pager.count()) === 0, 'only one work');
  const next = pager.getByRole('link').last();
  const title = (await next.textContent())?.replace(/^(Previous|Next)/, '').trim() ?? '';
  await next.click();
  await expect(page.locator('h1')).toHaveText(title);
});
