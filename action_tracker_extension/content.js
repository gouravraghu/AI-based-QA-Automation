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

document.addEventListener("click", function (event) {
    let element = event.target;
    let xpath = getExactXPath(element);
    if (!xpath) return;
    let actionText = `Clicked on '${element.innerText?.trim() || element.tagName}' | XPath: ${xpath}`;
    saveAction(actionText);
}, true);

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
