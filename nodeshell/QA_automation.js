require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');
const speakeasy = require('speakeasy');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'monikatrivediinfobeans';
const FILENAME = 'user_actions.txt';
const FILE_PATH = `./${FILENAME}`;
const apiKey = process.env.API_KEY;
const MFA_SECRET = process.env.MFA_SECRET; 
const TIMEOUT = process.env.Timeout ? parseInt(process.env.Timeout) : 30000;

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
  console.log('✅ Gist created:', response.data.html_url);
  return response.data.id;
}

// ✅ String cleanup helper
function cleanGeneratedCode(code) {
  return code
    .split('\n')
    .filter(line => {
      if (/^\s*```/.test(line)) return false;
      if (/^\s*Output only valid/.test(line)) return false;
      if (/^\s*SCRIPT:/.test(line)) return false;
      if (/^[A-Z ]+:$/.test(line)) return false;
      return true;
    })
    .join('\n')
    .trim();
}

async function regenerateWithFeedback(originalPrompt, apiKey) {
  const feedback = `
The previous output did not follow the required structure. Please generate code that:
1. Has exactly one describe block
2. Includes both 'Positive Scenario' test cases
3. Uses CommonJS import
4. No markdown or explanations
5. Wraps interactions in try/catch with assertions
6. Make sure not need to click on any input field without first checking visibility and only fill data if the field is visible
7. Do not fill 'Empty' in any input field
`;

  const retryResponse = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      contents: [{ role: 'user', parts: [{ text: originalPrompt + '\n\nFEEDBACK:\n' + feedback }] }],
      generationConfig: {
        temperature: 0.05,
        topK: 1,
        topP: 0.7,
        maxOutputTokens: 4000,
        candidateCount: 1
      }
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  let retryCode = retryResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
  return cleanGeneratedCode(retryCode || '');
}

async function runAutomationWithGist(gistId, landingUrl) {
  const gistRawUrl = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistId}/raw/${FILENAME}`;

  try {
    const gistResponse = await axios.get(gistRawUrl);
    const userActions = gistResponse.data;

    if (typeof userActions !== 'string') {
      throw new Error('userActions must be a string.');
    }

    if (typeof landingUrl !== 'string' || !landingUrl.startsWith('http')) {
      throw new Error('Invalid landing URL.');
    }

    console.log('✅ Landing URL:', landingUrl);
    console.log('✅ User Actions:\n', userActions);

    const prompt = `You are an expert QA engineer specializing in Playwright test automation. Your task is to generate a fully functional Playwright test file in TypeScript for a website, based on a provided user action script that uses XPath locators. The generated test must meet the following requirements and be generic enough to work for any website.
Test Case Structure

Generate step-by-step test cases based on **only** the provided user actions.
Create positive test cases to verify successful execution of each step (e.g., valid login, successful navigation).
Create negative test cases to verify failure scenarios (e.g., invalid inputs, missing required fields, incorrect MFA codes).
Group positive and negative test cases in separate test.describe blocks with clear names (e.g., "Positive Scenarios" and "Negative Scenarios").
Include comments to separate each step within test cases. Do not fill 'Empty' in any input field.

Requirements

Use CommonJS require() syntax for all imports (e.g., const { test, expect } = require('@playwright/test')). Do not use ES module import statements.
Use TypeScript for type safety and maintain clean, modular code.

Navigation & Setup

Start by navigating to the provided landing URL: ${landingUrl} (treat ${landingUrl} as a placeholder for the website’s URL).
After each navigation or page reload, use: await page.waitForLoadState("networkidle").
Allow the landing URL to be configurable via an environment variable or input parameter.

Element Selection & Waiting

Use only XPath selectors with Playwright’s syntax: page.locator("xpath=YOUR_XPATH_HERE").
Define a constant timeout value at the top of the test file: ${TIMEOUT}.
For input fields:
Confirm visibility with expect(locator).toBeVisible({ timeout: ${TIMEOUT} }).
Immediately fill the field using await locator.fill(text). Never click input fields before filling.
For required fields, detect "required" validation messages (e.g., "This field is required") and create negative test cases:
Test empty input submission to verify the validation message appears.
Test invalid data (e.g., invalid email format, short password) to verify appropriate error messages.




For buttons, dropdowns, and other clickable elements:
Confirm visibility with expect(locator).toBeVisible({ timeout: ${TIMEOUT} }).
Click using await locator.click().
Only select the values from dropdowns based on the user selection.


Use toBeEnabled() or toHaveText() for additional verifications as needed.

MFA Handling

After login, check if Multi-Factor Authentication (MFA) is required:
Detect if the page prompts for a 6-digit MFA code using an XPath locator for the MFA input field.
If MFA is required:
Use the speakeasy package to generate a Time-based One-Time Password (TOTP) using the secret: ${MFA_SECRET}.
Locate the MFA input field using its XPath, confirm visibility with expect(locator).toBeVisible({ timeout: ${TIMEOUT} }), and fill it with the generated code using await locator.fill(code). Do not click the input field before filling.
Locate and main block titled "Positive Scenarios" and one titled "Negative Scenarios" to group related tests.




Include comments to separate each step within test cases.

Output

Output only the executable Playwright test file (imports, fixtures, helper functions, and test body) in TypeScript.
Do not include plain-language comments or steps outside the code.
Ensure the test file is generic and can be adapted to any website by using placeholders for URLs, XPath selectors, and user inputs.
Use meaningful test names and group related tests under test.describe blocks with exactly one main test.describe block containing two nested test.describe blocks: "Positive Scenarios" and "Negative Scenarios".

SCRIPT:
${userActions}`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 4000,
          candidateCount: 1
        },
        safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let testCode = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!testCode) throw new Error("No test code generated.");

    let fixedTestCode = cleanGeneratedCode(testCode);

    // Auto-balance braces and validate syntax
    const openBraces = (fixedTestCode.match(/\{/g) || []).length;
    const closeBraces = (fixedTestCode.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      fixedTestCode += '\n' + Array(missing).fill('}').join('\n');
      console.warn(`🛠️ Auto-added ${missing} closing brace(s).`);
    }

    try {
      new Function(fixedTestCode);
    } catch (err) {
      console.error("❌ Syntax error in generated code:", err.message);
      fixedTestCode = await regenerateWithFeedback(prompt, apiKey);
    }

    if (!fixedTestCode || fixedTestCode.length < 50) {
      throw new Error("Generated code too short or invalid.");
    }

    fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
    console.log("✅ Test written to ./tests/generated.spec.ts");

    try {
      execSync('npx playwright test --headed', { stdio: 'inherit' });
    } catch (err) {
      console.error('❌ Playwright test failed:', err.message);
    }

    const reportPath = path.join(__dirname, 'playwright-report');
    if (fs.existsSync(reportPath)) {
      execSync('npx playwright show-report', { stdio: 'inherit' });
    } else {
      console.warn('⚠️ No report found.');
    }

  } catch (err) {
    console.error('❌ Automation failed:', err.message);
  } finally {
    console.log('🛑 Closing server...');
    process.exit(0); // Gracefully stop the server
  }
}

// ✅ Express Setup
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/report', express.static(path.join(__dirname, 'playwright-report')));

// ✅ Upload and run automation
app.post('/upload-and-run', async (req, res) => {
  try {
    const { actions, landingUrl } = req.body;

    if (!Array.isArray(actions) || actions.length === 0) {
      throw new Error("Missing or invalid 'actions'");
    }
    if (typeof landingUrl !== 'string') {
      throw new Error("Missing or invalid 'landingUrl'");
    }

    fs.writeFileSync(FILE_PATH, actions.join('\n'), 'utf8');
    const gistId = await uploadToGist();
    await runAutomationWithGist(gistId, landingUrl);
    res.json({ success: true, gistId, reportUrl: '/report' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Download generated test
app.get('/download-generated-spec', (req, res) => {
  const file = path.join(__dirname, 'tests', 'generated.spec.ts');
  res.download(file, 'generated.spec.ts', err => {
    if (err) res.status(500).send('Download failed.');
  });
});

app.get('/', (req, res) => res.send('✅ Playwright automation running'));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
