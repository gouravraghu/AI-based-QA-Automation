document.getElementById("start").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startLogging" }, (response) => {
            console.log(response?.status || "Start triggered");
            alert(response?.status || "Start triggered");
        });
    });
});

document.getElementById("download").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "downloadLogs" }, (response) => {
        console.log(response?.status || "Download triggered");
    });
});

document.getElementById("clear").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clearLogs" }, (response) => {
        console.log(response?.status || "Logs cleared");
    });
});
