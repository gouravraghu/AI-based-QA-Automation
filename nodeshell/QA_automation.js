const fs = require('fs');
const axios = require('axios');
const { execSync } = require('child_process');
const express = require('express');

// Replace this with your actual Gist raw file URL
const gistRawUrl = 'https://gist.githubusercontent.com/hjain27/c7ab30d45c1d93e206404bd316c0e7c7/raw/Promt1.txt';
const apiKey = "AIzaSyDhYGUwy_KDDBnjir_fnf7C0P5CKouDOx0";

axios.get(gistRawUrl)
  .then(gistResponse => {
    const prompt = gistResponse.data;
    console.log("Prompt fetched from Gist:", prompt);
    // Step 2: Call Gemini API
    axios.post(
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
    ).then(response => {
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
      execSync('npx playwright show-report', { stdio: 'inherit' });
    }).catch(console.error);
  })
  .catch(error => {
    console.error('Failed to fetch prompt from Gist:', error.message);
  });

// Minimal Express server to keep the service alive for Render.com
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Playwright automation running!'));
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
