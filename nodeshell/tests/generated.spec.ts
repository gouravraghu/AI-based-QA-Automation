const { test, expect } = require('@playwright/test');

test.describe('OrangeHRM Login and Logout', () => {

  const baseURL = "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";

  async function login(page, username, password) {
    console.log(`Entering username: ${username}`);
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/div[2]/input[1]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/div[2]/input[1]").fill(username);
    console.log(`Entering password: ${password}`);
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[2]/div[1]/div[2]/input[1]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[2]/div[1]/div[2]/input[1]").fill(password);
    console.log('Clicking login button');
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[3]/button[1]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[3]/button[1]").click();
  }

  async function logout(page) {
    console.log('Opening user dropdown');
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/header[1]/div[1]/div[3]/ul[1]/li[1]/span[1]/p[1]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/header[1]/div[1]/div[3]/ul[1]/li[1]/span[1]/p[1]").click();
    console.log('Clicking logout button');
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/header[1]/div[1]/div[3]/ul[1]/li[1]/ul[1]/li[4]/a[1]").waitFor({ state: "visible", timeout: 10000 });
    await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/header[1]/div[1]/div[3]/ul[1]/li[1]/ul[1]/li[4]/a[1]").click();
  }

  test('Successful Login and Logout', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState("networkidle");

    // Step 1: Login
    try {
      await login(page, 'admin', 'admin123');
      await page.waitForLoadState("networkidle");
      // Verify successful login
      await page.locator("xpath=//h6[text()='Dashboard']").waitFor({ state: "visible", timeout: 10000 });
      await expect(page.locator("xpath=//h6[text()='Dashboard']")).toBeVisible();
      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }

    // Step 2: Logout
    try {
      await logout(page);
      await page.waitForLoadState("networkidle");
      // Verify successful logout - back on login page
      await expect(page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/div[2]/input[1]")).toBeVisible();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  });

  test('Login with Invalid Credentials', async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState("networkidle");

    // Step 1: Login with invalid credentials
    try {
      await login(page, 'invalid_user', 'invalid_password');
      await page.waitForLoadState("networkidle");

      // Verify error message
      await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/p[1]").waitFor({ state: "visible", timeout: 10000 });
      await expect(page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/p[1]")).toBeVisible();
      console.log('Login with invalid credentials failed as expected.');
    } catch (error) {
      console.error('Error during invalid login attempt:', error);
      throw error;
    }
  });

    test('Empty Username Login', async ({ page }) => {
        await page.goto(baseURL);
        await page.waitForLoadState("networkidle");

        // Step 1: Try to login with empty username
        try {
            console.log('Entering empty username');
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/div[2]/input[1]").waitFor({ state: "visible", timeout: 10000 });
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/div[2]/input[1]").fill('');
            console.log('Entering password');
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[2]/div[1]/div[2]/input[1]").waitFor({ state: "visible", timeout: 10000 });
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[2]/div[1]/div[2]/input[1]").fill('admin123');
            console.log('Clicking login button');
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[3]/button[1]").waitFor({ state: "visible", timeout: 10000 });
            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[3]/button[1]").click();
            await page.waitForLoadState("networkidle");

            await page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/span[1]").waitFor({ state: "visible", timeout: 10000 });
            await expect(page.locator("xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[2]/form[1]/div[1]/div[1]/span[1]")).toBeVisible()

        } catch (error) {
            console.error('Error during login attempt with empty username:', error);
            throw error;
        }
    });
});