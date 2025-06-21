console.log("✅ Action Tracker Content Script Loaded!");

// Queue to maintain correct action sequence
let actionsQueue = [];

// Load previous actions from storage when the page loads
chrome.storage.local.get({ actions: [] }, (data) => {
    actionsQueue = data.actions || [];
    console.log("🔄 Previous actions loaded:", actionsQueue.length);
});

// Store actions in storage while maintaining the correct order
function saveAction(action) {
    actionsQueue.push(action); // Maintain order

    chrome.storage.local.set({ actions: actionsQueue }, () => {
        console.log(`Saved: ${action}`);
    });
}

// Function to get XPath of an element
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

// Capture user actions
document.addEventListener("click", function (event) {
    let element = event.target;
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Clicked on '${element.innerText?.trim() || element.tagName}' | XPath: ${xpath}`;
    saveAction(actionText);
}, true);

// Capture text input
document.addEventListener("blur", function (event) {
    let element = event.target;
    if (!["input", "textarea"].includes(element.tagName.toLowerCase())) return;

    let enteredText = element.value?.trim() || "Empty";
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Entered text '${enteredText}' in field | XPath: ${xpath}`;
    saveAction(actionText);
}, true);

// Capture dropdown selections
document.addEventListener("change", function (event) {
    let element = event.target;
    if (element.tagName.toLowerCase() !== "select") return;

    let selectedOption = element.options[element.selectedIndex]?.text.trim() || "Unknown Option";
    let xpath = getExactXPath(element);
    if (!xpath) return;

    let actionText = `Selected '${selectedOption}' from dropdown | XPath: ${xpath}`;
    saveAction(actionText);
}, true);
