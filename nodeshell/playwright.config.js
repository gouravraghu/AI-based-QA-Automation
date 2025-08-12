module.exports = {
  reporter: [
    ['html', { open: 'never' }],
    ['list'] // Fix: 'list' must be a tuple, not a string
  ],
  use: {
    screenshot: 'only-on-failure', // Take screenshot on failure
    trace: 'retain-on-failure',    // Optionally, keep trace for failed tests
  },
  timeout: 60000,
};
