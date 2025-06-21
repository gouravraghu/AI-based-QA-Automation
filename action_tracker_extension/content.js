console.log("✅ Action Tracker Content Script Loaded!");

let shouldLog = false;
let actionsQueue = [];

chrome.storage.local.get(["actions", "shouldLog"], (data) => {
    actionsQueue = data.actions || [];
    shouldLog = data.shouldLog || false;
    console.log("🔄 Loaded previous actions:", actionsQueue.length, "| Logging:", shouldLog);
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startLogging") {
        shouldLog = true;
        actionsQueue = [];
        debugger
        chrome.storage.local.set({ shouldLog: true });
        console.log("🚀 Logging started");
        sendResponse({ status: "Logging enabled" });
    }
});

function saveAction(action) {
    if (!shouldLog) return;

    try {
        actionsQueue.push(action);
        chrome.storage.local.set({ actions: actionsQueue }, () => {
            if (chrome.runtime.lastError) {
                console.warn("Storage error:", chrome.runtime.lastError.message);
            } else {
                console.log(`💾 Saved: ${action}`);
            }
        });
    } catch (e) {
        console.error("Caught error during saveAction:", e);
    }
}

function getExactXPath(element) {
    if (!element || element.nodeType !== 1) return '';
    if (["li", "div"].includes(element.tagName.toLowerCase())) {
        let anchor = element.querySelector("a");
        if (anchor) return getExactXPath(anchor);
    }
    if (element.id) return `//*[@id="${element.id}"]`;

    const parts = [];
    while (element && element.nodeType === 1) {
        let index = 1;
        let sibling = element.previousElementSibling;
        while (sibling) {
            if (sibling.nodeName === element.nodeName) index++;
            sibling = sibling.previousElementSibling;
        }
        const tagName = element.nodeName.toLowerCase();
        parts.unshift(`${tagName}[${index}]`);
        element = element.parentNode;
    }
    return '/' + parts.join('/');
}

// document.addEventListener("click", function (event) {
//     let element = event.target;
//     let xpath = getExactXPath(element);
//     if (!xpath) return;
//     let actionText = `Clicked on '${element.innerText?.trim() || element.tagName}' | XPath: ${xpath}`;
//     saveAction(actionText);
// }, true);

document.addEventListener("blur", function (event) {
    let element = event.target;
    if (!["input", "textarea"].includes(element.tagName.toLowerCase())) return;

    let enteredText = element.value?.trim() || "Empty";
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Entered text '${enteredText}' in field | XPath: ${xpath}`;
    saveAction(actionText);
}, true);

document.addEventListener("change", function (event) {
    let element = event.target;
    if (element.tagName.toLowerCase() !== "select") return;

    let selectedOption = element.options[element.selectedIndex]?.text.trim() || "Unknown Option";
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Selected '${selectedOption}' from dropdown | XPath: ${xpath}`;
    saveAction(actionText);
}, true);

document.addEventListener("click", function (event) {
    let element = event.target;
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Clicked on '${element.innerText?.trim() || element.tagName}' | XPath: ${xpath}`;
    saveAction(actionText);

    if (
        element.closest("button[type='submit'], input[type='submit'], button:not([type]), input[type='button']") ||
        element.closest("form button")
    ) {
        setTimeout(() => {
            const captured = new Set();

            // 1. Native invalid elements + selects + ARIA
            document.querySelectorAll("input:invalid, textarea:invalid, select:invalid, [aria-invalid='true']")
                .forEach(el => {
                    const xpath = getExactXPath(el);
                    const label = el.labels?.[0]?.innerText || el.name || el.id || el.placeholder || el.tagName;
                    const msg = el.validationMessage || "Validation failed";
                    console.log('⚠️ Native/ARIA-invalid element detected');
                    saveAction(`❌ Field '${label}' | XPath: ${xpath} | Message: "${msg}"`);
                    captured.add(el);
                });

            // 2. Error messages (labels, spans, etc.)
            const possibleErrors = document.querySelectorAll("[class*='error'], [class*='message'], .oxd-input-field-error-message");
            possibleErrors.forEach(errEl => {
                const msgText = errEl.innerText.trim();
                if (!msgText || msgText.length < 2) return;

                // Try to find the closest input/select/textarea, even if separated
                let inputEl = errEl.closest("label")?.htmlFor
                    ? document.getElementById(errEl.closest("label").htmlFor)
                    : null;

                if (!inputEl) {
                    inputEl = errEl.closest("div")?.querySelector("input, select, textarea, [role='combobox']");
                }

                if (!inputEl) {
                    // Try to find previous input in DOM flow
                    const previousInput = errEl.previousElementSibling;
                    if (previousInput && ["INPUT", "SELECT", "TEXTAREA"].includes(previousInput.tagName)) {
                        inputEl = previousInput;
                    }
                }

                if (inputEl && !captured.has(inputEl)) {
                    const xpath = getExactXPath(inputEl);
                    const label = inputEl.labels?.[0]?.innerText || inputEl.name || inputEl.id || inputEl.placeholder || inputEl.tagName;
                    console.log('⚠️ Error message mapped to input');
                    saveAction(`❌ Field '${label}' | XPath: ${xpath} | Message: "${msgText}"`);
                    captured.add(inputEl);
                } else if (!inputEl) {
                    // Log orphaned error message (optional)
                    const errorXPath = getExactXPath(errEl);
                    console.log('⚠️ Orphaned error message detected');
                    saveAction(`❌ Error Message (no input found) | XPath: ${errorXPath} | Message: "${msgText}"`);
                }
            });

        }, 300); 
    }
}, true);

