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
