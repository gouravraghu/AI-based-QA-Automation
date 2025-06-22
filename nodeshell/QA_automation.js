require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Loaded from .env
const GITHUB_USERNAME = 'hjain27';
const FILENAME = 'user_actions.txt';
const FILE_PATH = `./${FILENAME}`;
const apiKey = process.env.API_KEY;

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

async function runAutomationWithGist(gistId, landingUrl) {
  const gistRawUrl = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistId}/raw/${FILENAME}`;
  try {
    const gistResponse = await axios.get(gistRawUrl);
    const userActions = gistResponse.data;
    const prompt = `,
You are an expert QA engineer. Your task is to convert the following user action script (which uses XPath locators) into a fully functional Playwright test file in TypeScript. The generated test must adhere to these requirements:

### Test Case Structure
1. Write test cases step-by-step based on the user actions provided.
2. Include both **positive** and **negative** scenarios for each step.
3. Clearly separate each step with comments (e.g., "// Step 1: Login").
4. For negative scenarios, simulate invalid inputs or unexpected conditions and verify proper error handling.

### Requirements
Use CommonJS require() syntax for all imports (e.g., const { test, expect } = require('@playwright/test')). Do not use ES module import statements.

### Navigation & Setup
Start by navigating to:
  “${landingUrl}”
After each navigation or reload, use:
  \await page.waitForLoadState("networkidle")\

### Element Selection & Waiting
Use only XPath selectors with Playwright’s syntax:
  \page.locator("xpath=YOUR_XPATH_HERE")\
Before interacting, always wait with timeouts:
  \await locator.waitFor({ state: "visible", timeout: 10000 })\
Use \toBeVisible({ timeout: 10000 })\, \toBeEnabled()\, or \toHaveText()\ for all verifications.

### Assertions & Failure Handling
After each action, assert the expected outcome using Playwright \expect()\.
If an expectation fails, the test must throw a clear error.
Surround each major step in try/catch, log errors with \console.error()\, and rethrow to fail the test.

### Modularity & Logging
Encapsulate repeated logic (e.g., login, wait-and-click) in reusable helper functions.
Add \console.log()\ before and after each helper function to trace execution.

### Post-Login Verification
Verify successful login by checking for a dashboard or user profile element via XPath and \expect(...).toBeVisible()\.

### Negative Scenarios
For each step, include at least one negative scenario:
  - Example: For login, test with invalid credentials and verify the error message.
  - Example: For form submission, test with missing or invalid inputs.

