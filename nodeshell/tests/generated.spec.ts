console.log(`Executing: const { test, expect } = require('@playwright/test');`);
const { test, expect } = require('@playwright/test');
console.log(`Executing: test('OrangeHRM Login and Add User Test with Fail Conditions', async ({ page }) => {`);
test('OrangeHRM Login and Add User Test with Fail Conditions', async ({ page }) => {
console.log(`Executing:   const baseURL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';`);
  const baseURL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
console.log(`Executing:   await page.goto(baseURL);`);
  await page.goto(baseURL);
console.log(`Executing:   console.log('Navigated to login page');`);
  console.log('Navigated to login page');
console.log(`Executing:   const usernameField = '//input[@name="username"]';`);
  const usernameField = '//input[@name="username"]';
console.log(`Executing:   const passwordField = '//input[@name="password"]';`);
  const passwordField = '//input[@name="password"]';
console.log(`Executing:   const loginButton = '//button[@type="submit"]';`);
  const loginButton = '//button[@type="submit"]';
console.log(`Executing:   const adminButton = '//span[text()="Admin"]';`);
  const adminButton = '//span[text()="Admin"]';
console.log(`Executing:   const addButton = '//button[text()=" Add "]';`);
  const addButton = '//button[text()=" Add "]';
console.log(`Executing:   const successMessage = '//p[text()="Successfully Saved"]';`);
  const successMessage = '//p[text()="Successfully Saved"]';
console.log(`Executing:   try {`);
  try {
console.log(`Executing:     await page.locator(usernameField).click({timeout: 5000});`);
    await page.locator(usernameField).click({timeout: 5000});
console.log(`Executing:     await page.locator(usernameField).fill('Admin');`);
    await page.locator(usernameField).fill('Admin');
console.log(`Executing:     console.log('Entered username');`);
    console.log('Entered username');
console.log(`Executing:     await page.locator(passwordField).click({timeout: 5000});`);
    await page.locator(passwordField).click({timeout: 5000});
console.log(`Executing:     await page.locator(passwordField).fill('admin123');`);
    await page.locator(passwordField).fill('admin123');
console.log(`Executing:     console.log('Entered password');`);
    console.log('Entered password');
console.log(`Executing:     await page.locator(loginButton).click({timeout: 5000});`);
    await page.locator(loginButton).click({timeout: 5000});
console.log(`Executing:     console.log('Clicked login button');`);
    console.log('Clicked login button');
console.log(`Executing:     await page.locator(adminButton).waitFor({ state: 'visible', timeout: 10000 });`);
    await page.locator(adminButton).waitFor({ state: 'visible', timeout: 10000 });
console.log(`Executing:     await page.locator(adminButton).click({timeout: 5000});`);
    await page.locator(adminButton).click({timeout: 5000});
console.log(`Executing:     console.log('Clicked Admin');`);
    console.log('Clicked Admin');
console.log(`Executing:     await page.locator(addButton).waitFor({ state: 'visible', timeout: 10000 });`);
    await page.locator(addButton).waitFor({ state: 'visible', timeout: 10000 });
console.log(`Executing:     await page.locator(addButton).click({timeout: 5000});`);
    await page.locator(addButton).click({timeout: 5000});
console.log(`Executing:     console.log('Clicked Add');`);
    console.log('Clicked Add');
    //Check for save button and user role dropdown presence before filling the form
console.log(`Executing:     const saveButton = '//button[text()=" Save "]';`);
    const saveButton = '//button[text()=" Save "]';
console.log(`Executing:     const userRoleDropdown = '//label[text()="User Role"]/following::div[@class="oxd-select-text-input"]';`);
    const userRoleDropdown = '//label[text()="User Role"]/following::div[@class="oxd-select-text-input"]';
console.log(`Executing:     try{`);
    try{
console.log(`Executing:         await page.locator(saveButton).waitFor({state: 'visible', timeout: 10000});`);
        await page.locator(saveButton).waitFor({state: 'visible', timeout: 10000});
console.log(`Executing:         await page.locator(userRoleDropdown).waitFor({state: 'visible', timeout: 10000});`);
        await page.locator(userRoleDropdown).waitFor({state: 'visible', timeout: 10000});
console.log(`Executing:         console.log("Save button and user role dropdown is visible");`);
        console.log("Save button and user role dropdown is visible");
console.log(`Executing:     } catch (error) {`);
    } catch (error) {
console.log(`Executing:         console.error("Save button or user role dropdown did not appear", error);`);
        console.error("Save button or user role dropdown did not appear", error);
console.log(`Executing:         throw new Error("Save button or User role dropdown did not appear after clicking on Add");`);
        throw new Error("Save button or User role dropdown did not appear after clicking on Add");
    }
console.log(`Executing:     const successLocator = page.locator(successMessage);`);
    const successLocator = page.locator(successMessage);
console.log(`Executing:     try {`);
    try {
console.log(`Executing:         await successLocator.waitFor({state: 'visible', timeout: 10000});`);
        await successLocator.waitFor({state: 'visible', timeout: 10000});
console.log(`Executing:         console.log('Success message is visible');`);
        console.log('Success message is visible');
console.log(`Executing:         expect(successLocator).toBeVisible();`);
        expect(successLocator).toBeVisible();
console.log(`Executing:     } catch (error) {`);
    } catch (error) {
console.log(`Executing:         console.error('Success message did not appear', error);`);
        console.error('Success message did not appear', error);
console.log(`Executing:         throw new Error('Success message did not appear after saving');`);
        throw new Error('Success message did not appear after saving');
    }
console.log(`Executing:   } catch (error) {`);
  } catch (error) {
console.log(`Executing:     console.error('Test failed: ', error);`);
    console.error('Test failed: ', error);
console.log(`Executing:     expect(false).toBe(true, 'Test failed: ${error.message}');`);
    expect(false).toBe(true, `Test failed: ${error.message}`);
  }
console.log(`Executing: });`);
});