import { test, expect } from '@playwright/test';

test('show error message when email is already', async ({ page }) => {
  await page.route('**/register', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: "อีเมลนี้ถูกใช้งานแล้ว" }) 
    });
  });

  // 2. รันสเต็ปตามปกติ
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();

  await page.getByRole('textbox', { name: 'John' }).fill('test');
  await page.getByRole('textbox', { name: 'Doe' }).fill('test');

  await page.getByRole('textbox', { name: 'you@example.com' }).fill('test@gmail.com'); 
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test1234');

  const responsePromise = page.waitForResponse('**/api/auth/register');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await responsePromise;
  
  await expect(page.getByText('⚠️ อีเมลนี้ถูกใช้งานแล้ว')).toBeVisible();
});

test('show error message when password must be latest 6 characters', async({page}) => {
  await page.route('**/api/auth/register', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: "รหัสผ่านน้อยกว่า 6 ตัวอักษร" }) 
    });
  });
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();

  await page.getByRole('textbox', { name: 'John' }).fill('test');
  await page.getByRole('textbox', { name: 'Doe' }).fill('test');

  await page.getByRole('textbox', { name: 'you@example.com' }).fill('test123123123@gmail.com'); 
  await page.locator('input[name="password"]').fill('test');
  await page.locator('input[name="confirmPassword"]').fill('test');

  const responsePromise = page.waitForResponse('**/api/auth/register');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await responsePromise;

  await expect(page.getByText('⚠️ รหัสผ่านน้อยกว่า 6 ตัวอักษร')).toBeVisible();

})

test('show error message when password not match', async ({page}) => {
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();

  await page.getByRole('textbox', { name: 'John' }).fill('test');
  await page.getByRole('textbox', { name: 'Doe' }).fill('test');

  await page.getByRole('textbox', { name: 'you@example.com' }).fill('test123123123@gmail.com'); 
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test12345');

  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('⚠️ รหัสผ่านไม่ตรงกัน!')).toBeVisible();
});

test('sigup successfully!', async ({ page }) => {
  await page.waitForTimeout(2000);
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();
  
  await page.getByRole('textbox', { name: 'John' }).fill('test');
  await page.getByRole('textbox', { name: 'Doe' }).fill('test');
  const mockEmail = `test_${Date.now()}@gmail.com`
  await page.getByRole('textbox', { name: 'you@example.com' }).fill(mockEmail);
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test1234');
  
  const responsePromise = page.waitForResponse('**/api/auth/register');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await responsePromise;

  await page.waitForURL('**/login');

  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});