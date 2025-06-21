chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadLogs") {
        (async () => {
            try {
                const data = await chrome.storage.local.get("actions");
                const actions = data.actions || [];

                if (actions.length === 0) {
                    sendResponse({ status: "No actions to upload." });
                    return;
                }

                // Send actions to backend for Gist upload and automation
                const response = await fetch('http://localhost:10000/upload-and-run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ actions })
                });

                const result = await response.json();

                if (result.success) {
                    await chrome.storage.local.set({ actions: [] });
                    sendResponse({ status: "Upload and automation successful.", gistId: result.gistId });
                } else {
                    sendResponse({ status: "Error: " + result.error });
                }
            } catch (err) {
                console.error("Error during upload process:", err);
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

//This code is load a web page content when extension is install
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("index.html")
    });
  });
