import {test, expect} from "@playwright/test"

test('show error message when user not found', async ({page}) => {
    await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: "ไม่พบผู้ใช้งาน" }) 
    });
  });
    await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
    await page.getByRole('textbox', { name: 'you@example.com' }).fill('awdawdawdawdawd@awwad.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('awdwadawdawda');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('⚠️ ไม่พบผู้ใช้งาน')).toBeVisible();
})

test('show error message when password incorrect', async ({page}) => {
    await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: "รหัสผ่านไม่ถูกต้อง" }) 
    });
  });
    await page.goto('https://taskflow-nont.centralindia.cloudapp.azure.com/login');
    await page.getByRole('textbox', { name: 'you@example.com' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('awdwadawdawda');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('⚠️ รหัสผ่านไม่ถูกต้อง')).toBeVisible();
})