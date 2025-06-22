document.getElementById("start").addEventListener("click", () => {
    setProgress("Logging started...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startLogging" }, (response) => {
            setProgress(response?.status || "Start triggered");
            console.log(response?.status || "Start triggered");
            alert(response?.status || "Start triggered");
        });
    });
});

document.getElementById("download").addEventListener("click", () => {
    setProgress("Uploading actions and generating script...");
    chrome.runtime.sendMessage({ action: "downloadLogs" }, (response) => {
        setProgress(response?.status || "Script generation triggered");
        console.log(response?.status || "Download triggered");
    });
});

document.getElementById("clear").addEventListener("click", () => {
    setProgress("Clearing logs...");
    chrome.runtime.sendMessage({ action: "clearLogs" }, (response) => {
        setProgress(response?.status || "Logs cleared");
        console.log(response?.status || "Logs cleared");
    });
});

// Add progress/status update logic
function setProgress(msg) {
    const progressDiv = document.getElementById('progress');
    if (progressDiv) progressDiv.textContent = msg;
}

// Listen for progress updates from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.progress) {
        setProgress(request.progress);
    }
});

// Only add event listener if the button exists in the DOM
const downloadScriptBtn = document.getElementById('downloadScript');
if (downloadScriptBtn) {
    downloadScriptBtn.addEventListener('click', () => {
        setProgress('Downloading generated script...');
        const a = document.createElement('a');
        a.href = 'http://localhost:10000/download-generated-spec';
        a.download = 'generated.spec.ts';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setProgress('Script downloaded!');
    });
}

document.getElementById("edit")?.addEventListener("click", () => {
    chrome.windows.create({
      url: "edit.html",
      type: "popup",
      width: 400,
      height: 600
  });
});