### Output
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
    let testCode = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
   // console.log("Generated test code:", testCode);
    if (!testCode) {
      throw new Error("No code was returned by Gemini API.");
    }
    // Remove any lines that are not valid JavaScript (e.g., code fences, markdown, or plain text)
    testCode = testCode.split('\n').filter(line => {
      // Remove markdown code fences and lines that are not code
      if (/^\s*```/.test(line)) return false;
      if (/^\s*Output only valid/.test(line)) return false;
      if (/^\s*Below is the user flow/.test(line)) return false;
      if (/^\s*SCRIPT:/.test(line)) return false;
      if (/^[A-Z ]+:$/.test(line)) return false;
      // Remove lines that are just plain text or headings
      if (/^[^a-zA-Z0-9]*$/.test(line)) return false;
      if (/^[^\w]*[A-Z][a-z ]+\.?$/.test(line) && !/require|test|expect|function|let|const|var|async|await|page|describe|beforeAll|afterAll|catch|try|console/.test(line)) return false;
      // Remove lines that contain only a single period or are just punctuation
      if (/^\s*[.]+\s*$/.test(line)) return false;
      // Remove lines that contain only a single word or are suspiciously short (likely not code)
      if (/^\s*\w{1,3}\s*$/.test(line)) return false;
      // Remove lines that are just a single or double quote
      if (/^\s*['"]\s*$/.test(line)) return false;
      // Remove lines that are just a single or double quote with a period
      if (/^\s*['"][.]\s*$/.test(line)) return false;
      return true;
    }).join('\n');
    // Step 3: Validate and fix generated code for Playwright
    let fixedTestCode = testCode;
    // Only remove markdown/code fences, not code structure
    fixedTestCode = fixedTestCode
      .split('\n')
      .filter(line => !/^\s*```/.test(line.trim()))
      .join('\n');

    // --- Custom: Detect method boundary errors ---
    const methodPattern = /^(\s*)(async\s+)?[a-zA-Z0-9_]+\s*\(/;
    const lines = fixedTestCode.split('\n');
    let methodError = false;
    for (let i = 1; i < lines.length; i++) {
      if (methodPattern.test(lines[i]) && lines[i-1] && !lines[i-1].trim().endsWith('}')) {
        methodError = true;
       // console.error(`Possible missing closing brace before: ${lines[i]}`);
      }
    }
    if (methodError) {
      // Compose a feedback message for Gemini
      const feedback = `The previous code output is invalid. Some class methods or test blocks are missing closing braces (}). Please regenerate the code and ensure every method, class, and test block is properly closed, following the example provided. Output only valid, executable Playwright JavaScript code with all braces and parentheses balanced. Do NOT output markdown, comments, or explanations—only code.`;
      // Re-call Gemini with feedback
      const retryResponse = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
        {
          contents: [
            { parts: [ { text: prompt + '\n\nFEEDBACK:\n' + feedback } ] }
          ]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      let retryTestCode = retryResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
      retryTestCode = retryTestCode.split('\n').filter(line => !/^\s*```/.test(line.trim())).join('\n');
      fixedTestCode = retryTestCode;
    }
    // --- End custom ---

    // Auto-balance braces if needed
    const openBraces = (fixedTestCode.match(/\{/g) || []).length;
    const closeBraces = (fixedTestCode.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      fixedTestCode += '\n' + Array(missing).fill('}').join('\n');
      console.warn(`Auto-added ${missing} closing brace(s) to balance the code.`);
    } else if (closeBraces > openBraces) {
      console.warn('Warning: More closing braces than opening braces in generated code.');
    }
    try {
      new Function(fixedTestCode);
    } catch (syntaxError) {
      console.error("Syntax error in generated code:\n", syntaxError.message);
      fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
      return;
    }
    fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
    //console.log("Test code written to ./tests/generated.spec.ts");
    let testFailed = false;
    try {
      execSync('npx playwright test --headed', { stdio: 'inherit' });
    } catch (err) {
      testFailed = true;
      console.error('Playwright tests failed:', err.message);
    }
    const reportPath = path.join(__dirname, 'playwright-report');
    if (fs.existsSync(reportPath)) {
      try {
        execSync('npx playwright show-report', { stdio: 'inherit' });
      } catch (err) {
        console.error('Failed to open Playwright report:', err.message);
      }
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
   // Enable Node.js debugging here
  // console.log('DEBUG /upload-and-run:', {
  //   body: req.body,
  //   actions: req.body.actions,
  //   landingUrl: req.body.landingUrl
  // });
  try {
    let actions = req.body.actions;
    let landingUrl = req.body.landingUrl; // Get landingUrl from request
  
    if (Array.isArray(actions) && actions.length > 0) {
      fs.writeFileSync(FILE_PATH, actions.join('\n'), 'utf8');
    }
    const gistId = await uploadToGist();
    await runAutomationWithGist(gistId, landingUrl); // Pass landingUrl
    res.json({ success: true, gistId, reportUrl: '/report' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint to download the generated Playwright test script
app.get('/download-generated-spec', (req, res) => {
  const file = path.join(__dirname, 'tests', 'generated.spec.ts');
  res.download(file, 'generated.spec.ts', (err) => {
    if (err) {
      res.status(500).send('Error downloading the file.');
    }
  });
});

app.get('/', (req, res) => res.send('Playwright automation running!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
