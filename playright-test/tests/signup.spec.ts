import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Task-Flow/);
});

test('show error message when rate limited on register', async ({ page }) => {

  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();
  await page.waitForURL('**/register'); 

  await page.getByRole('textbox', { name: 'John' }).fill('testuserser');
  await page.getByRole('textbox', { name: 'Doe' }).fill('testuserser');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('test@gmail.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test1234');

  const responsePromise = page.waitForResponse(res =>
    res.url().includes('/register') && res.status() === 429
  );

  await page.getByRole('button', { name: 'Create Account' }).click();
  
  const response = await responsePromise;
  expect(response.status()).toBe(429);
  await expect(page.getByText('⚠️ Registration failed.')).toBeVisible({timeout: 10000});

});

test('sigup successfully! ', async ({ page }) => {
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();
  await page.getByRole('textbox', { name: 'John' }).fill('test');
  await page.getByRole('textbox', { name: 'Doe' }).fill('test');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('testest@gmail.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test1234');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/login', {timeout: 10000});

  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});