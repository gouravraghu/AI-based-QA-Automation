const { test, expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async fillUsername(username) {
    const usernameField = this.page.locator("xpath=//*[@id=\"user-name\"]");
    await usernameField.waitFor({ state: "visible", timeout: 10000 });
    await usernameField.fill(username);
  }

  async fillPassword(password) {
    const passwordField = this.page.locator("xpath=//*[@id=\"password\"]");
    await passwordField.waitFor({ state: "visible", timeout: 10000 });
    await passwordField.fill(password);
  }

  async clickLogin() {
    const loginButton = this.page.locator("xpath=//*[@id=\"login-button\"]");
    await loginButton.waitFor({ state: "visible", timeout: 10000 });
    await loginButton.click();
  }

  async getErrorMessage() {
    return this.page.locator("xpath=//*[@data-test=\"error\"]");
  }
}

test.describe('Login Page Tests', () => {
  let page;
  let loginPage;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    await page.goto('https://www.saucedemo.com/');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Empty Username and Password', async () => {
    await loginPage.clickLogin();
    await page.waitForLoadState("networkidle");
    const errorMessage = loginPage.getErrorMessage();
    // Wait for error message to be visible
    await errorMessage.waitFor({ state: "visible", timeout: 5000 });
    // Log the actual error message text
    const errorText = await errorMessage.textContent();
    process.stdout.write('Actual error message: ' + errorText + '\n');
    debugger; // Pause here for interactive debugging if running with --inspect-brk
    await expect(errorMessage).toHaveText('Epic sadface: Username is required');
  });

  test('Empty Password', async () => {
    await loginPage.fillUsername('testuser');
    await loginPage.clickLogin();
    await page.waitForLoadState("networkidle");
    const errorMessage = loginPage.getErrorMessage();
    await expect(errorMessage).toHaveText('Epic sadface: Password is required');
  });

  test('Invalid Login', async () => {
    await loginPage.fillUsername('testuser');
    await loginPage.fillPassword('testpass');
    await loginPage.clickLogin();
    await page.waitForLoadState("networkidle");
    const errorMessage = loginPage.getErrorMessage();
    await expect(errorMessage).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });

  test('Valid Login', async () => {
    await loginPage.fillUsername('standard_user');
    await loginPage.fillPassword('secret_sauce');
    await loginPage.clickLogin();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
  });

  test('Additional actions from provided script', async () => {
    await page.goto('https://www.saucedemo.com/');
    const loginButton = page.locator("xpath=//*[@id=\"login-button\"]");
    await loginButton.waitFor({ state: "visible", timeout: 10000 });
    await loginButton.click();
    const usernameField = page.locator("xpath=//*[@id=\"user-name\"]");
    await usernameField.waitFor({ state: "visible", timeout: 10000 });
    await usernameField.fill('hfkd');
    await loginButton.waitFor({ state: "visible", timeout: 10000 });
    await loginButton.click();
  });
});