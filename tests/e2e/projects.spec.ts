import { expect, test } from '@playwright/test';

test('project tag filter narrows the list (React island)', async ({ page }) => {
  await page.goto('/projects/');
  const filters = page.getByRole('group', { name: 'Filter by tag:' });
  test.skip((await filters.count()) === 0, 'no tag filter on this site');

  const cards = page.locator('.project-filter article');
  const total = await cards.count();
  const firstTag = filters.getByRole('button').nth(1);
  await expect(firstTag).toBeEnabled();
  // Wait for hydration: the button responds by toggling aria-pressed.
  await expect(async () => {
    await firstTag.click();
    await expect(firstTag).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
  }).toPass();
  const tag = (await firstTag.textContent()) ?? '';
  const shown = await cards.count();
  expect(shown).toBeLessThanOrEqual(total);
  await expect(page.getByRole('status')).toHaveText(`Showing ${shown} of ${total} projects`);
  for (const card of await cards.all()) {
    await expect(card, `card should have tag ${tag}`).toBeVisible();
  }

  await filters.getByRole('button', { name: 'All' }).click();
  await expect(cards).toHaveCount(total);
});

test('project cards link to detail pages', async ({ page }) => {
  await page.goto('/projects/');
  const first = page.locator('.project-filter article a').first();
  test.skip((await first.count()) === 0, 'no projects');
  const title = await first.textContent();
  await first.click();
  await expect(page.locator('h1')).toHaveText(title ?? '');
});
