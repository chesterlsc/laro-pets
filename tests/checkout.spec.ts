import { expect, test } from '@playwright/test';

test('COD checkout: Mat + Refill → thank-you shows order number and ₱899', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.getByRole('link', { name: 'Choose Mat + Refill' }).or(page.getByRole('button', { name: 'Choose Mat + Refill' })).first().click();
  await page.getByRole('link', { name: 'Continue to checkout' }).or(page.getByRole('button', { name: 'Continue to checkout' })).first().click();
  await expect(page).toHaveURL(/\/checkout/);

  await page.getByLabel('Full name').fill('Test Cat Parent');
  await page.getByLabel('Mobile number').fill('09171234567');
  await page.getByLabel('House/unit + street').fill('12 Sampaguita St');
  await page.getByLabel('Barangay').fill('Bagong Pag-asa');
  await page.getByLabel('City/Municipality').fill('Quezon City');
  await page.getByLabel('Province').fill('Metro Manila');
  await page.getByLabel('ZIP').fill('1100');
  await expect(page.getByRole('radio', { name: 'Cash on Delivery' })).toBeChecked();
  await page.getByRole('button', { name: /Place order/ }).click();

  await expect(page).toHaveURL(/\/thank-you\//);
  await expect(page.getByText(/LP-\d{6}-[A-Z0-9]{4}/)).toBeVisible();
  await expect(page.getByText('₱899').first()).toBeVisible();
  expect(errors).toEqual([]);
});
