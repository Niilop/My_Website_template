import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { sitemapPaths } from './helpers';

test('every sitemap page renders with metadata and passes accessibility checks', async ({
  page,
  request,
}) => {
  const paths = await sitemapPaths(request);
  expect(paths).toContain('/');

  for (const path of paths) {
    await test.step(path, async () => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status(), `${path} status`).toBe(200);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/\S/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\//);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        /^https?:\/\//,
      );

      // Every image needs an alt attribute ('' is allowed for decorative images).
      await expect(page.locator('img:not([alt])')).toHaveCount(0);

      // Check both themes. Reload so no color transitions are in progress during the check.
      for (const scheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.reload();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(results.violations, `${path} (${scheme})`).toEqual([]);
      }
      expect(errors, `${path} script errors`).toEqual([]);
    });
  }
});

test('unknown pages show the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('robots.txt and sitemap are published', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Sitemap: https?:\/\/.+\/sitemap-index\.xml/);
  expect((await sitemapPaths(request)).length).toBeGreaterThan(0);
});
