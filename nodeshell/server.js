const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

const gistRawUrl = 'https://gist.githubusercontent.com/hjain27/c7ab30d45c1d93e206404bd316c0e7c7/raw/Promt1.txt';
const apiKey = "AIzaSyDhYGUwy_KDDBnjir_fnf7C0P5CKouDOx0";

app.post('/run', async (req, res) => {
  try {
    // Fetch prompt from Gist
    const gistResponse = await axios.get(gistRawUrl);
    const prompt = gistResponse.data;

    // Call Gemini API
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let testCode = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!testCode) throw new Error("No code was returned by Gemini API.");

    // Post-process code (same as before)
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

    // Validate syntax
    try {
      new Function(fixedTestCode);
    } catch (syntaxError) {
      fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);
      return res.status(400).json({ error: "Syntax error in generated code", details: syntaxError.message });
    }

    // Write test file
    fs.writeFileSync('./tests/generated.spec.ts', fixedTestCode);

    // Run Playwright test (headless for cloud)
    let testOutput = '';
    try {
      testOutput = execSync('npx playwright test', { encoding: 'utf-8' });
    } catch (err) {
      testOutput = err.stdout ? err.stdout.toString() : err.message;
    }

    // Return test output and a link to the report
    res.json({
      message: "Test executed.",
      testOutput,
      reportUrl: '/playwright-report/index.html'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Playwright HTML report
app.use('/playwright-report', express.static(path.join(__dirname, 'playwright-report')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
