const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');

const GITHUB_TOKEN = ""; // Set as env var for security
const GITHUB_USERNAME = 'hjain27';
const FILENAME = 'user_actions.txt';
const FILE_PATH = `./${FILENAME}`;
const apiKey = "";

async function uploadToGist() {
  const fileContent = fs.readFileSync(FILE_PATH, 'utf8');
  const response = await axios.post(
    'https://api.github.com/gists',
    {
      description: 'User actions log upload',
      public: false,
      files: {
        [FILENAME]: { content: fileContent }
      }
    },
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  );
  return response.data.id; // Gist ID
}

async function runAutomationWithGist(gistId) {
  const gistRawUrl = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistId}/raw/${FILENAME}`;
  try {
    const gistResponse = await axios.get(gistRawUrl);
    const userActions = gistResponse.data;
    const prompt = `You are an expert QA engineer. Your task is to convert the following user action script (which uses XPath locators) into a fully functional Playwright test file in TypeScript. The generated test must adhere to these requirements:

Use CommonJS require() syntax for all imports (e.g., const { test, expect } = require('@playwright/test')). Do not use ES module import statements.

Navigation & Setup

Start by navigating to:
“https://opensource-demo.orangehrmlive.com/web/index.php/auth/login”

After each navigation or reload, use
await page.waitForLoadState(“networkidle”)

Element Selection & Waiting

Use only XPath selectors with Playwright’s syntax:
page.locator("xpath=YOUR_XPATH_HERE")

Before interacting, always wait with timeouts:
await locator.waitFor({ state: “visible”, timeout: 10000 })

Use toBeVisible({ timeout: 10000 }), toBeEnabled(), or toHaveText() for all verifications.

Assertions & Failure Handling

After each action, assert the expected outcome using Playwright expect().

If an expectation fails, the test must throw a clear error.

Surround each major step in try/catch, log errors with console.error(), and rethrow to fail the test.

Modularity & Logging

Encapsulate repeated logic (e.g. login, wait-and-click) in reusable helper functions.

Add console.log() before and after each helper function to trace execution.

Post-Login Verification

Verify successful login by checking for a dashboard or user profile element via XPath and expect(...).toBeVisible().

No Explanatory Comments

Output only the executable Playwright test file (imports, fixtures, helper functions, and test body).

Do not include plain-language comments or steps, only code.

SCRIPT:
${userActions}`;
   // console.log("Prompt fetched from Gist:", userActions);
    // Step 2: Call Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    // Gemini returns a nested response; extract the generated text
    const testCode = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!testCode) {
      throw new Error("No code was returned by Gemini API.");
    }
    // Step 3: Validate and fix generated code for Playwright
    let fixedTestCode = testCode;
    if (!/\b(test|describe)\s*\(/.test(fixedTestCode)) {
      fixedTestCode = `const { test, expect } = require('@playwright/test');\n\ntest('Generated test', async ({ page }) => {\n${fixedTestCode}\n});`;
    }
    fixedTestCode = fixedTestCode.split('\n').map(line => {
      if (/^\s*$|[;{}]$|^\s*\/\//.test(line)) return line;
      return line + ';';
    }).join('\n');
    fixedTestCode = fixedTestCode.split('\n').filter(line => !/^`{3}/.test(line.trim())).join('\n');
    fixedTestCode = fixedTestCode.split('\n').filter(line => {
      if (/^\s*[A-Z][A-Za-z0-9_ ]*/.test(line) && !/^\s*\/\//.test(line)) return false;
      return /^\s*(const|let|await|if|for|while|return|function|test|describe|expect|\{|\}|\/\/|import|export|page\.|\w+\s*=)/.test(line) || /[;{}]$/.test(line);
    }).join('\n');
    fixedTestCode = fixedTestCode.split('\n').map(line => {
      if (/^\s*\/\//.test(line) || /^\s*[{}]\s*$/.test(line) || /^\s*$/.test(line)) return line;
      return `console.log(\`Executing: ${line.replace(/`/g, "'")}\`);\n` + line;
    }).join('\n');
    try {
      new Function(fixedTestCode);
    } catch (syntaxError) {
      console.error("Syntax error in generated code:\n", syntaxError.message);
      fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
      return;
    }
    fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
    console.log("Test code written to ./tests/generated.spec.ts");
    execSync('npx playwright test --headed', { stdio: 'inherit' });
    const reportPath = path.join(__dirname, 'playwright-report');
    if (fs.existsSync(reportPath)) {
      execSync('npx playwright show-report', { stdio: 'inherit' });
    } else {
      console.error('No Playwright report found.');
    }
  } catch (error) {
    console.error('Automation failed:', error.message);
  }
}

// Minimal Express server to keep the service alive for Render.com
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/report', express.static(path.join(__dirname, 'playwright-report')));

// Endpoint to upload file and run automation
app.post('/upload-and-run', async (req, res) => {
  try {
    let actions = req.body.actions;
    if (Array.isArray(actions) && actions.length > 0) {
      fs.writeFileSync(FILE_PATH, actions.join('\n'), 'utf8');
    }
    const gistId = await uploadToGist();
    await runAutomationWithGist(gistId);
    res.json({ success: true, gistId, reportUrl: '/report' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => res.send('Playwright automation running!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
