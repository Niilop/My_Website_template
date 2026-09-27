import { expect, test } from '@playwright/test';

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('main navigation is reachable and marks the current page', async ({ page, isMobile }) => {
  await page.goto('/about/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('opens, closes with Escape, and returns focus', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    const nav = page.getByRole('navigation', { name: 'Main' });

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();

    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();
  });
});

test('desktop shows navigation without a menu button', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop only');
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
});
