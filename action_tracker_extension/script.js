// Action Tracker Documentation Website JavaScript

class ActionTrackerDemo {
    constructor() {
        this.isTracking = false;
        this.isProcessing = false;
        this.operationsCount = 0;
        this.generatedTestsCount = 0;
        
        this.initializeEventListeners();
        this.initializeAnimations();
    }

    initializeEventListeners() {
    }

    initializeAnimations() {
        // Add intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections for scroll animations
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    handlePlayAction() {
        const playBtn = document.getElementById('playBtn');
        const playStatus = document.getElementById('playStatus');

        if (this.isTracking) {
            this.showMessage('Tracking is already active', 'warning');
            return;
        }

        // Animate button
        playBtn.classList.add('active');
        setTimeout(() => playBtn.classList.remove('active'), 500);

        // Update tracking state
        this.isTracking = true;
        this.operationsCount = 0;

        // Update status
        playStatus.textContent = 'Tracking operations...';
        playStatus.classList.add('active');

        // Simulate operation tracking
        this.simulateOperationTracking();

        this.showMessage('Operation tracking started successfully!', 'success');
    }

    handleStopAction() {
        const stopBtn = document.getElementById('stopBtn');
        const playStatus = document.getElementById('playStatus');
        const stopStatus = document.getElementById('stopStatus');

        if (!this.isTracking) {
            this.showMessage('No active tracking session to stop', 'warning');
            return;
        }

        // Animate button
        stopBtn.classList.add('active');
        setTimeout(() => stopBtn.classList.remove('active'), 500);

        // Update tracking state
        this.isTracking = false;

        // Update status
        playStatus.textContent = 'Ready to track operations';
        playStatus.classList.remove('active');
        
        stopStatus.textContent = `Tracking stopped. ${this.operationsCount} operations captured`;
        stopStatus.classList.add('active');

        // Reset operation counter after display
        setTimeout(() => {
            stopStatus.textContent = 'Tracking session inactive';
            stopStatus.classList.remove('active');
        }, 3000);

        this.showMessage(`Tracking session ended. Captured ${this.operationsCount} operations.`, 'success');
    }

    handleGenerateAndRunAction() {
        const generateRunBtn = document.getElementById('generateRunBtn');
        const generateRunStatus = document.getElementById('generateRunStatus');

        if (this.operationsCount === 0) {
            this.showMessage('No operations to generate tests from. Please track some operations first.', 'warning');
            return;
        }

        if (this.isProcessing) {
            this.showMessage('AI code generation and execution is already in progress', 'warning');
            return;
        }

        // Animate button
        generateRunBtn.classList.add('active');
        setTimeout(() => generateRunBtn.classList.remove('active'), 500);

        // Update processing state
        this.isProcessing = true;

        // Update status
        generateRunStatus.textContent = 'AI is analyzing operations and generating Playwright test cases...';
        generateRunStatus.classList.add('processing');

        // Simulate combined AI processing and execution
        this.simulateGenerateAndRun(generateRunStatus);

        this.showMessage('AI code generation and execution initiated. Processing tracked operations...', 'info');
    }

    handleClearAction() {
        const clearBtn = document.getElementById('clearBtn');
        const clearStatus = document.getElementById('clearStatus');

        // Animate button
        clearBtn.classList.add('active');
        setTimeout(() => clearBtn.classList.remove('active'), 500);

        // Reset all states
        this.isTracking = false;
        this.isProcessing = false;
        this.operationsCount = 0;
        this.generatedTestsCount = 0;

        // Reset all status indicators
        this.resetAllStatusIndicators();

        // Update clear status
        clearStatus.textContent = 'All session data cleared successfully';
        clearStatus.classList.add('active');

        setTimeout(() => {
            clearStatus.textContent = 'Session data preserved';
            clearStatus.classList.remove('active');
        }, 3000);

        this.showMessage('All session data has been cleared successfully.', 'success');
    }

    handleDownloadAction() {
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadStatus = document.getElementById('downloadStatus');

        if (this.generatedTestsCount === 0) {
            this.showMessage('No test scripts available for download. Please generate tests first.', 'warning');
            return;
        }

        // Animate button
        downloadBtn.classList.add('active');
        setTimeout(() => downloadBtn.classList.remove('active'), 500);

        // Update status
        downloadStatus.textContent = 'Preparing script for download...';
        downloadStatus.classList.add('processing');

        // Simulate download preparation
        setTimeout(() => {
            // Create and download a sample test file
            const testScript = this.generateSampleTestScript();
            const blob = new Blob([testScript], { type: 'text/typescript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'playwright-test-script.ts';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            downloadStatus.textContent = 'Script downloaded successfully!';
            downloadStatus.classList.remove('processing');
            downloadStatus.classList.add('active');

            setTimeout(() => {
                downloadStatus.textContent = 'Script ready for download';
                downloadStatus.classList.remove('active');
            }, 3000);

            this.showMessage('Playwright test script downloaded successfully!', 'success');
        }, 2000);
    }

    handleEditAction() {
        const editBtn = document.getElementById('editBtn');
        const editStatus = document.getElementById('editStatus');

        // Animate button
        editBtn.classList.add('active');
        setTimeout(() => editBtn.classList.remove('active'), 500);

        // Update status
        editStatus.textContent = 'Opening editor interface...';
        editStatus.classList.add('processing');

        // Simulate editor opening
        setTimeout(() => {
            editStatus.textContent = 'Editor interface opened - Input fields available for modification';
            editStatus.classList.remove('processing');
            editStatus.classList.add('active');

            setTimeout(() => {
                editStatus.textContent = 'Editor ready for modifications';
                editStatus.classList.remove('active');
            }, 4000);

            this.showMessage('Editor interface opened. You can now modify input fields and test parameters.', 'info');
        }, 1500);
    }

    simulateOperationTracking() {
        const operations = [
            'Click element detected',
            'Form input captured',
            'Navigation event recorded',
            'Element hover tracked',
            'Dropdown selection logged',
            'Button interaction saved'
        ];

        const interval = setInterval(() => {
            if (!this.isTracking) {
                clearInterval(interval);
                return;
            }

            this.operationsCount++;
            const operation = operations[Math.floor(Math.random() * operations.length)];
            
            // Update play status with current operation
            const playStatus = document.getElementById('playStatus');
            playStatus.textContent = `${operation} (${this.operationsCount} operations)`;

        }, 2000);
    }

    simulateGenerateAndRun(statusElement) {
        const steps = [
            'Analyzing XPath patterns...',
            'Optimizing element selectors...',
            'Generating TypeScript code...',
            'Adding assertions and validations...',
            'Finalizing test structure...',
            'Initializing Playwright environment...',
            'Starting browser instances...',
            'Executing test scenarios...',
            'Validating assertions...',
            'Generating test reports...'
        ];

        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                statusElement.textContent = steps[stepIndex];
                stepIndex++;
                
                // Update generated test count after generation phase
                if (stepIndex === 5) {
                    this.generatedTestsCount = Math.ceil(this.operationsCount / 3);
                }
            } else {
                clearInterval(interval);
                this.isProcessing = false;
                
                const passedTests = Math.floor(this.generatedTestsCount * 0.85);
                const failedTests = this.generatedTestsCount - passedTests;
                
                statusElement.textContent = `Generated ${this.generatedTestsCount} tests and executed: ${passedTests} passed, ${failedTests} failed`;
                statusElement.classList.remove('processing');
                statusElement.classList.add('active');

                setTimeout(() => {
                    statusElement.textContent = 'Ready to generate and execute test code';
                    statusElement.classList.remove('active');
                }, 5000);

                this.showMessage(`Successfully generated and executed ${this.generatedTestsCount} test cases. ${passedTests} passed, ${failedTests} failed.`, 'success');
            }
        }, 1200);
    }

