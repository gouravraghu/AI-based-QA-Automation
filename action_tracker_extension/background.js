chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadLogs") {
        (async () => {
            try {
                const data = await chrome.storage.local.get("actions");
                const actions = data.actions || [];

                if (actions.length === 0) {
                    sendResponse({ status: "No actions to download." });
                    return;
                }

                const textContent = actions.join("\n");
                const dataUrl = "data:text/plain;charset=utf-8," + encodeURIComponent(textContent);

                await chrome.downloads.download({
                    url: dataUrl,
                    filename: "user_actions.txt",
                    saveAs: true
                });

                await chrome.storage.local.set({ actions: [] });

                sendResponse({ status: "Download and clear successful." });
            } catch (err) {
                console.error("Error during download process:", err);
                sendResponse({ status: "Error: " + err.message });
            }
        })();
       
        return true;
    }
    
    if (request.action === "clearLogs") {
       debugger
        chrome.storage.local.remove(["actions", "shouldLog"], () => {
            if (chrome.runtime.lastError) {
                console.error("Error clearing logs:", chrome.runtime.lastError.message);
                sendResponse({ status: "Error clearing logs." });
            } else {
                console.log("Logs and flag cleared");
                sendResponse({ status: "Logs cleared successfully." });
            }
        });

   debugger
        return true;
    }
});
