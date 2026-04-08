import { test, expect } from '@playwright/test';

test('show error message when rate limited on register', async ({ page }) => {
  // 🚨 1. จำลอง (Mock) API: ดักจับ request ที่ส่งไปสมัครสมาชิก 
  // (ถ้า React ของคุณยิงไปที่ /auth/register ให้เปลี่ยนเป็น '**/auth/register')
  await page.route('**/register', async route => {
    // บังคับตอบกลับเป็น 429 ทันที โดยไม่ต้องไปกวน Server จริง
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Registration failed. Please try again.' }) 
    });
  });

  // 2. เข้าหน้าเว็บตามปกติ
  await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
  await page.getByRole('link', { name: 'Create one' }).click();
  await page.waitForURL('**/register'); 

  // 3. กรอกข้อมูล (กรอกอะไรก็ได้ เพราะยังไง API ก็ถูกจำลองให้พังด้วย 429 แน่นอน)
  await page.getByRole('textbox', { name: 'John' }).fill('testuser');
  await page.getByRole('textbox', { name: 'Doe' }).fill('testuser');
  await page.getByRole('textbox', { name: 'you@example.com' }).fill('test@gmail.com');
  await page.locator('input[name="password"]').fill('test1234');
  await page.locator('input[name="confirmPassword"]').fill('test1234');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('⚠️ Registration failed. Please try again.')).toBeVisible();

});