    simulateTestExecution(statusElement) {
        const testSteps = [
            'Initializing Playwright environment...',
            'Starting browser instances...',
            'Executing test scenarios...',
            'Validating assertions...',
            'Generating test reports...'
        ];

        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < testSteps.length) {
                statusElement.textContent = testSteps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
                
                const passedTests = Math.floor(this.generatedTestsCount * 0.85);
                const failedTests = this.generatedTestsCount - passedTests;
                
                statusElement.textContent = `Test execution completed: ${passedTests} passed, ${failedTests} failed`;
                statusElement.classList.remove('processing');
                statusElement.classList.add('active');

                setTimeout(() => {
                    statusElement.textContent = 'Test environment ready';
                    statusElement.classList.remove('active');
                }, 5000);

                this.showMessage(`Test execution completed. ${passedTests} tests passed, ${failedTests} tests failed.`, 'success');
            }
        }, 1200);
    }

    resetAllStatusIndicators() {
        const statusElements = [
            { id: 'playStatus', text: 'Ready to track operations' },
            { id: 'stopStatus', text: 'Tracking session inactive' },
            { id: 'generateRunStatus', text: 'Ready to generate and execute test code' },
            { id: 'clearStatus', text: 'Session data preserved' },
            { id: 'downloadStatus', text: 'Script ready for download' },
            { id: 'editStatus', text: 'Editor ready for modifications' }
        ];

        statusElements.forEach(({ id, text }) => {
            const element = document.getElementById(id);
            element.textContent = text;
            element.classList.remove('active', 'processing');
        });
    }

    generateSampleTestScript() {
        return `import { test, expect } from '@playwright/test';

// Generated by Action Tracker - ${new Date().toLocaleString()}
// Test cases: ${this.generatedTestsCount} | Operations tracked: ${this.operationsCount}

test.describe('Action Tracker Generated Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://example.com');
  });

  // Positive Test Scenarios
  test('should perform user actions successfully', async ({ page }) => {
    // Generated locators from tracked actions
    const loginButton = page.locator('[data-testid="login-btn"]');
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');
    
    // Positive scenario: Valid login
    await usernameField.fill('valid_user@example.com');
    await passwordField.fill('validPassword123');
    await loginButton.click();
    
    await expect(page.locator('.dashboard')).toBeVisible();
  });

  // Negative Test Scenarios
  test('should handle invalid inputs gracefully', async ({ page }) => {
    const loginButton = page.locator('[data-testid="login-btn"]');
    const usernameField = page.locator('#username');
    const passwordField = page.locator('#password');
    
    // Negative scenario: Empty fields
    await loginButton.click();
    await expect(page.locator('.error-message')).toContainText('Please fill in all fields');
    
    // Negative scenario: Invalid credentials
    await usernameField.fill('invalid@example.com');
    await passwordField.fill('wrongpassword');
    await loginButton.click();
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should validate form inputs', async ({ page }) => {
    const emailField = page.locator('#email');
    const submitBtn = page.locator('[type="submit"]');
    
    // Test invalid email format
    await emailField.fill('invalid-email');
    await submitBtn.click();
    await expect(page.locator('.validation-error')).toContainText('Please enter a valid email');
  });
});

// Additional utility functions
async function waitForElement(page, selector) {
  await page.waitForSelector(selector, { timeout: 10000 });
}

async function takeScreenshot(page, name) {
  await page.screenshot({ path: \`screenshots/\${name}.png\` });
}
`;
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;

        // Style the message
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px',
            lineHeight: '1.4'
        });

        // Set background color based on type
        const colors = {
            success: '#48bb78',
            warning: '#ed8936',
            error: '#f56565',
            info: '#667eea'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(messageDiv);

        // Animate in
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 4000);
    }

    // Add smooth scrolling for navigation
    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// Initialize the demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const demo = new ActionTrackerDemo();
    
    // Add some additional interactive features
    
    // Add hover effects to feature cards
    document.querySelectorAll('.feature-item, .benefit-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click animation to workflow steps
    document.querySelectorAll('.workflow-step').forEach(step => {
        step.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // Add typing animation to the hero description
    const heroText = document.querySelector('.hero-description p');
    if (heroText) {
        const originalText = heroText.textContent;
        heroText.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            heroText.textContent += originalText.charAt(i);
            i++;
            if (i >= originalText.length) {
                clearInterval(typeInterval);
            }
        }, 50);
    }

    console.log('Action Tracker Documentation Website Initialized');
});

// Add keyboard shortcuts for demo controls
document.addEventListener('keydown', (e) => {
    // Only trigger if no input is focused
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }

    switch(e.key.toLowerCase()) {
        case 'p':
            document.getElementById('playBtn').click();
            break;
        case 's':
            document.getElementById('stopBtn').click();
            break;
        case 'g':
            document.getElementById('generateRunBtn').click();
            break;
        case 'c':
            document.getElementById('clearBtn').click();
            break;
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActionTrackerDemo;
}
