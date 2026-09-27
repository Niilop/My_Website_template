import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { sitemapPaths } from './helpers';

/** Opens the first sitemap page that has a gallery with viewer images. */
async function openGalleryPage(page: Page, paths: string[]) {
  for (const path of paths) {
    await page.goto(path);
    if ((await page.locator('[data-viewer-item]').count()) > 0) return path;
  }
  return null;
}

test('gallery viewer opens, navigates, closes, and restores focus', async ({ page, request }) => {
  const path = await openGalleryPage(page, await sitemapPaths(request));
  test.skip(path === null, 'no page with a gallery viewer');

  const items = page.locator('[data-viewer-item]');
  const gallery = page.locator('[data-gallery]').filter({ has: items.first() }).first();
  const viewerItems = gallery.locator('[data-viewer-item]');
  const count = await viewerItems.count();
  const dialog = gallery.locator('dialog[data-viewer]');
  const image = dialog.locator('[data-viewer-image]');

  const first = viewerItems.first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(image).toHaveAttribute('alt', (await first.getAttribute('data-alt')) ?? '');
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations).toEqual([]);

  if (count > 1) {
    await expect(dialog.locator('[data-viewer-counter]')).toHaveText(`1 / ${count}`);
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('[data-viewer-counter]')).toHaveText(`2 / ${count}`);
    await dialog.getByRole('button', { name: 'Previous image' }).click();
    await expect(dialog.locator('[data-viewer-counter]')).toHaveText(`1 / ${count}`);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(first).toBeFocused();
});
