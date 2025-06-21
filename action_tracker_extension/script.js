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
        // Play button functionality
        document.getElementById('playBtn').addEventListener('click', () => {
            this.handlePlayAction();
        });

        // Stop button functionality
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.handleStopAction();
        });

        // Generate button functionality
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.handleGenerateAction();
        });

        // Run button functionality
        document.getElementById('runBtn').addEventListener('click', () => {
            this.handleRunAction();
        });

        // Clear button functionality
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.handleClearAction();
        });
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

    handleGenerateAction() {
        const generateBtn = document.getElementById('generateBtn');
        const generateStatus = document.getElementById('generateStatus');

        if (this.operationsCount === 0) {
            this.showMessage('No operations to generate tests from. Please track some operations first.', 'warning');
            return;
        }

        if (this.isProcessing) {
            this.showMessage('AI code generation is already in progress', 'warning');
            return;
        }

        // Animate button
        generateBtn.classList.add('active');
        setTimeout(() => generateBtn.classList.remove('active'), 500);

        // Update processing state
        this.isProcessing = true;

        // Update status
        generateStatus.textContent = 'AI is analyzing operations and generating Playwright test cases...';
        generateStatus.classList.add('processing');

        // Simulate AI processing
        this.simulateAIGeneration(generateStatus);

        this.showMessage('AI code generation initiated. Processing tracked operations...', 'info');
    }

    handleRunAction() {
        const runBtn = document.getElementById('runBtn');
        const runStatus = document.getElementById('runStatus');

        if (this.generatedTestsCount === 0) {
            this.showMessage('No test cases available. Please generate tests first.', 'warning');
            return;
        }

        // Animate button
        runBtn.classList.add('active');
        setTimeout(() => runBtn.classList.remove('active'), 500);

        // Update status
        runStatus.textContent = `Executing ${this.generatedTestsCount} Playwright test cases...`;
        runStatus.classList.add('processing');

        // Simulate test execution
        this.simulateTestExecution(runStatus);

        this.showMessage('Test execution started. Running Playwright test cases...', 'info');
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

    simulateAIGeneration(statusElement) {
        const steps = [
            'Analyzing XPath patterns...',
            'Optimizing element selectors...',
            'Generating TypeScript code...',
            'Adding assertions and validations...',
            'Finalizing test structure...'
        ];

        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                statusElement.textContent = steps[stepIndex];
                stepIndex++;
            } else {
                clearInterval(interval);
                this.isProcessing = false;
                this.generatedTestsCount = Math.ceil(this.operationsCount / 3);
                
                statusElement.textContent = `Generated ${this.generatedTestsCount} Playwright test cases successfully!`;
                statusElement.classList.remove('processing');
                statusElement.classList.add('active');

                // Show code upload simulation
                setTimeout(() => {
                    statusElement.textContent = 'Test files uploaded and ready for execution';
                }, 2000);

                this.showMessage(`Successfully generated ${this.generatedTestsCount} test cases from ${this.operationsCount} operations.`, 'success');
            }
        }, 1500);
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
            { id: 'generateStatus', text: 'Ready to generate test code' },
            { id: 'runStatus', text: 'Test environment ready' },
            { id: 'clearStatus', text: 'Session data preserved' }
        ];

        statusElements.forEach(({ id, text }) => {
            const element = document.getElementById(id);
            element.textContent = text;
            element.classList.remove('active', 'processing');
        });
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
            document.getElementById('generateBtn').click();
            break;
        case 'r':
            document.getElementById('runBtn').click();
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
