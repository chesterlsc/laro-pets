import { expect, test } from '@playwright/test';

const SHOTS = process.env.SHOTS_DIR;

test('video modal opens from the hero card, plays without sound on load, closes on Escape', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('video');
  await expect(video).toHaveCount(0);
  await page.getByRole('button', { name: /play the 20-second demo/i }).click();
  const dialog = page.getByRole('dialog', { name: /demo video/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('video')).toHaveAttribute('preload', 'none');
  await expect(dialog.locator('video')).toHaveAttribute('controls', '');
  await expect(dialog.getByRole('button', { name: /close video/i })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('mobile: sticky buy bar appears only after the hero button scrolls away; FAQ accordion works', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const bar = page.getByRole('link', { name: /^buy now$/i });
  await expect(bar).toBeHidden();
  await page.getByRole('heading', { name: 'Pick your bundle' }).scrollIntoViewIfNeeded();
  await expect(bar).toBeVisible();
  const q = page.getByRole('button', { name: 'Is it noisy?' });
  await expect(q).toHaveAttribute('aria-expanded', 'false');
  await q.click();
  await expect(q).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('The motor is whisper-quiet. Cats hear the soft rustle')).toBeVisible();
  if (SHOTS) {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${SHOTS}/checkout-390.png`, fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: `${SHOTS}/checkout-1440.png`, fullPage: true });
    await page.goto('/policies/returns');
    await page.screenshot({ path: `${SHOTS}/policy-1440.png`, fullPage: true });
  }
});

test('one h1, section h2s in spec wording, no third-party logos or emoji', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Laro Hunt Mat · automatic hide-and-seek cat teaser');
  for (const h of ['Twenty seconds. One very serious cat.', 'Press once. The mat does the rest.', 'Pick your bundle', 'Cat parents from QC to Davao', 'We took the risk off you', 'Specs', 'Questions cat parents ask', 'Ready for the pounce?']) {
    await expect(page.getByRole('heading', { level: 2, name: h, exact: true })).toHaveCount(1);
  }
  expect(await page.locator("body").innerText()).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  expect(await page.locator('img[src*="logo"], img[alt*="GCash"], img[alt*="Visa"]').count()).toBe(0);
});
